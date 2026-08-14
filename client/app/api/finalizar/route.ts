import { NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";
import {validateSession} from "@/libs/auth";

export async function POST(request: Request) {
    const session = await validateSession();
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
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

        const evolutionIP = process.env.EVOLUTION_IP || "http://localhost:8080";
        const instance_name = process.env.INSTANCE_NAME || "anonimo";
        const API_KEY_SECERT = process.env.API_KEY_SECERT || "";

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