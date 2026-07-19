import { NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";

export async function POST(request: Request) {
    try {
        const body: any = await request.json();
        const evento = body.event?.toUpperCase();
        console.log("📥 RECEBI WEBHOOK DA EVOLUTION!! Evento:", evento);

        if (evento !== "MESSAGES_UPSERT") {
            console.log("⚠️ Webhook ignorado: Evento não é MESSAGES_UPSERT. Recebido:", evento);
            return NextResponse.json({ status: "ignorado", motivo: "evento_nao_suportado" });
        }

        const mensagemArray = body.data;
        if (!mensagemArray || !Array.isArray(mensagemArray) || mensagemArray.length === 0) {
            console.log("⚠️ Webhook ignorado: mensagemArray vazio ou inválido.");
            return NextResponse.json({ status: "ignorado", motivo: "dados_vazios" });
        }

        const primeiraMensagem = mensagemArray[0];
        console.log("🔍 Dados da primeira mensagem recebida:", {
            fromMe: primeiraMensagem.key?.fromMe,
            remoteJid: primeiraMensagem.key?.remoteJid,
            pushName: primeiraMensagem.pushName
        });

        // 🚨 O PROVÁVEL VILÃO: Se você estiver testando enviando mensagem de você para você mesmo,
        // ou se o mock do PowerShell enviou fromMe: true, ele vai barrar aqui.
        if (primeiraMensagem.key?.fromMe === true) {
            console.log("⚠️ Webhook ignorado: Mensagem enviada por mim mesmo (fromMe === true).");

            // Mesmo ignorando, vamos ver se tem algo no banco pra desencargo
            const checagemBanco = await prisma.atendimento.findMany();
            console.log("📊 Conteúdo do banco no descarte:", checagemBanco.length, "registros.");

            return NextResponse.json({ status: "ignorado", motivo: "enviada_por_mim" });
        }

        const remoteJid = primeiraMensagem.key?.remoteJid || "";
        const numeroCliente = remoteJid.split("@")[0];
        const nomeCliente = primeiraMensagem.pushName || "Cliente sem Nome";
        const textoMensagem = primeiraMensagem.message?.conversation ||
            primeiraMensagem.message?.extendedTextMessage?.text ||
            "[Mídia/Outro]";

        if (!numeroCliente) {
            console.log("❌ Erro: número do cliente inválido ou ausente no remoteJid.");
            return NextResponse.json({ status: "erro", motivo: "numero_invalido" }, { status: 400 });
        }

        let atendimentoActive = await prisma.atendimento.findFirst({
            where: {
                clienteNumero: numeroCliente,
                status: { in: ["ABERTO", "TRIAGEM", "EM_ATENDIMENTO"] }
            }
        });

        let novoAtendimentoCriado = false;

        if (!atendimentoActive) {
            console.log(`🔨 Criando novo atendimento para ${nomeCliente} (${numeroCliente})...`);
            atendimentoActive = await prisma.atendimento.create({
                data: {
                    clienteNumero: numeroCliente,
                    clienteNome: nomeCliente,
                    status: "ABERTO",
                    mensagens: {
                        create: {
                            texto: textoMensagem,
                            fromMe: false
                        }
                    }
                }
            });
            novoAtendimentoCriado = true;
            console.log(`✅ Novo atendimento criado com ID: ${atendimentoActive.id}`);
        } else {
            console.log(`🔨 Vinculando mensagem ao atendimento existente ID: ${atendimentoActive.id}`);
            await prisma.mensagem.create({
                data: {
                    atendimentoId: atendimentoActive.id,
                    texto: textoMensagem,
                    fromMe: false
                }
            });
            console.log(`📩 Nova mensagem adicionada ao atendimento de: ${nomeCliente}`);
        }

        if (novoAtendimentoCriado) {
            const evolutionURL = process.env.EVOLUTION_API_URL || "http://evolution_api:8080";
            const instanceName = process.env.EVOLUTION_INSTANCE_NAME || "gui";
            const apiKey = process.env.EVOLUTION_API_KEY || "7996256f-dfb9-4028-9fa3-1ed9a2f8b640";

            const protocolo = atendimentoActive.id.slice(-5).toUpperCase();
            const textoResposta = `Olá, ${nomeCliente}! Seu atendimento foi iniciado sob o protocolo nº #${protocolo}. Um atendente humano falará com você em breve.`;

            try {
                const responseEvolution = await fetch(`${evolutionURL}/message/sendText/${instanceName}`, {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                        "apikey": apiKey
                    },
                    body: JSON.stringify({
                        number: numeroCliente,
                        text: textoResposta,
                        delay: 1000
                    })
                });

                if (!responseEvolution.ok) {
                    console.error(`❌ Erro Evolution API status: ${responseEvolution.status}`);
                } else {
                    console.log("🚀 Resposta automatica enviada via Evolution com sucesso!");
                }
            } catch (fetchError) {
                console.error("❌ Falha na conexão de envio com a Evolution API:", fetchError);
            }
        }

        // Confirmação final caso passe por todo o fluxo
        const checagemBancoSucesso = await prisma.atendimento.findMany();
        console.log("📊 FINAL DO FLUXO - Sucesso! Banco agora contém:", JSON.stringify(checagemBancoSucesso, null, 2));

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Erro interno no processamento do webhook:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}