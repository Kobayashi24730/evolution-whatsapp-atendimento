"use client";
import {useEffect, useState} from "react";
import ChatCard from "@/components/ChatCard";
import {useSession} from "next-auth/react";
import "next-auth";
import "next-auth/jwt";

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
    const [error, setError] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [data, setData] = useState<any[]>([]);
    const [messagem, setMessage] = useState<any[]>([]);
    const [msg, setMsg] = useState<string>("");
    const getAtendimentoID = data.map((atendimento: any) => atendimento.id);
    const atendimentoId = getAtendimentoID[0];
    const atendimentoAtivo = data[0];
    console.log(messagem);
    async function getAtendimentos() {
        if (atendimentoAtivo?.id) return;
        const response = await fetch("api/atendimento", {
            method: "GET",
            headers: { 'Content-Type': 'application/json' },
        });
        const res = await  response.json();
        if (res  && Array.isArray(res.data)) {
            const data = res.data;
            setData(data);
        } else {
            setData([]);
        }
    }
    async function getMessagens() {
        if (atendimentoAtivo?.id) return;
        const response = await fetch("api/menssagens", {
            method: "GET",
            headers: { 'Content-Type': 'application/json' },
        });
        const res = await response.json();
        if (res && Array.isArray(res.data)) {
            const data = res.data;
            setMessage(data);
        } else {
            setMessage([]);
        }
    }
    useEffect(() => {
        getAtendimentos();
        const intervaloGetAtendimento = setInterval(() => {getAtendimentos();}, 3000);
        return () => clearInterval(intervaloGetAtendimento);
    }, []);
    useEffect(() => {
        getMessagens();
        const intervalGetMessagesn = setInterval(() => {
            getMessagens();
        }, 3000);
        return () => clearInterval(intervalGetMessagesn);
    }, [atendimentoAtivo?.id])
    async function submitInfos() {
        if (!msg.trim() || !atendimentoAtivo?.id) {
            setError("informe uma mensagem ou selecione um chat");
            return;
        }
        const values = msg;
        setMsg("");
        const response = await fetch("api/atendimento", {
            method: "PUT",
            body: JSON.stringify({ mensagens: values, atendimentoId })
        });
        const res = await response.json();
        getMessagens();
        return res;
    }

    function onCartNewChat () {
        setIsOpen(true);
    }
    return (
        <main className="container mx-auto p-4 h-[calc(100vh-2rem)] flex flex-col gap-6">
            <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Atendimentos</h1>
                <button onClick={() => onCartNewChat()} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-6 rounded-lg transition-all shadow-md shadow-blue-100 active:scale-95">
                    + Abrir atendimento
                </button>
            </div>
            {isOpen && <ChatCard onClose={() => setIsOpen(false)} data={null} />}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-hidden">
                <aside className="lg:col-span-4 flex flex-col gap-4 overflow-hidden">
                    <h2 className="text-lg font-bold text-gray-700 px-1">Todos os chats</h2>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                        {data.map((atendimento) => (
                            <div key={atendimento.id} className="group flex flex-col gap-2 p-4 bg-white border border-gray-100 rounded-xl hover:border-blue-300 hover:shadow-md transition-all cursor-pointer">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-gray-800">{atendimento.clienteNome}</h3>
                                    <span className="text-[10px] text-gray-400 font-medium">{atendimento.createdAt}</span>
                                </div>
                                <p className="text-sm text-gray-500 line-clamp-1 italic">Sem descrição disponível...</p>
                                <button className="mt-2 text-xs font-bold text-blue-600 group-hover:text-blue-700 uppercase tracking-wider">
                                    Ver chat
                                </button>
                            </div>
                        ))}
                    </div>
                </aside>

                <section className="lg:col-span-8 flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                    {data.length > 0 ? (
                        <>
                            {(() => {
                                return (
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
                                            <button className="text-xs font-bold text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition">
                                                Finalizar
                                            </button>
                                        </div>

                                        <div className="flex-1 p-6 overflow-y-auto bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-slate-50">
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
                                                            <p className="text-sm">{msg.texto}</p>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <>
                                                        <div className="max-w-[80%] bg-white p-3 rounded-2xl rounded-tl-none shadow-sm self-start border border-gray-100">
                                                            <p className="text-sm text-gray-700">Olá, gostaria de saber o status do meu pedido!</p>
                                                        </div>
                                                        <div className="max-w-[80%] bg-blue-600 p-3 rounded-2xl rounded-tr-none shadow-sm self-end text-white">
                                                            <p className="text-sm">Claro! Poderia me informar o CPF?</p>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div className="p-4 border-t bg-white">
                                            <div className="flex gap-2 p-2 bg-gray-100 rounded-xl focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                                                <input
                                                    type="text"
                                                    placeholder="Digite sua mensagem..."
                                                    className="flex-1 bg-transparent outline-none px-2 text-sm text-gray-700"
                                                    onChange={(e) => setMsg(e.target.value)}
                                                />
                                                <button onClick={() => submitInfos(msg)} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-blue-700 transition">
                                                    Enviar
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                );
                            })()}
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center p-4">
                            <p className="text-gray-500">Selecione ou abra um atendimento para iniciar</p>
                        </div>
                    )}
                </section>
            </div>
        </main>
    )
}