"use client";
import {useEffect, useState} from "react";
import ChatCard from "@/components/ChatCard";

export default function Atendimentos() {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [data, setData] = useState<any[]>([]);
    console.log(data);
    useEffect(() => {
        async function getAtendimentos() {
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
        getAtendimentos();
    }, []);
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
                                {atendimento.mensagens[0].message.length > 0 && (
                                    <p className="text-sm text-gray-500 line-clamp-1 italic">{atendimento.mensagens[0].message}</p>
                                )}
                                <p className="text-sm text-gray-500 line-clamp-1 italic">Sem descrição disponível...</p>
                                <button className="mt-2 text-xs font-bold text-blue-600 group-hover:text-blue-700 uppercase tracking-wider">
                                    Ver chat
                                </button>
                            </div>
                        ))}
                    </div>
                </aside>

                <section className="lg:col-span-8 flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                        <div>
                            <h2 className="font-bold text-gray-800 text-lg">Atendimento #131231</h2>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                Cliente: 55 11 99999-9999
                            </p>
                        </div>
                        <button className="text-xs font-bold text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition">
                            Finalizar
                        </button>
                    </div>

                    <div className="flex-1 p-6 overflow-y-auto bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-slate-50">
                        <div className="flex flex-col gap-4">
                            {/* Mensagem Recebida */}
                            <div className="max-w-[80%] bg-white p-3 rounded-2xl rounded-tl-none shadow-sm self-start border border-gray-100">
                                <p className="text-sm text-gray-700">Olá, gostaria de saber o status do meu pedido!</p>
                            </div>

                            <div className="max-w-[80%] bg-blue-600 p-3 rounded-2xl rounded-tr-none shadow-sm self-end text-white">
                                <p className="text-sm">Claro! Poderia me informar o CPF?</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-t bg-white">
                        <div className="flex gap-2 p-2 bg-gray-100 rounded-xl focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                            <input
                                type="text"
                                placeholder="Digite sua mensagem..."
                                className="flex-1 bg-transparent outline-none px-2 text-sm text-gray-700"
                            />
                            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-blue-700 transition">
                                Enviar
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    )
}