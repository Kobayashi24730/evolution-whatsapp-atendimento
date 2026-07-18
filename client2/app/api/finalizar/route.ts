import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/libs/prisma";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const atendimentoID = body.atendimentoId || body.atendimentoID;
        if (!atendimentoID) {
            return NextResponse.json({ message: "Missing atendimentoID" }, { status: 400 });
        }
        const response = await prisma.atendimento.update({
            where: { id: atendimentoID },
            data: {
                status: "FINALIZADO"
            }
        });

        const evolutionIP = "http://host.docker.internal:8080";
        const instance_name = "gui";
        const API_KEY_SECERT = "0184C930D764-46AA-A42D-4831B939DDA7";

        const evo_response = await fetch(`${evolutionIP}/message/sendText/${instance_name}`, {
            method: "POST",
            headers: { 'Content-Type': 'application/json', apikey: API_KEY_SECERT },
            body: JSON.stringify({
                number: response.clienteNumero.split('@')[0],
                text: "Este atendimento foi encerrado. Obrigado pelo contato! Se precisar de algo mais, basta enviar uma nova mensagem.",
                delay: 1200
            })
        });

        return NextResponse.json({ success: true, message: "Atendimento finalizado com sucesso" });
    } catch (err) {
        console.error("Failed to post, error line: ", err);
        return NextResponse.json({
            error: "Internal Server Error",
            details: err instanceof Error ? err.message : err
        }, { status: 500 });
    }
}