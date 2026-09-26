'use client';

import { Atendimento, Mensagem, DashboardStatsData, HomeStats } from "@/types/types";
import { useState, useMemo, useEffect, useCallback } from "react";

export function useRealtimeApp() {
    // --- ESTADOS DO ATENDIMENTO E CHAT ---
    const [atendimentos, setAtendimentos] = useState<Atendimento[]>([]);
    const [mensagens, setMensagens] = useState<Mensagem[]>([]);
    const [idAtendimentoAtivo, setIdAtendimentoAtivo] = useState<string | null>(null);
    const [inputMsg, setInputMsg] = useState<string>("");
    const [isOpen, setIsOpen] = useState<boolean>(false);

    // --- ESTADOS DO DASHBOARD E HOME ---
    const [dashboardStats, setDashboardStats] = useState<DashboardStatsData | null>(null);
    const [homeStats, setHomeStats] = useState<HomeStats | null>(null);

    // --- ESTADOS DE CONTROLE ---
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const atendimentoAtivo = useMemo(() => {
        if (!atendimentos.length) return null;
        return atendimentos.find(item => item.id === idAtendimentoAtivo) ?? null;
    }, [atendimentos, idAtendimentoAtivo]);

    // 1. CARREGAMENTO INICIAL
    const fetchDadosIniciais = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const [resAtendimentos, resHome, resDashboard] = await Promise.all([
                fetch("/api/atendimento").then(res => res.json()),
                fetch("/api/home").then(res => res.json()),
                fetch("/api/dashboard/status").then(res => res.json())
            ]);

            if (resAtendimentos && Array.isArray(resAtendimentos.data)) {
                setAtendimentos(resAtendimentos.data);
                // Não sobrescreve se o usuário já tiver selecionado um ID ou vindo da URL
                setIdAtendimentoAtivo(prev => prev ?? resAtendimentos.data[0]?.id ?? null);
            }
            if (resDashboard?.kpis) {
                setDashboardStats(resDashboard);
            }
            if (resHome) {
                setHomeStats(resHome);
            }
        } catch (err: any) {
            console.error("Erro ao buscar dados iniciais:", err);
            setError("Erro ao carregar dados iniciais.");
        } finally {
            setLoading(false);
        }
    }, []);

    // 2. BUSCA MENSAGENS DO CHAT SELECIONADO
    const fetchMensagens = useCallback(async (atendimentoId: string) => {
        try {
            const res = await fetch(`/api/mensagens?atendimentoId=${atendimentoId}`);
            const response = await res.json();
            setMensagens(Array.isArray(response?.data) ? response.data : []);
        } catch (err) {
            console.error("Erro ao buscar mensagens:", err);
        }
    }, []);

    useEffect(() => {
        if (idAtendimentoAtivo) {
            fetchMensagens(idAtendimentoAtivo);
        } else {
            setMensagens([]);
        }
    }, [idAtendimentoAtivo, fetchMensagens]);

    // 3. CONEXÃO SERVER-SENT EVENTS (SSE)
    useEffect(() => {
        fetchDadosIniciais();

        const eventSource = new EventSource("/api/realtime/stream");

        eventSource.addEventListener("Nova mensagem", (event) => {
            const novaMensagem: Mensagem = JSON.parse(event.data);
            if (novaMensagem.atendimentoId === idAtendimentoAtivo) {
                setMensagens(prev => [...prev, novaMensagem]);
            }

            // Move o atendimento atualizado para o topo da lista
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
            console.error("Erro na conexão SSE:", err);
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    }, [fetchDadosIniciais, idAtendimentoAtivo]);

    // 4. AÇÕES DA INTERFACE
    const enviarMensagem = async () => {
        if (!inputMsg.trim() || !idAtendimentoAtivo) return;

        const text = inputMsg;
        setInputMsg(""); // Optimistic update

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
    };

    const mudarStatusAtendimento = async (id: string | number, novoStatus: string) => {
        try {
            const idStr = String(id);
            const res = await fetch("/api/status", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: novoStatus, id: idStr }),
            });
            if (!res.ok) throw new Error("Erro ao mudar status");
        } catch (err) {
            console.error("Erro ao alterar status:", err);
        }
    };

    const finalizarAtendimento = async (id: string | number) => {
        try {
            const idStr = String(id);
            const res = await fetch("/api/finalizar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ atendimentoId: idStr }),
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
        isOpen,

        // Setters / Ações
        setIdAtendimentoAtivo,
        setInputMsg,
        setIsOpen,
        enviarMensagem,
        mudarStatusAtendimento,
        finalizarAtendimento,
        refresh: fetchDadosIniciais,
    };
}