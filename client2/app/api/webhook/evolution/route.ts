import { NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";
export async function POST(request: Request) {
    try {
        const body: any = await request.json();
        console.log("RECEBI WEBHOOK DA EVOLUTION!! Evento:", body.event);
        if (body.event !== "messages.upsert" || body.data?.key?.fromMe === true) {
            return NextResponse.json({ status: "ignorado" });
        }

        // 2. Extração dos dados limpos da Evolution
        const numeroCliente = body.data.key.remoteJid;
        const nomeCliente = body.data.pushName || "Cliente sem Nome";
        const textoMensagem = body.data.message?.conversation || body.data.message?.extendedTextMessage?.text || "";

        // 3. Checar se já existe um atendimento ativo (Não finalizado) para este número
        // Buscando por "ABERTO" ou "EM_ATENDIMENTO" dependendo do que você adotar no seu painel
        let atendimentoAberto = await prisma.atendimento.findFirst({
            where: {
                clienteNumero: numeroCliente,
                status: {
                    in: ["ABERTO", "TRIAGEM", "EM_ATENDIMENTO"] // Evita abrir ticket duplicado se já estiver nessas fases
                }
            }
        });

        // 4. Se não existir, criamos o Atendimento e adicionamos a mensagem dentro dele
        if (!atendimentoAberto) {
            atendimentoAberto = await prisma.atendimento.create({
                data: {
                    clienteNumero: numeroCliente,
                    clienteNome: nomeCliente,
                    status: "ABERTO", // Status padrão do seu schema
                    mensagens: {
                        create: {
                            texto: textoMensagem,
                            fromMe: false // Indica que veio do cliente
                        }
                    }
                }
            });
            console.log(`✅ Novo atendimento e mensagem salvos para: ${nomeCliente}`);
        } else {
            // 5. Se o atendimento JÁ EXISTIR, apenas inserimos a nova mensagem na timeline dele
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