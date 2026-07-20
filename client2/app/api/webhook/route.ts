import { NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";

// Função utilitária para dar uma pequena pausa e esperar o banco respirar
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(request: Request) {
    try {
        const body: any = await request.json();
        const evento = body.event?.toUpperCase();

        const eventosPermitidos = ["MESSAGES_UPSERT", "MESSAGES.UPSERT", "CONTACTS.UPDATE"];
        if (!eventosPermitidos.includes(evento)) {
            return NextResponse.json({ status: "ignorado", motivo: "evento_nao_suportado" });
        }

        const dadosArray = body.data;
        if (!dadosArray || !Array.isArray(dadosArray) || dadosArray.length === 0) {
            return NextResponse.json({ status: "ignorado", motivo: "dados_vazios" });
        }

        const primeiroDado = dadosArray[0];

        // ==========================================
        // FLUXO DE CONTATOS (CONTACTS.UPDATE)
        // ==========================================
        if (evento === "CONTACTS.UPDATE") {
            const remoteJid =
                primeiroDado.key?.remoteJid ||
                primeiroDado.remoteJid ||
                primeiroDado.jid ||
                primeiroDado.id ||
                "";
            const numeroCliente = remoteJid.includes("@") ? remoteJid.split("@")[0] : remoteJid;
            const nomeCliente = primeiroDado.pushName || primeiroDado.name || primeiroDado.verifiedName || "Cliente sem Nome";

            if (!numeroCliente) return NextResponse.json({ status: "ignorado", motivo: "numero_nao_encontrado" });

            let atendimentoActive = await prisma.atendimento.findFirst({
                where: {
                    clienteNumero: numeroCliente,
                    status: { in: ["ABERTO", "TRIAGEM", "EM_ATENDIMENTO"] }
                }
            });

            if (!atendimentoActive) {
                console.log(`🔨 [Contatos] Criando atendimento preventivo para ${numeroCliente}`);
                atendimentoActive = await prisma.atendimento.create({
                    data: {
                        clienteNumero: numeroCliente,
                        clienteNome: nomeCliente,
                        status: "ABERTO",
                        mensagens: {
                            create: {
                                texto: "[Atendimento iniciado por interação do cliente]",
                                fromMe: false
                            }
                        }
                    }
                });

                const evolutionURL = process.env.EVOLUTION_API_URL || "http://evolution_api:8080";
                const instanceName = body.instance || process.env.EVOLUTION_INSTANCE_NAME || "gui";
                const apiKey = process.env.EVOLUTION_API_KEY || "7996256f-dfb9-4028-9fa3-1ed9a2f8b640";
                const protocolo = atendimentoActive.id.slice(-5).toUpperCase();
                const textoResposta = `Olá, ${nomeCliente}! Seu atendimento foi iniciado sob o protocolo nº #${protocolo}. Um atendente humano falará com você em breve.`;

                try {
                    // Adaptado para usar whatsappId/text padrão v2 para evitar rejeição
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
                } catch (err) {
                    console.error("Erro ao enviar protocolo no fluxo de contatos:", err);
                }

            } else {
                if (primeiroDado.pushName || primeiroDado.name) {
                    await prisma.atendimento.updateMany({
                        where: {
                            clienteNumero: numeroCliente,
                            status: { in: ["ABERTO", "TRIAGEM", "EM_ATENDIMENTO"] }
                        },
                        data: { clienteNome: nomeCliente }
                    });
                }
            }

            return NextResponse.json({ success: true, fluxo: "contacts_update_processado" });
        }

        // ==========================================
        // FLUXO DE MENSAGENS (MESSAGES.UPSERT)
        // ==========================================
        const primeiraMensagem = primeiroDado;

        // Ignora mensagens enviadas pelo próprio bot/sistema para evitar loops
        if (primeiraMensagem.key?.fromMe === true) {
            return NextResponse.json({ status: "ignorado", motivo: "enviada_por_mim" });
        }

        // ✅ CORREÇÃO AQUI: Aplica a mesma ordem de prioridade para não pegar o Message ID por engano
        const remoteJid =
            primeiraMensagem.key?.remoteJid ||
            primeiraMensagem.remoteJid ||
            primeiraMensagem.jid ||
            "";

        const numeroCliente = remoteJid.includes("@") ? remoteJid.split("@")[0] : remoteJid;
        const nomeCliente = primeiraMensagem.pushName || primeiraMensagem.name || "Cliente sem Nome";

        const textoMensagem = primeiraMensagem.message?.conversation ||
            primeiraMensagem.message?.extendedTextMessage?.text ||
            primeiraMensagem.text ||
            primeiraMensagem.message?.imageMessage?.caption ||
            primeiraMensagem.message?.videoMessage?.caption ||
            "";

        // Se a mensagem for vazia ou for o próprio texto de inicialização do sistema, ignoramos para não sujar a timeline
        if (!textoMensagem || textoMensagem.includes("Seu atendimento foi iniciado sob o protocolo")) {
            return NextResponse.json({ status: "ignorado", motivo: "mensagem_vazia_ou_sistema" });
        }

        if (!numeroCliente) {
            return NextResponse.json({ status: "erro", motivo: "numero_invalido" }, { status: 400 });
        }

        // 1ª tentativa de buscar atendimento ativo
        let atendimentoActive = await prisma.atendimento.findFirst({
            where: {
                clienteNumero: numeroCliente,
                status: { in: ["ABERTO", "TRIAGEM", "EM_ATENDIMENTO"] }
            }
        });

        // 🚨 ANTI-CONCORRÊNCIA: Se não achou, espera 500ms e tenta ler de novo
        if (!atendimentoActive) {
            console.log(`⏳ Atendimento não achado de primeira para ${numeroCliente}. Aguardando sincronização...`);
            await delay(500);
            atendimentoActive = await prisma.atendimento.findFirst({
                where: {
                    clienteNumero: numeroCliente,
                    status: { in: ["ABERTO", "TRIAGEM", "EM_ATENDIMENTO"] }
                }
            });
        }

        let novoAtendimentoCriado = false;

        if (!atendimentoActive) {
            // Se mesmo após o delay o atendimento não existir, então criamos do zero com a mensagem real do cliente!
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
            // Se o atendimento já existia, apenas adicionamos a mensagem recebida a ele
            console.log(`📩 Adicionando mensagem real ao atendimento existente ID: ${atendimentoActive.id}`);
            await prisma.mensagem.create({
                data: {
                    atendimentoId: atendimentoActive.id,
                    texto: textoMensagem,
                    fromMe: false
                }
            });
        }

        // Envia o protocolo apenas se o atendimento foi criado AGORA pelo fluxo de mensagens
        if (novoAtendimentoCriado) {
            const evolutionURL = process.env.EVOLUTION_API_URL || "http://evolution_api:8080";
            const instanceName = body.instance || process.env.EVOLUTION_INSTANCE_NAME || "gui";
            const apiKey = process.env.EVOLUTION_API_KEY || "7996256f-dfb9-4028-9fa3-1ed9a2f8b640";

            const protocolo = atendimentoActive.id.slice(-5).toUpperCase();
            const textoResposta = `Olá, ${nomeCliente}! Seu atendimento foi iniciado sob o protocolo nº #${protocolo}. Um atendente humano falará com você em breve.`;

            try {
                // ✅ Ajustado payload de envio automático para se alinhar à v2
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