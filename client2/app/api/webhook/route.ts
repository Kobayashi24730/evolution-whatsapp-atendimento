import { NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";

export async function POST(request: Request) {
    const data = await request.json();
    if (data.event === 'messages.upsert') {
        const message = data.data;
        const numero = message.key.remoteJid;
        const texto = message.message?.conversation;

        if (message.key.fromMe === true) {
            return NextResponse.json({ status: "ignorado (enviado por mim)" })
        }

        let atendimento = await prisma.atendimento.findFirst({
            where: { clienteNumero: numero, status: {in: ["ABERTO", "TRIAGEM", "EM_ATENDIMENTO"]}}
        });

        if (!atendimento) {
            atendimento = await prisma.atendimento.upsert({
                where: { clienteNumero: numero },
                update: {},
                create: {
                    clienteNumero: numero,
                    clienteNome: data.instanceName,
                },
            });
        }

        await prisma.mensagem.create({
            data: {
                atendimentoId: atendimento.id,
                texto: texto || "",
                fromMe: message.key.fromMe,
            }
        });

        const evolutionIP = process.env.EVOLUTION_API_URL || "http://host.docker.internal:8080 ";
        const instance_name = process.env.EVOLUTION_INSTANCE_NAME || "gui";
        const API_KEY_SECERT = process.env.EVOLUTION_API_KEY || "7996256f-dfb9-4028-9fa3-1ed9a2f8b640";
        const nomeCliente = data.instanceName;
        const textoRespostaAutomatica = `Olá, ${nomeCliente}! Seu atendimento foi iniciado sob o protocolo nº ${atendimento.id.slice(0, 5)}. Um atendente humano falará com você em breve.`;

        const responseEvolution = await fetch(`${evolutionIP}/message/sendText/${instance_name}`, {
            method: "POST",
            headers: {'Content-Type': 'application/json', "apikey": API_KEY_SECERT},
            body: JSON.stringify({
                number: atendimento.clienteNumero.split('@')[0],
                text: textoRespostaAutomatica,
                delay: 1200
            })
        });

        if (!responseEvolution.ok) {
            const errorStatus = responseEvolution.status;
            const errorText = await responseEvolution.text();
            console.error(`❌ Erro ao enviar para Evolution. Status: ${errorStatus} | Resposta:`, errorText);
        } else {
            console.log("🚀 Resposta enviada para a Evolution com sucesso!");
        }
    }

    return NextResponse.json({ ok: true });
}