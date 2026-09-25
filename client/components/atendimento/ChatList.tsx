'use client';
import { AtendimentoComTipo } from "@/types/types";
import { User, MessageCircle } from "lucide-react";
import { formatarTempoCorrido } from "../../libs/utils";
import { StatusConfig, ChatListProps } from "@/types/types";

export const statusStyles: Record<string, StatusConfig> = {
    //? Status Ativos e Inicial
    TRIAGEM: {
        badge: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
        dot: "bg-amber-500",
    },
    ABERTO: {
        badge: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
        dot: "bg-emerald-500",
    },
    EM_ATENDIMENTO: {
        badge: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800",
        dot: "bg-blue-500",
    },

    //? Status de Espera / Pendência
    AGUARDANDO: {
        badge: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800",
        dot: "bg-purple-500",
    },
    AGUARDANDO_HUMANO: {
        badge: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800",
        dot: "bg-purple-500",
    },
    AGUARDANDO_CLIENTE: {
        badge: "bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100 dark:bg-cyan-950/40 dark:text-cyan-400 dark:border-cyan-800",
        dot: "bg-cyan-500",
    },

    //? Status de Conclusão e Cancelamento
    RESOLVIDO: {
        badge: "bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100 dark:bg-teal-950/40 dark:text-teal-400 dark:border-teal-800",
        dot: "bg-teal-500",
    },
    FINALIZADO: {
        badge: "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
        dot: "bg-slate-400",
    },
    FECHADO: {
        badge: "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
        dot: "bg-gray-400",
    },
    CANCELADO: {
        badge: "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800",
        dot: "bg-rose-500",
    },
};

export const statusDefault: StatusConfig = {
    badge: "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
    dot: "bg-gray-400",
};

export const statusLabel: Record<string, string> = {
    TRIAGEM: "Triagem",
    ABERTO: "Aberto",
    EM_ATENDIMENTO: "Em atendimento",
    AGUARDANDO: "Aguardando",
    AGUARDANDO_HUMANO: "Aguardando humano",
    AGUARDANDO_CLIENTE: "Aguardando cliente",
    RESOLVIDO: "Resolvido",
    FINALIZADO: "Finalizado",
    FECHADO: "Fechado",
    CANCELADO: "Cancelado",
};


export function ChatList({ atendimentos = [], atendimentoAtivoId, onSelectChat }: ChatListProps) {
    return (
        <aside className="lg:col-span-4 flex flex-col gap-3 overflow-hidden font-sans">
            <div className="flex items-center justify-between px-1">
                <h2 className="text-lg font-bold tracking-tight text-foreground">Chats</h2>
                <span className="text-xs font-mono font-bold text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-md">
                    {atendimentos.length}
                </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {atendimentos.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
                        <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center">
                            <MessageCircle className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <p className="text-base font-medium text-muted-foreground">Nenhum chat disponível</p>
                    </div>
                )}

                {atendimentos.map((atendimento) => {
                    const mensagens = atendimento.mensagens || [];
                    const ultimaMsg = mensagens.at(-1);
                    const nomeCliente = atendimento.clienteNome || atendimento.clienteNumero || "Sem nome";
                    const inicialNome = nomeCliente.charAt(0).toUpperCase();
                    const isAtivo = atendimentoAtivoId === atendimento.id;
                    const style = statusStyles[atendimento.status] ?? statusDefault;

                    return (
                        <div
                            key={atendimento.id}
                            onClick={() => onSelectChat(atendimento.id)}
                            className={`
                                group relative flex items-start gap-3.5 p-3.5 rounded-xl
                                border cursor-pointer select-none transition-all duration-150
                                ${isAtivo
                                    ? "bg-primary/10 border-primary/40 shadow-sm"
                                    : "bg-card border-border/70 hover:bg-muted/50 hover:border-border"
                                }
                            `}
                        >
                            {isAtivo && (
                                <span className="absolute left-0 top-3 bottom-3 w-1 bg-primary rounded-r-md" />
                            )}

                            <div className="relative shrink-0">
                                <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden">
                                    {atendimento.clienteAvatar ? (
                                        <img
                                            src={atendimento.clienteAvatar}
                                            alt={nomeCliente}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-base font-bold text-primary">{inicialNome}</span>
                                    )}
                                </div>
                                <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-background ${style.dot}`} />
                            </div>

                            <div className="flex-1 min-w-0 space-y-1">
                                <div className="flex items-center justify-between gap-2">
                                    <p className="text-base font-bold text-foreground truncate leading-none">
                                        {nomeCliente}
                                    </p>
                                    <span className="text-xs font-mono text-muted-foreground whitespace-nowrap shrink-0">
                                        {formatarTempoCorrido(atendimento.createdAt)}
                                    </span>
                                </div>

                                <p className="text-xs text-muted-foreground truncate leading-snug">
                                    {ultimaMsg?.texto || "Nenhuma mensagem"}
                                </p>

                                <div className="pt-0.5">
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${style.badge}`}>
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