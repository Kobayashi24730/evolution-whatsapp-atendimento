import { NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(request: Request) {
    try {
        const body: any = await request.json();

        // 1. Normaliza o evento para maiúsculo
        const evento = body.event?.toUpperCase();

        const eventosPermitidos = ["MESSAGES_UPSERT", "MESSAGES.UPSERT", "CONTACTS.UPDATE"];
        if (!eventosPermitidos.includes(evento)) {
            return NextResponse.json({ status: "ignorado", motivo: `evento_${evento}_nao_suportado` });
        }

        // 2. Normalização do payload de dados
        let primeiroDado = null;
        if (body.data) {
            if (Array.isArray(body.data)) {
                if (body.data.length === 0) {
                    return NextResponse.json({ status: "ignorado", motivo: "dados_array_vazio" });
                }
                primeiroDado = body.data[0];
            } else {
                primeiroDado = body.data;
            }
        }

        if (!primeiroDado) {
            return NextResponse.json({ status: "ignorado", motivo: "dados_nao_encontrados" });
        }

        // 3. Resolução robusta do JID do cliente
        const remoteJid =
            primeiroDado.key?.remoteJid ||
            primeiroDado.remoteJid ||
            primeiroDado.jid ||
            body.sender ||
            "";

        // 🚨 PROTEÇÕES DE ESCOPO
        if (remoteJid.includes("@lid")) {
            return NextResponse.json({ status: "ignorado", motivo: "identificador_interno_lid_ignorado" });
        }
        if (remoteJid.includes("@g.us")) {
            return NextResponse.json({ status: "ignorado", motivo: "evento_de_grupo_ignorado" });
        }
        if (remoteJid.includes("@status")) {
            return NextResponse.json({ status: "ignorado", motivo: "evento_de_status_ignorado" });
        }

        const numeroCliente = remoteJid.includes("@") ? remoteJid.split("@")[0] : remoteJid;

        if (!numeroCliente || numeroCliente.trim() === "" || numeroCliente.length < 8) {
            return NextResponse.json({ status: "ignorado", motivo: "numero_cliente_invalido_ou_curto" });
        }

        // ==========================================
        // FLUXO DE CONTATOS (CONTACTS.UPDATE)
        // Só atualiza o nome se o chat já existir! Evita criar chats fantasmas sem texto.
        // ==========================================
        if (evento === "CONTACTS.UPDATE") {
            const nomeCliente = primeiroDado.pushName || primeiroDado.name || primeiroDado.verifiedName;

            if (nomeCliente) {
                await prisma.atendimento.updateMany({
                    where: {
                        clienteNumero: numeroCliente,
                        status: { in: ["ABERTO", "TRIAGEM", "EM_ATENDIMENTO"] }
                    },
                    data: { clienteNome: nomeCliente }
                });
            }
            return NextResponse.json({ success: true, fluxo: "contacts_update_sincronizado" });
        }

        // ==========================================
        // FLUXO DE MENSAGENS (MESSAGES.UPSERT)
        // ==========================================
        if (primeiroDado.key?.fromMe === true) {
            return NextResponse.json({ status: "ignorado", motivo: "enviada_por_mim" });
        }

        // Identificador único da mensagem enviado pelo WhatsApp para evitar duplicação pura
        const messageId = primeiroDado.key?.id || primeiroDado.id || "";

        const nomeCliente = primeiroDado.pushName || primeiroDado.name || "Cliente sem Nome";

        const textoMensagem = primeiroDado.message?.conversation ||
            primeiroDado.message?.extendedTextMessage?.text ||
            primeiroDado.text ||
            primeiroDado.message?.imageMessage?.caption ||
            primeiroDado.message?.videoMessage?.caption ||
            "";

        if (!textoMensagem || textoMensagem.includes("Seu atendimento foi iniciado sob o protocolo")) {
            return NextResponse.json({ status: "ignorado", motivo: "mensagem_vazia_ou_sistema" });
        }

        // Trava de Duplicidade: Verifica se essa mensagem exata já foi salva para este cliente nos últimos segundos
        if (messageId) {
            const mensagemExistente = await prisma.mensagem.findFirst({
                where: {
                    texto: textoMensagem,
                    atendimento: {
                        clienteNumero: numeroCliente
                    },
                    timestamp: {
                        gte: new Date(Date.now() - 4000) // 4 segundos de janela anti-duplicação usando o campo correto
                    }
                }
            });
            if (mensagemExistente) {
                return NextResponse.json({ status: "ignorado", motivo: "mensagem_duplicada_bloqueada" });
            }
        }

        let atendimentoActive = await prisma.atendimento.findFirst({
            where: {
                clienteNumero: numeroCliente,
                status: { in: ["ABERTO", "TRIAGEM", "EM_ATENDIMENTO"] }
            }
        });

        let novoAtendimentoCriado = false;

        if (!atendimentoActive) {
            console.log(`🔨 Criando novo atendimento direto via Mensagem para ${numeroCliente}...`);
            atendimentoActive = await prisma.atendimento.create({
                data: {
                    clienteNumero: numeroCliente,
                    clienteNome: nomeCliente,
                    status: "ABERTO",
                    mensagens: {
                        create: { texto: textoMensagem, fromMe: false }
                    }
                }
            });
            novoAtendimentoCriado = true;
        } else {
            console.log(`📩 Adicionando mensagem real ao atendimento existente ID: ${atendimentoActive.id}`);
            await prisma.mensagem.create({
                data: {
                    atendimentoId: atendimentoActive.id,
                    texto: textoMensagem,
                    fromMe: false
                }
            });
        }

        // Se o atendimento acabou de nascer, dispara a mensagem automática com o protocolo correto
        if (novoAtendimentoCriado) {
            const evolutionURL = process.env.EVOLUTION_API_URL || "http://evolution_api:8080";
            const instanceName = body.instance || process.env.EVOLUTION_INSTANCE_NAME || "gui";
            const apiKey = process.env.EVOLUTION_API_KEY || "7996256f-dfb9-4028-9fa3-1ed9a2f8b640";

            const protocolo = atendimentoActive.id.slice(-5).toUpperCase();
            const textoResposta = `Olá, ${nomeCliente}! Seu atendimento foi iniciado sob o protocolo nº #${protocolo}. Um atendente humano falará com você em breve.`;

            try {
                const destinoJid = remoteJid.includes("@") ? remoteJid : `${remoteJid}@s.whatsapp.net`;
                await fetch(`${evolutionURL}/message/sendText/${instanceName}`, {
                    method: "POST",
                    headers: { 'Content-Type': 'application/json', "apikey": apiKey },
                    body: JSON.stringify({
                        whatsappId: destinoJid,
                        textMessage: { text: textoResposta },
                        options: { checkContact: false }
                    })
                });
            } catch (fetchError) {
                console.error("❌ Falha ao enviar protocolo no fluxo de mensagem:", fetchError);
            }
        }

        return NextResponse.json({ success: true, fluxo: "mensagem_processada" });

    } catch (error) {
        console.error("💥 Erro crítico interno no webhook central:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}