import { NextResponse } from "next/server";
import {validateSession} from "@/libs/auth";
import { prisma } from "@/libs/prisma";

export async function GET(request: Request) {
    const session = await validateSession();
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    try {
        const {searchParams} = new URL(request.url); //? pega os params da url
        const atendimentoId = searchParams.get("atendimentoId"); //? usamos o metodo get para buscar o atendimentoId no searchParams
        //? verificamos se existe as mensagens do atendimentoId e devolvemos
        const data = await prisma.mensagem.findMany({
            where: {
               ...(atendimentoId && {atendimentoId}),
            }
        });
        return NextResponse.json({ message: "success to get mensagens", data: data }, { status: 200 });
    } catch (error) {
        console.error("Failed to get mensagens, error line: ", error);
        return NextResponse.json({
            error: "Internal Server Error",
            details: error instanceof Error ? error.message : "Unknown error"
        },{ status: 500 });
    }
}