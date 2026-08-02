'use client';

import { useDashboardStats } from "@/hooks/useDashboardStats";
import { Widget } from "@/components/common/widget";
import { AlertCircle, Loader2, ArrowUpRight, Newspaper } from "lucide-react";

export default function FilaUrgestes() {
    const { stats, loading } = useDashboardStats();
    return (
        <div className="space-y-6">
            <Widget title="Prioridade / Fila de Espera" icon={AlertCircle}>
                {loading ? (
                    <div className="p-6 flex justify-center text-gray-400">
                        <Loader2 size={20} className="animate-spin" />
                    </div>
                ) : stats?.filaCritica && stats.filaCritica.length > 0 ? (
                    <ul className="divide-y divide-gray-100">
                        {stats.filaCritica.map((item) => (
                            <li key={item.id} className="p-3.5 hover:bg-gray-50/80 transition-colors cursor-pointer group flex items-center justify-between">
                                <div className="min-w-0 pr-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-gray-900">{item.id}</span>
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                            item.prioridade === "URGENTE" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700"
                                        }`}>
                                                        {item.prioridade}
                                                    </span>
                                    </div>
                                    <p className="text-xs font-medium text-gray-700 mt-0.5 truncate">{item.cliente}</p>
                                    <p className="text-[11px] text-gray-400 truncate">{item.assunto}</p>
                                </div>

                                <div className="text-right shrink-0">
                                    <span className="text-[11px] font-bold text-rose-500 block">{item.tempoEspera}</span>
                                    <ArrowUpRight size={14} className="text-gray-300 group-hover:text-blue-600 transition-colors ml-auto mt-1" />
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="p-6 text-center text-xs text-gray-400">
                        Nenhum chamado pendente no momento.
                    </div>
                )}
            </Widget>
        </div>
    );
}