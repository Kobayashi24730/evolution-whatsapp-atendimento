import { NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";
import { validateSession } from "@/libs/auth";

export async function GET() {
    const session = await validateSession();
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    try {
        const inicioDoDia = new Date();
        inicioDoDia.setHours(0, 0, 0, 0);

        const fimDoDia = new Date();
        fimDoDia.setHours(23, 59, 59, 999);

        const atendimentosCriadosHoje = await prisma.atendimento.findMany({
            where: {
                createdAt: {
                    gte: inicioDoDia,
                    lte: fimDoDia
                }
            }
        });
        const atendimentosFinalizadosHoje = await prisma.atendimento.findMany({
            where: {
                dataEncerramento: {
                    gte: inicioDoDia,
                    lte: fimDoDia
                }
            }
        });

        return NextResponse.json({ 
            totalAtendimentos: atendimentosCriadosHoje.length + atendimentosFinalizadosHoje.length, 
            totalAbertos: atendimentosCriadosHoje, 
            totalFinalizados: atendimentosFinalizadosHoje 
        });
    } catch (err) {
        console.error("Falha ao buscar atendimentos: ", err);
        return NextResponse.json({ message: "Failed in create user"}, {status: 500});
    }
}