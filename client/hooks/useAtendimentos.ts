'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {useState, useEffect, useCallback, useMemo} from "react";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
        }
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id?: string;
    }
}

export function useAtendimentos() {
    const { data: session } = useSession();
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [data, setData] = useState<any[]>([]);
    const [mensagem, setMensagem] = useState<any[]>([]);
    const [msg, setMsg] = useState<string>("");
    const [idAtendimentoAtivo, setIdAtendimentoAtivo] = useState<string | null>(null);
    const atendimentoAtivo = useMemo(() => {
        if (!data.length) return null;
        return data.find(item => item.id === idAtendimentoAtivo) ?? null;
    }, [data, idAtendimentoAtivo]);


    const getAtendimentos = useCallback(async () => {
        try {
            const response = await fetch("/api/atendimento", {
                method: "GET",
                headers: { 'Content-Type': 'application/json' },
            });
            const res = await response.json();
            if (res && Array.isArray(res.data)) {
                setData(res.data);
                setIdAtendimentoAtivo(prevId => {
                    if (prevId && res.data.some((item: any) => item.id === prevId)) {
                        return prevId;
                    }
                    return res.data[0]?.id ?? null;
                });
            }
            console.log(res);
        } catch (err) {
            console.error("Erro ao buscar atendimentos:", err);
        }
    }, []);

    const getMensagems = useCallback(async (atendimentoAtivo: string) => {
        if (!atendimentoAtivo) return;
        try {
            const response = await fetch(`/api/mensagens?atendimentoId=${atendimentoAtivo}`, {
                method: "GET",
                headers: { 'Content-Type': 'application/json' },
            });
            const res = await response.json();
            setMensagem(Array.isArray(res?.data) ? res.data : []);
        } catch (err) {
            console.error("Erro ao buscar mensagens:", err);
        }
    }, []);

    useEffect(() => {
        getAtendimentos();
        const intervaloGetAtendimento = setInterval(() => {
            getAtendimentos();
        }, 4000);
        return () => clearInterval(intervaloGetAtendimento);
    }, []);

    useEffect(() => {
        if (!atendimentoAtivo?.id) {
            setMensagem([]);
            return;
        }
        getMensagems(atendimentoAtivo.id);
        const intervalGetMessagesn = setInterval(() => {
            getMensagems(atendimentoAtivo.id);
        }, 3000);
        return () => clearInterval(intervalGetMessagesn);
    }, [atendimentoAtivo?.id, getMensagems]);

    async function submitInfos() {
        if (!msg.trim() || !atendimentoAtivo?.id) {
            setError("Informe uma mensagem ou selecione um chat");
            return;
        }
        const values = msg;
        setMsg("");
        setError(null);
        try {
            const response = await fetch("/api/atendimento", {
                method: "PUT",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mensagens: values, atendimentoId: atendimentoAtivo.id, by: true})
            });
            await response.json();
            getMensagems(atendimentoAtivo.id);
        } catch (err) {
            console.error("Erro ao enviar mensagem:", err);
        }
    }

    async function finalizarAtendimento(id: any) {
        try {
            const response = await fetch("/api/finalizar", {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ atendimentoId: id })
            });
            if(!response.ok) {
                const error = await response.text();
                setError(error);
                return;
            }
            const data = await response.json();
            if (data.success) {
                console.log("Atendimento finalizado com sucesso");
            }
            getAtendimentos();
        } catch (err) {
            console.error("Erro ao finalizar atendimento:", err);
        }
    }

    async function mudarStatus(id: string | number, status: string) {
        try {
            const response = await fetch("/api/status",{
                method: "PUT",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: status, id })
            });
            if (!response.ok) throw new Error("Erro ao mudar status");
            getAtendimentos();
        } catch (err) {
            return console.error("Erro ao mudar status:", err);
        }
    }

    return {
        data,
        mensagem,
        msg,
        setMsg,
        error,
        atendimentoAtivo,
        setIdAtendimentoAtivo,
        submitInfos,
        finalizarAtendimento,
        mudarStatus,
        setIsOpen,
        isOpen,
    };
}