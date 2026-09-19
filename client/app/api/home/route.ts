import { NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";
import { validateSession } from "@/libs/auth";

export async function GET() {
  const session = await validateSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const userLogado = session.user.name;
    const inicioDoDia = new Date();
    inicioDoDia.setHours(0, 0, 0, 0);

    const fimDoDia = new Date();
    fimDoDia.setHours(23, 59, 59, 999);

    // Contagem de atendimentos criados hoje
    const totalCriadosHoje = await prisma.atendimento.count({
      where: {
        createdAt: {
          gte: inicioDoDia,
          lte: fimDoDia,
        },
      },
    });

    // Contagem de atendimentos finalizados hoje
    const totalFinalizadosHoje = await prisma.atendimento.count({
      where: {
        dataEncerramento: {
          gte: inicioDoDia,
          lte: fimDoDia,
        },
      },
    });

    // Contagem de atendimentos que continuam ABERTOS atualmente 
    const totalAbertosAtualmente = await prisma.atendimento.count({
      where: {
        dataEncerramento: null,
      },
    });

    return NextResponse.json({
      totalCriadosHoje,
      totalAbertos: totalAbertosAtualmente,
      totalFinalizados: totalFinalizadosHoje,
      atendenteName: userLogado
    });
  } catch (err) {
    console.error("Falha ao buscar estatísticas de atendimentos: ", err);
    return NextResponse.json(
      { message: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}