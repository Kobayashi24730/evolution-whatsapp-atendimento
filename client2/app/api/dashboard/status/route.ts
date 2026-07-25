// app/api/dashboard/stats/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";

export async function GET() {
    try {
        // Executa todas as consultas de agregados em paralelo usando o schema exato
        const [
            totalAbertos,
            finalizados,
            aguardando,
            chamadosFila
        ] = await Promise.all([
            // Status padrões conforme seu modelo ("ABERTO", "FINALIZADO", "EM_ATENDIMENTO")
            prisma.atendimento.count({
                where: { status: { in: ["ABERTO", "EM_ATENDIMENTO", "TRIAGEM"] } }
            }),
            prisma.atendimento.count({
                where: { status: { in: ["FINALIZADO", "CONCLUIDO"] } }
            }),
            prisma.atendimento.count({
                where: { status: { in: ["AGUARDANDO", "AGUARDANDO_HUMANO"] } }
            }),
            prisma.atendimento.findMany({
                where: {
                    status: { in: ["ABERTO", "TRIAGEM", "AGUARDANDO_HUMANO"] }
                },
                take: 5,
                orderBy: { createdAt: "asc" },
                select: {
                    id: true,
                    clienteNome: true,
                    clienteNumero: true,
                    aba: true,
                    createdAt: true,
                },
            }),
        ]);

        const agora = new Date().getTime();

        // Mapeamento seguro da fila crítica sem risco de quebrar no tempo/data
        const filaCritica = chamadosFila.map((item) => {
            const dataCriacao = item.createdAt ? new Date(item.createdAt).getTime() : agora;
            const minutosEspera = Math.max(0, Math.floor((agora - dataCriacao) / (1000 * 60)));

            let tempoEsperaFormatado = `${minutosEspera} min`;
            if (minutosEspera >= 60) {
                const horas = Math.floor(minutosEspera / 60);
                const mins = minutosEspera % 60;
                tempoEsperaFormatado = `${horas}h ${mins}m`;
            }

            // Prioriza o nome, se não tiver usa o número do WhatsApp/Cliente
            const clienteIdentificador = item.clienteNome || item.clienteNumero || `Chamado #${item.id.slice(0, 5)}`;

            return {
                id: `#${item.id.slice(0, 5)}`,
                cliente: clienteIdentificador,
                tempoEspera: tempoEsperaFormatado,
                prioridade: minutosEspera > 30 ? "URGENTE" : "ALTA",
                assunto: item.aba ? `Aba: ${item.aba}` : "Atendimento Geral",
            };
        });

        return NextResponse.json({
            kpis: {
                totalAbertos: totalAbertos ?? 0,
                aguardandoAprovacao: aguardando ?? 0,
                concluidos: finalizados ?? 0,
                vencidos: 0,
                respostaVencida: 0,
                aVencerHoje: 0,
                meusVencidos: 0,
            },
            filaCritica,
        });
    } catch (error: any) {
        console.error("❌ [API /api/dashboard/stats Error]:", error);

        return NextResponse.json(
            {
                error: "Erro interno no servidor ao consultar o Prisma",
                message: error?.message || "Consulte os logs do servidor"
            },
            { status: 500 }
        );
    }
}