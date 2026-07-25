"use client";

import { useMemo } from "react";
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from "recharts";
import { MessageSquare, CheckCircle2, Clock } from "lucide-react";

interface IAtendimentoData {
    id: string;
    status: "ABERTO" | "PENDENTE" | "FINALIZADO" | string;
    createdAt?: string;
}

interface ChartProps {
    atendimentos?: IAtendimentoData[];
}

export function ChartAtendimentos({ atendimentos = [] }: ChartProps) {
    // 1. Calcula os totais por status para os cards de resumo
    const metricas = useMemo(() => {
        const abertos = atendimentos.filter((a) => a.status === "ABERTO").length;
        const pendentes = atendimentos.filter((a) => a.status === "PENDENTE").length;
        const finalizados = atendimentos.filter((a) => a.status === "FINALIZADO").length;

        return { abertos, pendentes, finalizados, total: atendimentos.length };
    }, [atendimentos]);

    // 2. Agrupa os dados dos últimos 7 dias dinamicamente se houver dados com data
    const chartData = useMemo(() => {
        if (!atendimentos.length) {
            // Dados padrão para visualização inicial/placeholder
            return [
                { dia: "Seg", abertos: 12, finalizados: 10 },
                { dia: "Ter", abertos: 18, finalizados: 15 },
                { dia: "Qua", abertos: 15, finalizados: 14 },
                { dia: "Qui", abertos: 22, finalizados: 19 },
                { dia: "Sex", abertos: 28, finalizados: 25 },
                { dia: "Sáb", abertos: 10, finalizados: 8 },
                { dia: "Dom", abertos: 5, finalizados: 5 },
            ];
        }

        // Mapeia os dias passados se existir a propriedade createdAt
        const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
        const hoje = new Date();
        const ultimosDias: { [key: string]: { dia: string; abertos: number; finalizados: number } } = {};

        // Inicializa os últimos 7 dias zerados
        for (let i = 6; i >= 0; i--) {
            const d = new Date(hoje);
            d.setDate(d.getDate() - i);
            const chave = d.toISOString().split("T")[0];
            const nomeDia = diasSemana[d.getDay()];
            ultimosDias[chave] = { dia: nomeDia, abertos: 0, finalizados: 0 };
        }

        // Preenche com os atendimentos reais
        atendimentos.forEach((item) => {
            if (!item.createdAt) return;
            const dataChave = new Date(item.createdAt).toISOString().split("T")[0];
            if (ultimosDias[dataChave]) {
                if (item.status === "FINALIZADO") {
                    ultimosDias[dataChave].finalizados += 1;
                } else {
                    ultimosDias[dataChave].abertos += 1;
                }
            }
        });

        return Object.values(ultimosDias);
    }, [atendimentos]);

    return (
        <div className="w-full space-y-4">
            {/* Cards de Resumo Rápido */}
            <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-card border border-border/60 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 shrink-0">
                        <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-[11px] text-muted-foreground font-medium">Abertos</p>
                        <p className="text-lg font-bold">{metricas.abertos}</p>
                    </div>
                </div>

                <div className="p-3.5 rounded-xl bg-card border border-border/60 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 shrink-0">
                        <Clock className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-[11px] text-muted-foreground font-medium">Pendentes</p>
                        <p className="text-lg font-bold">{metricas.pendentes}</p>
                    </div>
                </div>

                <div className="p-3.5 rounded-xl bg-card border border-border/60 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-[11px] text-muted-foreground font-medium">Finalizados</p>
                        <p className="text-lg font-bold">{metricas.finalizados}</p>
                    </div>
                </div>
            </div>

            {/* Container do Gráfico */}
            <div className="p-5 rounded-2xl bg-card border border-border/60 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-semibold text-foreground">
                            Atendimentos Semanais
                        </h3>
                        <p className="text-xs text-muted-foreground">
                            Comparativo de chamados criados e concluídos
                        </p>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 font-medium border border-emerald-500/20">
            Live
          </span>
                </div>

                <div className="w-full h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="gradientAbertos" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                                </linearGradient>
                                <linearGradient id="gradientFinalizados" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                                </linearGradient>
                            </defs>

                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />

                            <XAxis
                                dataKey="dia"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                            />

                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                            />

                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="bg-popover text-popover-foreground p-3 rounded-xl border border-border shadow-md text-xs space-y-1.5">
                                                <p className="font-semibold border-b border-border/40 pb-1">
                                                    {payload[0].payload.dia}
                                                </p>
                                                <p className="text-blue-500 font-medium">
                                                    Abertos: {payload[0].value}
                                                </p>
                                                <p className="text-emerald-500 font-medium">
                                                    Finalizados: {payload[1]?.value || 0}
                                                </p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />

                            {/* Área de Atendimentos Abertos */}
                            <Area
                                type="monotone"
                                dataKey="abertos"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#gradientAbertos)"
                            />

                            {/* Área de Atendimentos Finalizados */}
                            <Area
                                type="monotone"
                                dataKey="finalizados"
                                stroke="#10b981"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#gradientFinalizados)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}