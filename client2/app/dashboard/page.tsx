'use client';

import {ChartList} from "@/components/atendimento/ChatList";
import {ChatWindow} from "@/components/atendimento/ChatWindow";
import {useAtendimentos} from "@/hooks/useAtendimentos";
import { MessageSquare, Users, Clock, CheckCircle, TrendingUp, RefreshCw } from "lucide-react";

// ── KPI Card ────────────────────────────────────────────
function KpiCard({
                     label,
                     value,
                     icon: Icon,
                     color,
                     sub,
                 }: {
    label: string;
    value: number | string;
    icon: React.ElementType;
    color: string;
    sub?: string;
}) {
    return (
        <div className="bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                <Icon size={16} className="text-white" />
            </div>
            <div className="min-w-0">
                <p className="text-[11px] font-medium text-gray-400 truncate">{label}</p>
                <p className="text-xl font-bold text-gray-800 leading-tight tabular-nums">{value}</p>
                {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
            </div>
        </div>
    );
}

// ── Page ────────────────────────────────────────────────
export default function AtendimentoPage() {
    const {
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
    } = useAtendimentos();

    // KPIs derivados dos dados
    const total         = data.length;
    const abertos       = data.filter((a) => a.status === "ABERTO").length;
    const emAtendimento = data.filter((a) => a.status === "EM_ATENDIMENTO").length;
    const finalizados   = data.filter((a) => a.status === "FECHADO").length;

    return (
        <div className="flex flex-col h-full bg-gray-50">

            {/* ── Header ── */}
            <div className="shrink-0 px-6 pt-6 pb-4 space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Atendimentos</h1>
                        <p className="text-xs text-gray-400 mt-0.5">Gerencie todos os chats em tempo real</p>
                    </div>

                    {/* Indicador de polling */}
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-400 bg-white border border-gray-100 rounded-full px-3 py-1.5 shadow-sm">
                        <RefreshCw size={11} className="animate-spin text-blue-400" />
                        Atualizando...
                    </div>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <KpiCard label="Total"          value={total}         icon={MessageSquare} color="bg-blue-500"   sub={`${total} chats`}              />
                    <KpiCard label="Abertos"        value={abertos}       icon={Clock}         color="bg-emerald-500" sub="aguardando resposta"           />
                    <KpiCard label="Em atendimento" value={emAtendimento} icon={Users}         color="bg-violet-500" sub="atendente ativo"                />
                    <KpiCard label="Finalizados"    value={finalizados}   icon={CheckCircle}   color="bg-gray-400"   sub="hoje"                          />
                </div>
            </div>

            {/* ── Grid principal ── */}
            <div className="flex-1 overflow-hidden px-6 pb-6">
                <div className="h-full grid lg:grid-cols-12 gap-4">
                    <ChartList
                        atendimentos={data}
                        atendimentoAtivoId={atendimentoAtivo?.id}
                        onSelectChat={(id) => setIdAtendimentoAtivo(id)}
                    />
                    <ChatWindow
                        atendimentoAtivo={atendimentoAtivo}
                        mensagens={messagem}
                        msg={msg}
                        error={error}
                        setMsg={setMsg}
                        onSubmit={submitInfos}
                        onFinalizar={finalizarAtendimento}
                        onMudarStatus={mudarStatus}
                    />
                </div>
            </div>
        </div>
    );
}