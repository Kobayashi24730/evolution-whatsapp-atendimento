import { NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";
import { validateSession } from "@/libs/auth";

export async function GET() {
  try {
    const session = await validateSession();

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userLogado = (session as any)?.user?.name ?? "Atendente";

    // Cria as datas de início e fim do dia atual em UTC para evitar falhas no Postgres
    const agora = new Date();
    const inicioDoDia = new Date(Date.UTC(agora.getUTCFullYear(), agora.getUTCMonth(), agora.getUTCDate(), 0, 0, 0, 0));
    const fimDoDia = new Date(Date.UTC(agora.getUTCFullYear(), agora.getUTCMonth(), agora.getUTCDate(), 23, 59, 59, 999));

    const [totalCriadosHoje, totalFinalizadosHoje, totalAbertosAtualmente] = await Promise.all([
      prisma.atendimento.count({
        where: {
          createdAt: {
            gte: inicioDoDia,
            lte: fimDoDia,
          },
        },
      }),
      prisma.atendimento.count({
        where: {
          dataEncerramento: {
            gte: inicioDoDia,
            lte: fimDoDia,
          },
        },
      }),
      prisma.atendimento.count({
        where: {
          dataEncerramento: null,
        },
      }),
    ]);

    return NextResponse.json({
      totalCriadosHoje,
      totalAbertos: totalAbertosAtualmente,
      totalFinalizados: totalFinalizadosHoje,
      atendenteName: userLogado,
    });
  } catch (err: any) {
    console.error("====== ERRO DOCKER PRISMA ======");
    console.error(err);

    // Retorna a mensagem de erro exata no JSON para podermos ler no navegador
    return NextResponse.json(
      { 
        message: "Failed to fetch stats", 
        errorDetails: err?.message || String(err)
      },
      { status: 500 }
    );
  }
}