'use client'

import { Atendimento, Mensagem, DashboardStatsData, HomeStats } from "@/types/types";
import { useState, useMemo, useEffect, useCallback } from "react";

export default function useRealtimeApp() {
    //? Estadoss do atendimento e do chat
    const [atendimentos, setAtendimentos] = useState<Atendimento[]>([]);
    const [mensagens, setMensagens] = useState<Mensagem[]>([]);
    const [idAtendimentoAtivo, setIdAtendimentoAtivo] = useState<string | null>(null);
    const [inputMsg, setInputMsg] = useState<string>("");

    //? Estados do dashboard e home
    const [dashboardStats, setDashboardStats] = useState<DashboardStatsData | null>(null);
    const [homeStats, setHomeStats] = useState<HomeStats | null>(null);

    //? Estados de controle
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean | null>(true);
    
    const atendimentoAtivo = useMemo(() => {
        if (!atendimentos.length) return null;
        return atendimentos.find(item => item.id === idAtendimentoAtivo) ?? null;
    }, [atendimentos, idAtendimentoAtivo]);

    const fetchDadosIniciais = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const [resAtendimentos, resHome, resDashboard] = await Promise.all([
                fetch("/api/atendimento").then(res => res.json()),
                fetch("/api/home").then(res => res.json()),
                fetch("/api/dashboard").then(res => res.json())

            ]);
            if (resAtendimentos && Array.isArray(resAtendimentos.data)) {
                setAtendimentos(resAtendimentos.data);
                setIdAtendimentoAtivo(prev =>resAtendimentos.data[0]?.id ?? null);
            }
            if (resDashboard.kpis) {
                setDashboardStats(resDashboard);
            }
            if (resHome) {
                setHomeStats(resHome);
            }
        } catch (err) {
            console.error("Erro ao buscar dados iniciais:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    //? Busca mensagens ao trocar de atendimento ativo(chat)
    const fetchMenssagens = useCallback(async (atendimentoId: string) => {
        try {
            const res = await fetch(`/api/mensagens?atendimentoId=${atendimentoId}`);
            const response = await res.json();
            setMensagens(Array.isArray(response?.data) ? response.data : []);
        } catch (error) {
            console.error("Erro ao buscar mensagens:", error);   
        }
    }, []);

    useEffect(() => {
        if (idAtendimentoAtivo) {
            fetchMenssagens(idAtendimentoAtivo);
        } else {
            setMensagens([]);
        }
    }, [idAtendimentoAtivo, fetchMenssagens]);

    //? Coneção em tempo real SEE(Serve-sent Event)
    useEffect(() => {
        fetchDadosIniciais();

        const eventSource = new EventSource("/api/realtime/stream");

        eventSource.addEventListener("Nova mensagem", (event) => {
            const novaMensagem: Mensagem = JSON.parse(event.data);
            if (novaMensagem.atendimentoId === idAtendimentoAtivo) {
                setMensagens(prev => [...prev, novaMensagem]); //? Se for o atendimento ativo, adiciona a nova mensagem
            }

            //? Atualiza para o atendimento ir para o topo
            setAtendimentos(prev => prev.map(at => at.id === novaMensagem.atendimentoId ? 
                { ...at, updatedAt: new Date().toISOString() } : at
            ));
        });

        eventSource.addEventListener("Novo atendimento", (event) => {
            const atendimentoAtualizado: Atendimento = JSON.parse(event.data);
            setAtendimentos(prev => prev.map(item => 
                item.id === atendimentoAtualizado.id ? atendimentoAtualizado : item
            )); 
        });

        eventSource.addEventListener("Atualização dashboard/home", (event) => {
            const { dashboard, home } = JSON.parse(event.data);
            if (dashboard) setDashboardStats(dashboard);
            if (home) setHomeStats(home);
        });

        eventSource.onerror = (err) => {
            console.error("Erro na coneção SEE:", err);
            eventSource.close();
        }

        return () => {
            eventSource.close();
        };
    }, [fetchDadosIniciais, idAtendimentoAtivo]);

    const enviarMensagem = async () => {
        if (!inputMsg.trim() || !idAtendimentoAtivo) return;

        const text = inputMsg;
        setInputMsg("");

        try {
            const res = await fetch("/api/atendimento", {
                method: "PUT",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mensagens: text, atendimentoId: idAtendimentoAtivo, by: true })  
            });
            if (!res.ok) throw new Error("Erro ao enviar mensagem");
        } catch (err) {
            console.error("Erro ao enviar mensagem:", err);
            setError("Erro ao enviar mensagem");
        }
    }
    const mudarStatusAtendimento = async (id: string, novoStatus: string) => {
        try {
            const res = await fetch("/api/status", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: novoStatus, id }),
            });
            if (!res.ok) throw new Error("Erro ao mudar status");
        } catch (err) {
            console.error("Erro ao alterar status:", err);
        }
    };

    const finalizarAtendimento = async (id: string) => {
        try {
            const res = await fetch("/api/finalizar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ atendimentoId: id }),
            });
            if (!res.ok) throw new Error("Erro ao finalizar atendimento");
        } catch (err) {
            console.error("Erro ao finalizar atendimento:", err);
        }
    };

    return {
        // Dados
        atendimentos,
        mensagens,
        atendimentoAtivo,
        idAtendimentoAtivo,
        dashboardStats,
        homeStats,
        inputMsg,
        loading,
        error,

        // Setters / Ações
        setIdAtendimentoAtivo,
        setInputMsg,
        enviarMensagem,
        mudarStatusAtendimento,
        finalizarAtendimento,
        refresh: fetchDadosIniciais,
    };
}
