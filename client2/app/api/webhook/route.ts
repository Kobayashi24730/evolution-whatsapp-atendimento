import { NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";

export async function POST(request: Request) {
    const data = await request.json();
    if (data.event === 'messages.upsert') {
        const message = data.data;
        const numero = message.key.remoteJid;
        const texto = message.message?.conversation;

        const atendimento = await prisma.atendimento.upsert({
            where: { clienteNumero: numero },
            update: {},
            create: {
                clienteNumero: numero,
                clienteNome: data.instanceName,
            },
        });

        await prisma.mensagem.create({
            data: {
                atendimentoId: atendimento.id,
                texto: texto || "",
                fromMe: message.key.fromMe,
            }
        });
    }

    return NextResponse.json({ ok: true });
}