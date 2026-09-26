'use client';

import Link from "next/link";
import { useHome } from "@/hooks/useHome";
import {
    Sparkles,
    Bell,
    MessageSquare,
    Clock,
    CheckCircle2,
    ArrowUpRight,
    ShieldCheck,
    Zap,
    TrendingUp
} from "lucide-react";
import { Welcome } from "@/components/home/welcome";

export default function HomePage() {
    const { status } = useHome();

    // Novidades/Atualizações do Sistema
    const atualizacoesSistema = [
        {
            id: 1,
            versao: "v2.1.0",
            data: "Hoje",
            titulo: "Player de áudio estilo WhatsApp integrado",
            descricao: "Agora os áudios recebidos podem ser ouvidos com controle de progresso e visualização rápida.",
            tipo: "FEATURE"
        },
        {
            id: 2,
            versao: "v2.0.4",
            data: "Ontem",
            titulo: "Suporte a visualização de mídias e PDFs",
            descricao: "Ajustamos o download direto de documentos com nome original e expansão de imagens ao clicar.",
            tipo: "IMPROVEMENT"
        },
        {
            id: 3,
            versao: "v2.0.0",
            data: "Há 3 dias",
            titulo: "Webhook sincronizado com banco Prisma",
            descricao: "Correção crítica de sincronização no recebimento de mensagens e criação de novos atendimentos.",
            tipo: "FIX"
        }
    ];

    return (
        <div className="min-h-screen bg-background text-foreground p-6 lg:p-10 space-y-8 max-w-7xl mx-auto font-sans antialiased">

            {/* SEÇÃO DE BOAS-VINDAS & FRASE MOTIVACIONAL */}
            
            <Welcome nomeAtendente={String(status?.atendenteName)} />

            {/* INFORMAÇÕES RÁPIDAS & MÉTRICAS (KPIs) */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

                {/* Card 1 */}
                <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-sm hover:border-primary/50 transition-all space-y-3">
                    <div className="flex items-center justify-between text-muted-foreground">
                        <span className="text-sm font-semibold tracking-wide uppercase">Atendimentos Hoje</span>
                        <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
                            <MessageSquare className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-3xl sm:text-4xl font-extrabold tracking-tight font-mono">{status?.totalAbertos ?? 0}</div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Atendimentos iniciados no dia</p>
                </div>

                {/* Card 2 */}
                <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-sm hover:border-primary/50 transition-all space-y-3">
                    <div className="flex items-center justify-between text-muted-foreground">
                        <span className="text-sm font-semibold tracking-wide uppercase">Tempo Médio Espera</span>
                        <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
                            <Clock className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-3xl sm:text-4xl font-extrabold tracking-tight font-mono">4 min</div>
                    <p className="text-xs sm:text-sm text-emerald-500 font-semibold flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" /> ↓ 12% em relação a ontem
                    </p>
                </div>

                {/* Card 3 */}
                <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-sm hover:border-primary/50 transition-all space-y-3">
                    <div className="flex items-center justify-between text-muted-foreground">
                        <span className="text-sm font-semibold tracking-wide uppercase">Finalizados Hoje</span>
                        <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-3xl sm:text-4xl font-extrabold tracking-tight font-mono">{status?.totalFinalizados ?? 0}</div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Meta diária recomendada: 30</p>
                </div>

                {/* Card 4 */}
                <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-sm hover:border-primary/50 transition-all space-y-3">
                    <div className="flex items-center justify-between text-muted-foreground">
                        <span className="text-sm font-semibold tracking-wide uppercase">Status do Sistema</span>
                        <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-emerald-500 flex items-center gap-2 pt-1">
                        <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                        Operacional
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Webhook WhatsApp ativo</p>
                </div>

            </section>

            {/* NOTÍCIAS DAS ATUALIZAÇÕES DO SISTEMA E ACESSO RÁPIDO */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Feed de Atualizações */}
                <section className="lg:col-span-2 space-y-5">
                    <div className="flex items-center justify-between border-b border-border/60 pb-3">
                        <div className="flex items-center gap-2.5">
                            <Bell className="w-6 h-6 text-primary" />
                            <h2 className="text-xl font-bold tracking-tight">Atualizações do Sistema</h2>
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">Notas da versão</span>
                    </div>

                    <div className="space-y-4">
                        {atualizacoesSistema.map((item) => (
                            <div
                                key={item.id}
                                className="p-6 rounded-2xl bg-card border border-border/80 shadow-sm hover:border-primary/40 transition-all space-y-3 group"
                            >
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-3">
                                        <span className="px-2.5 py-1 rounded-md bg-primary/10 text-primary font-mono text-xs font-semibold border border-primary/20">
                                            {item.versao}
                                        </span>
                                        <span className="text-muted-foreground font-medium">{item.data}</span>
                                    </div>

                                    {item.tipo === "FEATURE" && (
                                        <span className="text-xs font-bold tracking-wider uppercase text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md">
                                            Novo
                                        </span>
                                    )}
                                    {item.tipo === "IMPROVEMENT" && (
                                        <span className="text-xs font-bold tracking-wider uppercase text-blue-500 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-md">
                                            Melhoria
                                        </span>
                                    )}
                                    {item.tipo === "FIX" && (
                                        <span className="text-xs font-bold tracking-wider uppercase text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-md">
                                            Correção
                                        </span>
                                    )}
                                </div>

                                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                                    {item.titulo}
                                </h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {item.descricao}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Acesso Rápido */}
                <section className="space-y-5">
                    <div className="flex items-center gap-2.5 border-b border-border/60 pb-3">
                        <Zap className="w-6 h-6 text-primary" />
                        <h2 className="text-xl font-bold tracking-tight">Acesso Rápido</h2>
                    </div>

                    <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-sm space-y-6">

                        <Link
                            href="/atendimento"
                            className="flex items-center justify-between p-4 rounded-xl bg-primary text-primary-foreground font-semibold text-base shadow-md hover:bg-primary/90 hover:shadow-lg transition-all active:scale-[0.98]"
                        >
                            <div className="flex items-center gap-3">
                                <MessageSquare className="w-5 h-5" />
                                <span>Abrir Central de Chat</span>
                            </div>
                            <ArrowUpRight className="w-5 h-5" />
                        </Link>

                        <div className="pt-4 border-t border-border/60 space-y-4">
                            <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                                Lembretes Operacionais
                            </h4>

                            <ul className="space-y-3 text-sm text-muted-foreground">
                                <li className="flex items-start gap-3">
                                    <span className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                                    <span>Verificar se há mensagens não lidas com mídia pendente.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                                    <span>Atendimentos sem resposta há mais de 15 minutos são prioridade.</span>
                                </li>
                            </ul>
                        </div>

                    </div>
                </section>

            </div>

        </div>
    );
}