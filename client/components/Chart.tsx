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
import { MessageSquare, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { useRealtimeApp } from '@/hooks/useRealtimeApp';

export function ChartAtendimentos() {
    const { dashboardStats, loading, error } = useRealtimeApp();

    // 1. Métricas do topo tratadas com valores padrão seguros
    const metricas = useMemo(() => {
        const abertos = dashboardStats?.kpis?.totalAbertos ?? 0;
        const pendentes = dashboardStats?.kpis?.aguardandoAprovacao ?? 0;
        const finalizados = dashboardStats?.kpis?.concluidos ?? 0;

        return {
            abertos,
            pendentes,
            finalizados,
            total: abertos + pendentes + finalizados,
        };
    }, [dashboardStats]);

    // 2. Montagem dos dados para o gráfico de área
    const chartData = useMemo(() => {
        const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
        const hoje = new Date();
        const ultimosDias: Record<string, { dia: string; abertos: number; finalizados: number }> = {};

        // Inicializa os últimos 7 dias com contagem zerada
        for (let i = 6; i >= 0; i--) {
            const d = new Date(hoje);
            d.setDate(d.getDate() - i);
            const chave = d.toISOString().split("T")[0];
            const nomeDia = diasSemana[d.getDay()];
            ultimosDias[chave] = { dia: nomeDia, abertos: 0, finalizados: 0 };
        }

        // Se houver uma lista de atendimentos detalhada em `stats.atendimentos`
        if (Array.isArray(dashboardStats?.kpis?.totalAbertos) && dashboardStats?.kpis?.totalAbertos.length > 0) {
            dashboardStats?.kpis?.totalAbertos.forEach((item: any) => {
                if (!item?.createdAt) return;
                const dataChave = new Date(item.createdAt).toISOString().split("T")[0];
                if (ultimosDias[dataChave]) {
                    if (item.status === "FINALIZADO" || item.status === "FECHADO") {
                        ultimosDias[dataChave].finalizados += 1;
                    } else {
                        ultimosDias[dataChave].abertos += 1;
                    }
                }
            });
            return Object.values(ultimosDias);
        }

        // Dados padrão (fallback visual) caso a lista ainda não exista/carregue
        return [
            { dia: "Seg", abertos: 12, finalizados: 10 },
            { dia: "Ter", abertos: 18, finalizados: 15 },
            { dia: "Qua", abertos: 15, finalizados: 14 },
            { dia: "Qui", abertos: 22, finalizados: 19 },
            { dia: "Sex", abertos: 28, finalizados: 25 },
            { dia: "Sáb", abertos: 10, finalizados: 8 },
            { dia: "Dom", abertos: 5, finalizados: 5 },
        ];
    }, [dashboardStats]);

    if (loading) {
        return (
            <div className="w-full flex flex-col items-center justify-center p-12 bg-card border border-border/70 rounded-2xl gap-3">
                <Loader2 size={24} className="text-primary animate-spin" />
                <p className="text-xs text-muted-foreground font-medium">Carregando métricas do painel...</p>
            </div>
        );
    }

    return (
        <div className="w-full space-y-4 font-sans">
            {/* Cards de Resumo Rápido */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-card border border-border/70 shadow-xs flex items-center gap-3.5">
                    <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shrink-0">
                        <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground font-medium">Abertos</p>
                        <p className="text-xl font-bold text-foreground mt-0.5">{metricas.abertos}</p>
                    </div>
                </div>

                <div className="p-4 rounded-xl bg-card border border-border/70 shadow-xs flex items-center gap-3.5">
                    <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
                        <Clock className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground font-medium">Pendentes</p>
                        <p className="text-xl font-bold text-foreground mt-0.5">{metricas.pendentes}</p>
                    </div>
                </div>

                <div className="p-4 rounded-xl bg-card border border-border/70 shadow-xs flex items-center gap-3.5">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground font-medium">Finalizados</p>
                        <p className="text-xl font-bold text-foreground mt-0.5">{metricas.finalizados}</p>
                    </div>
                </div>
            </div>

            {/* Container do Gráfico */}
            <div className="p-5 rounded-2xl bg-card border border-border/70 shadow-xs space-y-4">
                <div className="flex items-center justify-between gap-2">
                    <div>
                        <h3 className="text-sm font-bold text-foreground leading-none">
                            Atendimentos Semanais
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                            Comparativo de chamados criados e concluídos nos últimos dias
                        </p>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Ao vivo
                    </span>
                </div>

                <div className="w-full h-64 pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="gradientAbertos" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                                </linearGradient>
                                <linearGradient id="gradientFinalizados" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                                </linearGradient>
                            </defs>

                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.6)" />

                            <XAxis
                                dataKey="dia"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12, fontWeight: 500 }}
                            />

                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12, fontWeight: 500 }}
                            />

                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="bg-popover text-popover-foreground p-3 rounded-xl border border-border/80 shadow-md text-xs space-y-1.5">
                                                <p className="font-bold border-b border-border/50 pb-1 text-foreground">
                                                    {payload[0].payload.dia}
                                                </p>
                                                <p className="text-blue-600 dark:text-blue-400 font-semibold flex items-center justify-between gap-4">
                                                    <span>Abertos:</span>
                                                    <span>{payload[0].value}</span>
                                                </p>
                                                <p className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center justify-between gap-4">
                                                    <span>Finalizados:</span>
                                                    <span>{payload[1]?.value ?? 0}</span>
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
                                strokeWidth={2.5}
                                fillOpacity={1}
                                fill="url(#gradientAbertos)"
                            />

                            {/* Área de Atendimentos Finalizados */}
                            <Area
                                type="monotone"
                                dataKey="finalizados"
                                stroke="#10b981"
                                strokeWidth={2.5}
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