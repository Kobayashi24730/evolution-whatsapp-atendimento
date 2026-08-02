'use client';

import { ChartAtendimentos } from "@/components/Chart";
import FilaUrgestes from "@/components/dashboard/Fila";
import { KpiProps } from "@/types/types";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { Headphones, Clock, CheckCircle, AlertTriangle, MessageSquare, Timer, XCircle, Newspaper } from "lucide-react";
import { Widget } from "@/components/common/widget";

function KpiCard({ label, value, icon: Icon, bg, iconBg }: KpiProps) {
    return (
        <div className={`relative flex items-center justify-between p-4 rounded-xl text-white shadow-sm overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${bg}`}>
            <div className={`absolute -right-3 -bottom-3 w-16 h-16 rounded-full opacity-25 ${iconBg}`} />

            <div className="flex flex-col justify-between z-10 space-y-2">
                <p className="text-xs font-medium opacity-90 leading-tight line-clamp-2">{label}</p>
                <p className="text-2xl font-extrabold tracking-tight tabular-nums">{value}</p>
            </div>

            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${iconBg} bg-opacity-30 z-10 shadow-sm`}>
                <Icon size={20} className="text-white" />
            </div>
        </div>
    );
}


export default function DashboardChamados() {
    const { stats, loading } = useDashboardStats();

    const noticias = [
        { data: "24/08", hora: "14:50", titulo: "Projetos e Melhorias DAFI/S", descricao: "Manutenção programada dos servidores..." },
        { data: "24/08", hora: "14:50", titulo: "Prodafis Grupos de Acesso",    descricao: "Atualização de permissões para usuários." },
        { data: "24/08", hora: "14:51", titulo: "Treinamento em SIAGRO",        descricao: "Nova sessão marcada para a próxima semana." },
    ];

    const kpis: KpiProps[] = [
        { label: "Chamados abertos",                          value: stats?.kpis?.totalAbertos ?? 0,          icon: Headphones,   bg: "bg-blue-600",   iconBg: "bg-blue-500"   },
        { label: "Aguardando aprovação",                      value: stats?.kpis?.aguardandoAprovacao ?? 0,  icon: Clock,        bg: "bg-slate-700",  iconBg: "bg-slate-600"  },
        { label: "Chamados concluídos",                       value: stats?.kpis?.concluidos ?? 0,           icon: CheckCircle,  bg: "bg-emerald-600",iconBg: "bg-emerald-500"},
        { label: "Vencidos não concluídos",                   value: stats?.kpis?.vencidos ?? 0,             icon: AlertTriangle,bg: "bg-amber-500",  iconBg: "bg-amber-400"  },
        { label: "1ª Resposta vencida",                       value: stats?.kpis?.respostaVencida ?? 0,      icon: MessageSquare,bg: "bg-yellow-600", iconBg: "bg-yellow-500" },
        { label: "A vencer hoje",                             value: stats?.kpis?.aVencerHoje ?? 0,          icon: Timer,        bg: "bg-rose-500",   iconBg: "bg-rose-400"   },
        { label: "Meus chamados vencidos",                    value: stats?.kpis?.meusVencidos ?? 0,         icon: XCircle,      bg: "bg-orange-600", iconBg: "bg-orange-500" },
    ];

    return (
        <div className="min-h-screen bg-gray-50/60 text-gray-800">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

                {/* Grid de KPIs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {kpis.map((kpi, i) => (
                        <KpiCard key={kpi.label || i} {...kpi} />
                    ))}
                </div>

                {/* Grid Principal: Gráficos e Widgets */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Gráfico de Atendimentos */}
                    <div className="lg:col-span-2 bg-white border border-gray-200/70 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                        <ChartAtendimentos />
                    </div>

                    <div>
                        <FilaUrgestes />

                        <Widget title="Últimas Notícias" icon={Newspaper}>
                            <ul className="divide-y divide-gray-100">
                                {noticias.map((n, i) => (
                                    <li key={i} className="p-3.5 hover:bg-gray-50/80 transition-colors cursor-pointer group">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <p className="text-xs font-semibold text-gray-800 group-hover:text-blue-600 transition-colors truncate">
                                                    {n.data} – {n.titulo}
                                                </p>
                                                <p className="text-[11px] text-gray-500 mt-0.5 truncate">{n.descricao}</p>
                                            </div>
                                            <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-md shrink-0">
                                                {n.hora}
                                            </span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </Widget>
                    </div>

                </div>
            </main>
        </div>
    );
}