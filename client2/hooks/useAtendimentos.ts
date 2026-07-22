'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

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
    const [messagem, setMessage] = useState<any[]>([]);
    const [msg, setMsg] = useState<string>("");
    const [idAtendimentoAtivo, setIdAtendimentoAtivo] = useState<string | null>(null);
    const atendimentoAtivo = data.find(item => item.id === idAtendimentoAtivo) || data[0];
    useEffect(() => {
        if (data.length > 0 && !idAtendimentoAtivo) {
            setIdAtendimentoAtivo(data[0].id);
        }
    }, [data, idAtendimentoAtivo]);

    async function getAtendimentos() {
        try {
            const response = await fetch("/api/atendimento", {
                method: "GET",
                headers: { 'Content-Type': 'application/json' },
            });
            const res = await response.json();
            if (res && Array.isArray(res.data)) {
                setData(res.data);
            }
            console.log(res);
        } catch (err) {
            console.error("Erro ao buscar atendimentos:", err);
        }
    }

    async function getMessagens() {
        if (!atendimentoAtivo?.id) return;
        try {
            const response = await fetch(`/api/menssagens?atendimentoId=${atendimentoAtivo.id}`, {
                method: "GET",
                headers: { 'Content-Type': 'application/json' },
            });
            const res = await response.json();
            if (res && Array.isArray(res.data)) {
                setMessage(res.data);
            } else {
                setMessage([]);
            }
        } catch (err) {
            console.error("Erro ao buscar mensagens:", err);
        }
    }

    useEffect(() => {
        getAtendimentos();
        const intervaloGetAtendimento = setInterval(() => {
            getAtendimentos();
        }, 4000);
        return () => clearInterval(intervaloGetAtendimento);
    }, []);

    useEffect(() => {
        getMessagens();
        const intervalGetMessagesn = setInterval(() => {
            getMessagens();
        }, 3000);
        return () => clearInterval(intervalGetMessagesn);
    }, [atendimentoAtivo?.id]);

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
            getMessagens();
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

    function onCartNewChat () {
        setIsOpen(true);
    }
    return {
        data,
        messagem,
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