'use client';

import { useState, useEffect, useCallback } from "react";
import { DashboardStatsData, ChamadoCritico, DashboardKPIs } from "@/types/types";

// Objeto de fallback padrão para evitar exceções de 'undefined' na renderização
const defaultStats: DashboardStatsData = {
    kpis: {
        totalAbertos: 0,
        aguardandoAprovacao: 0,
        concluidos: 0,
        vencidos: 0,
        respostaVencida: 0,
        aVencerHoje: 0,
        meusVencidos: 0,
    },
    filaCritica: [],
};

export function useDashboardStats() {
    const [stats, setStats] = useState<DashboardStatsData>(defaultStats);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(async () => {
        try {
            const response = await fetch("/api/dashboard/status", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) {
                throw new Error(`Erro na API: ${response.status}`);
            }

            const data = await response.json();

            // Garante que o retorno tem a estrutura mínima esperada antes de atualizar o estado
            if (data && data.kpis) {
                setStats({
                    kpis: {
                        totalAbertos: data.kpis.totalAbertos ?? 0,
                        aguardandoAprovacao: data.kpis.aguardandoAprovacao ?? 0,
                        concluidos: data.kpis.concluidos ?? 0,
                        vencidos: data.kpis.vencidos ?? 0,
                        respostaVencida: data.kpis.respostaVencida ?? 0,
                        aVencerHoje: data.kpis.aVencerHoje ?? 0,
                        meusVencidos: data.kpis.meusVencidos ?? 0,
                    },
                    filaCritica: Array.isArray(data.filaCritica) ? data.filaCritica : [],
                });
                setError(null);
            }
        } catch (err: any) {
            console.error("Erro ao carregar estatísticas da Dashboard:", err);
            setError(err.message || "Falha ao sincronizar dados do painel");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
        const intervalId = setInterval(fetchStats, 10000);
        return () => clearInterval(intervalId);
    }, [fetchStats]);

    return {
        stats,
        loading,
        error,
        refresh: fetchStats,
    };
}