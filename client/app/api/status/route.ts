import { NextResponse } from "next/server";
import {validateSession} from "@/libs/auth";
import { prisma } from "@/libs/prisma";

export async function PUT(request: Request) {
    const session = await validateSession();
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    try {
        const { status, id } = await request.json();
        if (!status || !id) {
            return NextResponse.json({ error: "Status e ID são obrigatórios" }, { status: 400 });
        }
        const updated = await prisma.atendimento.update({
            where: {
                id: id
            }, data: {
                status: status
            }
        });
        return NextResponse.json({ success: true, updated });
    } catch (err) {
        return NextResponse.json({ error: "Erro ao atualizar status" }, { status: 500 });
    }
}