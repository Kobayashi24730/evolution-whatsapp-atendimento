import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/libs/prisma";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const clienteNumero = searchParams.get("clienteNumero");
        const clienteNome = searchParams.get("clienteNome");
        const userId = searchParams.get("userId");

        const atendimento = await prisma.atendimento.findMany({
            where: {
                status: ["ABERTO", "TRIAGEM", "EM_ATENDIMENTO"],
                ...(clienteNumero && {clienteNumero}),
                ...(clienteNome && {clienteNome}),
                ...(userId && {userId})
            }
        });
        return NextResponse.json({ message: "Success to get atendimentos", data: atendimento }, { status: 200 });
    } catch (error) {
        console.error("Failed to post, error line: ", error);
        return NextResponse.json({
            error: "Internal Server Error",
            details: error instanceof Error ? error.message : error
        }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { clienteNumero, clienteNome, userId, by } = await request.json();
        if (!clienteNumero || !clienteNome || !userId || by) {
            return NextResponse.json({ message: "Missing clienteNumero, clienteNome or userId" }, { status: 400 })
        }
        const atendimento = await prisma.atendimento.create({
            data: {
                clienteNumero,
                clienteNome,
                userId,
            }
        });
        return NextResponse.json({ message: "Success to create atendimento", data: atendimento }, { status: 201 });
    } catch (error) {
        console.error("Failed to post, error line: ", error);
        return NextResponse.json({
            error: "Internal Server Error",
            details: error instanceof Error ? error.message : error
        }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const { mensagens, atendimentoId, by} = await request.json();
        if (!mensagens) {
            return NextResponse.json({ message: "Missing message" }, { status: 400 });
        }
        const data = await prisma.atendimento.update({
            where: {
                id: atendimentoId
            }, data: {
                status: "EM ANDAMENTO",
                mensagens: {
                    create: {
                        texto: mensagens,
                        fromMe: Boolean(by)
                    }
                }
            },
            include: {
                mensagens: true
            },
        });
        return NextResponse.json({ message: "Success to update message", data: data }, { status: 200 });
    } catch (error) {
        console.error("Failed to message post, error line: ", error);
        return NextResponse.json({
            error: "Internal Serve Error",
            details: error instanceof Error ? error.message : error
        }, { status: 500 });
    }
}
