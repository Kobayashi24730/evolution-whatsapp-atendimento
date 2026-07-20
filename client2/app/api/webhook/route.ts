import { NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";

export async function POST(request: Request) {
    try {
        const body: any = await request.json();
        const evento = body.event?.toUpperCase();
        console.log("📥 [WEBHOOK CENTRAL] Evento recebido:", evento);

        // 1. Filtragem Flexível
        const eventosPermitidos = ["MESSAGES_UPSERT", "MESSAGES.UPSERT", "CONTACTS.UPDATE"];
        if (!eventosPermitidos.includes(evento)) {
            console.log(`⚠️ Webhook ignorado: Evento "${evento}" não é processado por esta rota.`);
            return NextResponse.json({ status: "ignorado", motivo: "evento_nao_suportado" });
        }

        const dadosArray = body.data;
        if (!dadosArray || !Array.isArray(dadosArray) || dadosArray.length === 0) {
            console.log("⚠️ Webhook ignorado: Array 'data' vazio ou inválido.");
            return NextResponse.json({ status: "ignorado", motivo: "dados_vazios" });
        }

        const primeiroDado = dadosArray[0];

        // =========================================================================
        // 👥 FLUXO A: CONTACTS.UPDATE (Garante Atendimento ou Atualiza Nome)
        // =========================================================================
        if (evento === "CONTACTS.UPDATE") {
            console.log("👥 Processando evento CONTACTS.UPDATE...");

            const remoteJid = primeiroDado.remoteJid || primeiroDado.id || primeiroDado.jid || primeiroDado.key?.remoteJid || "";
            const numeroCliente = remoteJid.includes("@") ? remoteJid.split("@")[0] : remoteJid;
            const nomeCliente = primeiroDado.pushName || primeiroDado.name || "Cliente sem Nome";

            if (!numeroCliente) {
                console.log("⚠️ Não foi possível extrair o número do contato no CONTACTS.UPDATE.");
                return NextResponse.json({ status: "ignorado", motivo: "numero_nao_encontrado" });
            }

            // 1. Verifica se já existe um atendimento ativo para este número
            let atendimentoActive = await prisma.atendimento.findFirst({
                where: {
                    clienteNumero: numeroCliente,
                    status: { in: ["ABERTO", "TRIAGEM", "EM_ATENDIMENTO"] }
                }
            });

            // 2. Se NÃO existe atendimento ativo, cria um agora!
            if (!atendimentoActive) {
                console.log(`🔨 [CONTACTS.UPDATE] Nenhum atendimento ativo encontrado. Criando para ${nomeCliente} (${numeroCliente})...`);
                atendimentoActive = await prisma.atendimento.create({
                    data: {
                        clienteNumero: numeroCliente,
                        clienteNome: nomeCliente,
                        status: "ABERTO",
                        mensagens: {
                            create: {
                                texto: "[Atendimento iniciado via atualização de contato/Sincronização]",
                                fromMe: false
                            }
                        }
                    }
                });
                console.log(`✅ Novo atendimento criado via CONTATOS com ID: ${atendimentoActive.id}`);

                // Dispara a mensagem de boas-vindas/protocolo
                const evolutionURL = process.env.EVOLUTION_API_URL || "http://evolution_api:8080";
                const instanceName = body.instance || process.env.EVOLUTION_INSTANCE_NAME || "gui";
                const apiKey = process.env.EVOLUTION_API_KEY || "7996256f-dfb9-4028-9fa3-1ed9a2f8b640";

                const protocolo = atendimentoActive.id.slice(-5).toUpperCase();
                const textoResposta = `Olá, ${nomeCliente}! Seu atendimento foi iniciado sob o protocolo nº #${protocolo}. Um atendente humano falará com você em breve.`;

                try {
                    await fetch(`${evolutionURL}/message/sendText/${instanceName}`, {
                        method: "POST",
                        headers: { 'Content-Type': 'application/json', "apikey": apiKey },
                        body: JSON.stringify({ number: remoteJid, text: textoResposta })
                    });
                    console.log("🚀 Resposta automática de protocolo enviada via Contatos!");
                } catch (err) {
                    console.error("❌ Erro ao enviar protocolo no fluxo de contatos:", err);
                }

            } else {
                // 3. Se JÁ existe atendimento, apenas garante que o nome está atualizado (caso o payload traga nome)
                if (primeiroDado.pushName || primeiroDado.name) {
                    console.log(`📝 Atendimento já ativo. Atualizando nome do cliente para "${nomeCliente}"...`);
                    await prisma.atendimento.updateMany({
                        where: {
                            clienteNumero: numeroCliente,
                            status: { in: ["ABERTO", "TRIAGEM", "EM_ATENDIMENTO"] }
                        },
                        data: { clienteNome: nomeCliente }
                    });
                } else {
                    console.log("ℹ️ Atendimento ativo e nenhuma alteração de nome recebida.");
                }
            }

            return NextResponse.json({ success: true, fluxo: "contacts_update_processado" });
        }

        // =========================================================================
        // 💬 FLUXO B: MESSAGES_UPSERT / MESSAGES.UPSERT (Recebimento de Mensagens)
        // =========================================================================
        const primeiraMensagem = primeiroDado;

        if (primeiraMensagem.key?.fromMe === true) {
            console.log("⚠️ Webhook ignorado: Mensagem enviada por mim mesmo (fromMe === true).");
            return NextResponse.json({ status: "ignorado", motivo: "enviada_por_mim" });
        }

        const remoteJid = primeiraMensagem.key?.remoteJid || "";
        const numeroCliente = remoteJid.split("@")[0];
        const nomeCliente = primeiraMensagem.pushName || "Cliente sem Nome";

        const textoMensagem = primeiraMensagem.message?.conversation ||
            primeiraMensagem.message?.extendedTextMessage?.text ||
            primeiraMensagem.text ||
            primeiraMensagem.message?.imageMessage?.caption ||
            primeiraMensagem.message?.videoMessage?.caption ||
            "[Mídia/Outro]";

        if (!numeroCliente) {
            console.log("❌ Erro: número do cliente ausente no remoteJid da mensagem.");
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
                        create: { texto: textoMensagem, fromMe: false }
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
            const instanceName = body.instance || process.env.EVOLUTION_INSTANCE_NAME || "gui";
            const apiKey = process.env.EVOLUTION_API_KEY || "7996256f-dfb9-4028-9fa3-1ed9a2f8b640";

            const protocolo = atendimentoActive.id.slice(-5).toUpperCase();
            const textoResposta = `Olá, ${nomeCliente}! Seu atendimento foi iniciado sob o protocolo nº #${protocolo}. Um atendente humano falará com você em breve.`;

            try {
                await fetch(`${evolutionURL}/message/sendText/${instanceName}`, {
                    method: "POST",
                    headers: { 'Content-Type': 'application/json', "apikey": apiKey },
                    body: JSON.stringify({ number: remoteJid, text: textoResposta })
                });
                console.log("🚀 Resposta automática de protocolo enviada com sucesso!");
            } catch (fetchError) {
                console.error("❌ Falha na conexão de envio com a Evolution API:", fetchError);
            }
        }

        return NextResponse.json({ success: true, fluxo: "mensagem_processada" });

    } catch (error) {
        console.error("💥 Erro crítico interno no processamento do webhook central:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}