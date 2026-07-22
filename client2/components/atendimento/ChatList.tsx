'use client';
import { AtendimentoComTipo } from "@/types/types";
import { User } from "lucide-react";

interface ChatListProps {
    atendimentos?: AtendimentoComTipo[]; // Opcional para evitar erro se passar undefined
    atendimentoAtivoId?: string;
    onSelectChat: (id: string) => void;
}

export function ChartList({ atendimentos = [], atendimentoAtivoId, onSelectChat }: ChatListProps) {
    return (
        <aside className="lg:col-span-4 flex flex-col gap-4 overflow-hidden">
            <h2 className="text-lg font-bold text-gray-700 px-1">Todos os chats</h2>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {atendimentos.map((atendimento) => {
                    const mensagens = atendimento.mensagens || [];
                    const ultmaMsg = mensagens.length > 0 ? mensagens[mensagens.length - 1] : null;
                    const nomeCliente = atendimento.clienteNome || atendimento.clienteNumero || "Sem nome";
                    const inicialNome = nomeCliente.charAt(0).toUpperCase();

                    return (
                        <div
                            key={atendimento.id}
                            onClick={() => onSelectChat(atendimento.id)}
                            className={`group flex flex-col gap-2 p-4 bg-white border rounded-xl hover:border-blue-300 hover:shadow-md transition-all cursor-pointer ${
                                atendimentoAtivoId === atendimento.id ? "border-blue-500 bg-blue-50/20" : "border-gray-100"
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full border flex items-center justify-center overflow-hidden flex-shrink-0">
                                    {atendimento.clienteAvatar ? (
                                        <img
                                            src={atendimento.clienteAvatar}
                                            alt={nomeCliente}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <User className="w-6 h-6 text-gray-500" />
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-gray-800 truncate">{nomeCliente}</h3>
                                        <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap ml-2">
                                            {atendimento.createdAt ? new Date(atendimento.createdAt).toLocaleTimeString('pt-BR', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            }) : ""}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 line-clamp-1 italic">
                                        {ultmaMsg?.texto || "Nenhuma mensagem"}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                className="mt-1 text-xs font-bold text-blue-600 group-hover:text-blue-700 uppercase tracking-wider text-left">
                                Ver chat
                            </button>
                        </div>
                    );
                })}
            </div>
        </aside>
    );
}