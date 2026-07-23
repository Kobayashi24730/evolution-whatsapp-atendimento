'use client';
import { AtendimentoComTipo } from "@/types/types";
import { User, MessageCircle } from "lucide-react";
import { formatarTempoCorrido } from "@/libs/utils";

interface ChatListProps {
    atendimentos?: AtendimentoComTipo[];
    atendimentoAtivoId?: string;
    onSelectChat: (id: string) => void;
}

const sttatusStyles: Record<string, { badge: string; dot: string }> = {
    ABERTO:         { badge: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-400" },
    EM_ATENDIMENTO: { badge: "bg-blue-50   text-blue-700   border-blue-200",     dot: "bg-blue-400"    },
    TRIAGEM:        { badge: "bg-amber-50  text-amber-700  border-amber-200",    dot: "bg-amber-400"   },
    FECHADO:        { badge: "bg-gray-100  text-gray-500   border-gray-200",     dot: "bg-gray-300"    },
    AGUARDANDO:     { badge: "bg-purple-50 text-purple-700 border-purple-200",   dot: "bg-purple-400"  },
};
const statusDefault = { badge: "bg-gray-100 text-gray-600 border-gray-200", dot: "bg-gray-300" };
const statusLabel: Record<string, string> = {
    ABERTO:         "Aberto",
    EM_ATENDIMENTO: "Em atendimento",
    TRIAGEM:        "Triagem",
    FECHADO:        "Fechado",
    AGUARDANDO:     "Aguardando",
};

export function ChartList({ atendimentos = [], atendimentoAtivoId, onSelectChat }: ChatListProps) {
    return (
        <aside className="lg:col-span-4 flex flex-col gap-3 overflow-hidden">
            <div className="flex items-center justify-between px-1">
                <h2 className="text-base font-semibold text-gray-800">Chats</h2>
                <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    {atendimentos.length}
                </span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                {atendimentos.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                            <MessageCircle className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-400">Nenhum chat disponível</p>
                    </div>
                )}

                {atendimentos.map((atendimento) => {
                    const mensagens = atendimento.mensagens || [];
                    const ultimaMsg = mensagens.at(-1);
                    const nomeCliente = atendimento.clienteNome || atendimento.clienteNumero || "Sem nome";
                    const inicialNome = nomeCliente.charAt(0).toUpperCase();
                    const isAtivo = atendimentoAtivoId === atendimento.id;
                    const style = sttatusStyles[atendimento.status] ?? statusDefault;

                    return (
                        <div
                            key={atendimento.id}
                            onClick={() => onSelectChat(atendimento.id)}
                            className={`
                                group relative flex items-start gap-3 p-3 rounded-xl
                                border cursor-pointer select-none
                                transition-all duration-150
                                ${isAtivo
                                ? "bg-blue-50 border-blue-200 shadow-sm"
                                : "bg-white border-gray-100 hover:bg-gray-50 hover:border-gray-200 hover:shadow-sm"
                            }
                            `}
                        >
                            {isAtivo && (<span className="absolute left-0 top-3 bottom-3 w-0.5 bg-blue-500 rounded-r-full" />)}

                            <div className="relative shrink-0">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 border border-blue-100 flex items-center justify-center overflow-hidden">
                                    {atendimento.clienteAvatar ? (
                                        <img
                                            src={atendimento.clienteAvatar}
                                            alt={nomeCliente}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (<span className="text-sm font-bold text-blue-600">{inicialNome}</span>)}
                                </div>
                                <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${style.dot}`} />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                    <p className="text-sm font-semibold text-gray-800 truncate leading-tight">
                                        {nomeCliente}
                                    </p>
                                    <span className="text-[10px] text-gray-400 whitespace-nowrap shrink-0 mt-0.5">
                                        {formatarTempoCorrido(atendimento.createdAt)}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 truncate mt-0.5 leading-relaxed">
                                    {ultimaMsg?.texto || "Nenhuma mensagem"}
                                </p>
                                <div className="mt-2">
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${style.badge}`}>
                                        {statusLabel[atendimento.status] ?? atendimento.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </aside>
    );
}