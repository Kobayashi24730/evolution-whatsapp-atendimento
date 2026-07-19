import { NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";

export async function POST(request: Request) {
    try {
        const body: any = await request.json();

        // Garante que pega o evento independente de maiúsculo/minúsculo
        const evento = body.event?.toUpperCase();
        console.log("RECEBI WEBHOOK DA EVOLUTION!! Evento:", evento);

        if (evento !== "MESSAGES_UPSERT") {
            return NextResponse.json({ status: "ignorado", motivo: "evento_nao_suportado" });
        }

        // A Evolution envia os dados das mensagens dentro de uma Array no 'data'
        const mensagemArray = body.data;
        if (!mensagemArray || !Array.isArray(mensagemArray) || mensagemArray.length === 0) {
            return NextResponse.json({ status: "ignorado", motivo: "dados_vazios" });
        }

        const primeiraMensagem = mensagemArray[0];

        // Se a mensagem foi enviada por você através do celular, ignora para não criar chat consigo mesmo
        if (primeiraMensagem.key?.fromMe === true) {
            return NextResponse.json({ status: "ignorado", motivo: "enviada_por_mim" });
        }

        // Tratamento dos dados extraídos do primeiro item da lista
        const remoteJid = primeiraMensagem.key?.remoteJid || "";
        const numeroCliente = remoteJid.split("@")[0]; // Remove o '@s.whatsapp.net' se necessário
        const nomeCliente = primeiraMensagem.pushName || "Cliente sem Nome";

        // Captura o texto tratando os formatos comuns da Evolution
        const textoMensagem = primeiraMensagem.message?.conversation ||
            primeiraMensagem.message?.extendedTextMessage?.text ||
            "[Mídia/Outro formato]";

        console.log(`Processando mensagem de ${nomeCliente} (${numeroCliente}): ${textoMensagem}`);

        // Evita processar requisições sem número de cliente válido
        if (!numeroCliente) {
            return NextResponse.json({ status: "erro", motivo: "numero_invalido" }, { status: 400 });
        }

        // Busca atendimento aberto
        let atendimentoAberto = await prisma.atendimento.findFirst({
            where: {
                clienteNumero: numeroCliente,
                status: {
                    in: ["ABERTO", "TRIAGEM", "EM_ATENDIMENTO"]
                }
            }
        });

        if (!atendimentoAberto) {
            atendimentoAberto = await prisma.atendimento.create({
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
            console.log(`✅ Novo atendimento e mensagem salvos para: ${nomeCliente}`);
        } else {
            await prisma.mensagem.create({
                data: {
                    atendimentoId: atendimentoAberto.id,
                    texto: textoMensagem,
                    fromMe: false
                }
            });
            console.log(`📩 Nova mensagem adicionada ao atendimento existente de: ${nomeCliente}`);
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Erro no webhook:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}