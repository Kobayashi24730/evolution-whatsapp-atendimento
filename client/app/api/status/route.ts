import { NextResponse } from "next/server";
import {validateSession} from "@/libs/auth";
import { prisma } from "@/libs/prisma";
import { StatusAtendimento } from "@prisma/client";

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
        const validStatus = Object.values(StatusAtendimento);
        if (!validStatus.includes(status as StatusAtendimento)) {
            return NextResponse.json({ error: `Status inválido. Valores aceitos: ${validStatus.join(", ")}` }, { status: 400 });
        }
        const updated = await prisma.atendimento.update({
            where: {
                id: id
            }, data: {
                status: status as StatusAtendimento
            }
        });
        return NextResponse.json({ success: true, updated });
    } catch (err) {
        return NextResponse.json({ error: "Erro ao atualizar status" }, { status: 500 });
    }
}