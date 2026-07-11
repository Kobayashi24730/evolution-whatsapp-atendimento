import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/libs/prisma";


export async function GET(request: Request) {
    try {
        const {searchParams} = new URL(request.url);
        const atendimentoId = searchParams.get("atendimentoId");
        const data = await prisma.mensagem.findMany({
            where: {
               ...(atendimentoId && {atendimentoId}),
            }
        });
        return NextResponse.json({ message: "success to get menssagem", data: data }, { status: 200 });
    } catch (error) {
        console.error("Failed to get menssagens, error line: ", error);
        return NextResponse.json({
            error: "Internal Server Error",
            details: error instanceof Error ? error.message : "Unknown error"
        },{ status: 500 });
    }
}