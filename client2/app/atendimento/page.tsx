"use client";
import { useEffect, useState } from "react";
import ChatCard from "@/components/ChatCard";
import { useSession } from "next-auth/react";
import "next-auth";
import "next-auth/jwt";
import {useRouter} from "next/navigation";
import Dropdown from "@/components/Dropdown";

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

export default function Atendimentos() {
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

    return (
        <main className="container mx-auto p-4 h-[calc(100vh-2rem)] flex flex-col gap-6">
            {isOpen && <ChatCard onClose={() => setIsOpen(false)} data={null} />}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-hidden">
                <aside className="lg:col-span-4 flex flex-col gap-4 overflow-hidden">
                    <h2 className="text-lg font-bold text-gray-700 px-1">Todos os chats</h2>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                        {data.map((atendimento) => (
                            <div
                                key={atendimento.id}
                                onClick={() => setIdAtendimentoAtivo(atendimento.id)}
                                className={`group flex flex-col gap-2 p-4 bg-white border rounded-xl hover:border-blue-300 hover:shadow-md transition-all cursor-pointer ${
                                    atendimentoAtivo?.id === atendimento.id ? "border-blue-500 bg-blue-50/20" : "border-gray-100"
                                }`}
                            >
                                <div>
                                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                                        <span className="text-primary-foreground text-xs font-semibold">{atendimento.clienteNome .charAt()}</span>
                                    </div>
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-gray-800">{atendimento.clienteNome || "Sem nome"}</h3>
                                        <span className="text-[10px] text-gray-400 font-medium">
                                        {atendimento.createdAt ? new Date(atendimento.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ""}
                                    </span>
                                    </div>
                                    <p className="text-sm text-gray-500 line-clamp-1 italic">WhatsApp: {atendimento.clienteNumero}</p>
                                    <button className="mt-2 text-xs font-bold text-blue-600 group-hover:text-blue-700 uppercase tracking-wider text-left">
                                        Ver chat
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>

                <section className="lg:col-span-8 flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                    {atendimentoAtivo ? (
                        <>
                            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                                <div>
                                    <h2 className="font-bold text-gray-800 text-lg">
                                        {atendimentoAtivo.clienteNome || "Cliente sem nome"}
                                    </h2>
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                        Status: {atendimentoAtivo.status} | WhatsApp: {atendimentoAtivo.clienteNumero}
                                    </p>
                                </div>
                                <div className="flex gap-4">
                                    <Dropdown status={atendimentoAtivo.status} onSelect={(status) => mudarStatus(atendimentoAtivo.id, status)} />
                                    <button onClick={() => finalizarAtendimento(atendimentoAtivo.id)} className="text-xs font-bold text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition">
                                        Finalizar
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 p-6 overflow-y-auto bg-slate-50">
                                <div className="flex flex-col gap-4">
                                    {messagem.length > 0 ? (
                                        messagem.map((msg: any) => (
                                            <div
                                                key={msg.id}
                                                className={`max-w-[80%] p-3 rounded-2xl shadow-sm ${
                                                    msg.fromMe
                                                        ? "bg-blue-600 text-white self-end rounded-tr-none"
                                                        : "bg-white text-gray-700 self-start border border-gray-100 rounded-tl-none"
                                                }`}
                                            >
                                                {!msg.fromMe ? <p>{data.filter((msg: any) => msg.id === msg.id)[0].clienteNome}</p> : <p>Voce</p>}
                                                <p className="text-sm">{msg.texto}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center p-4 text-gray-400 text-sm italic">
                                            Nenhuma mensagem por enquanto...
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-4 border-t bg-white">
                                {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
                                <div className="flex gap-2 p-2 bg-gray-100 rounded-xl focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                                    <input
                                        type="text"
                                        placeholder="Digite sua mensagem..."
                                        value={msg}
                                        className="flex-1 bg-transparent outline-none px-2 text-sm text-gray-700"
                                        onChange={(e) => setMsg(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && submitInfos()}
                                    />
                                    <button onClick={submitInfos} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-blue-700 transition">
                                        Enviar
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center p-4">
                            <p className="text-gray-500">Selecione ou abra um atendimento para iniciar</p>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}