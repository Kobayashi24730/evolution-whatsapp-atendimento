import Link from "next/link";
import {
    Sparkles,
    Bell,
    MessageSquare,
    Clock,
    Users,
    CheckCircle2,
    ArrowUpRight,
    ShieldCheck,
    Zap
} from "lucide-react";

export default function HomePage() {
    // Dados simulados (no seu app, você pode buscar do backend ou sessão)
    const usuario = {
        nome: "Raimunda",
        role: "Atendente"
    };

    // Frase motivacional baseada na hora atual
    const getSaudacaoEMotivacao = () => {
        const hora = new Date().getHours();
        if (hora < 12) {
            return {
                saudacao: "Bom dia",
                motivacao: "Cada mensagem atendida com atenção transforma um cliente em parceiro. Bom trabalho hoje!"
            };
        } else if (hora < 18) {
            return {
                saudacao: "Boa tarde",
                motivacao: "O ritmo está ótimo! Mantenha o foco e garanta que nenhum atendimento fique sem resposta."
            };
        } else {
            return {
                saudacao: "Boa noite",
                motivacao: "Reta final do dia! Organize as pendências para começar o dia de amanhã com tranquilidade."
            };
        }
    };

    const { saudacao, motivacao } = getSaudacaoEMotivacao();

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
        <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">

            {/* 1. SEÇÃO DE BOAS-VINDAS & FRASE MOTIVACIONAL */}
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-6 sm:p-8 shadow-sm">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

                <div className="relative z-10 space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide border border-primary/20">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Painel do Atendente</span>
                    </div>

                    <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">
                        {saudacao}, <span className="text-primary">{usuario.nome}</span>! 👋
                    </h1>

                    <p className="text-muted-foreground text-sm sm:text-base max-w-2xl leading-relaxed italic">
                        "{motivacao}"
                    </p>
                </div>
            </section>

            {/* 2. INFORMAÇÕES RÁPIDAS & MÉTRICAS */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                <div className="p-5 rounded-2xl bg-card border border-border/60 shadow-sm hover:border-border transition-colors space-y-2">
                    <div className="flex items-center justify-between text-muted-foreground">
                        <span className="text-xs font-medium">Atendimentos Abertos</span>
                        <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                            <MessageSquare className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold">12</div>
                    <p className="text-[11px] text-muted-foreground">Aguardando sua resposta</p>
                </div>

                <div className="p-5 rounded-2xl bg-card border border-border/60 shadow-sm hover:border-border transition-colors space-y-2">
                    <div className="flex items-center justify-between text-muted-foreground">
                        <span className="text-xs font-medium">Tempo Médio de Espera</span>
                        <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                            <Clock className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold">4 min</div>
                    <p className="text-[11px] text-emerald-500 font-medium">↓ 12% em relação a ontem</p>
                </div>

                <div className="p-5 rounded-2xl bg-card border border-border/60 shadow-sm hover:border-border transition-colors space-y-2">
                    <div className="flex items-center justify-between text-muted-foreground">
                        <span className="text-xs font-medium">Finalizados Hoje</span>
                        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                            <CheckCircle2 className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold">28</div>
                    <p className="text-[11px] text-muted-foreground">Meta diária: 30</p>
                </div>

                <div className="p-5 rounded-2xl bg-card border border-border/60 shadow-sm hover:border-border transition-colors space-y-2">
                    <div className="flex items-center justify-between text-muted-foreground">
                        <span className="text-xs font-medium">Status do Sistema</span>
                        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                            <ShieldCheck className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-lg font-bold text-emerald-500 flex items-center gap-1.5 pt-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        Operacional
                    </div>
                    <p className="text-[11px] text-muted-foreground">Webhook WhatsApp ativo</p>
                </div>

            </section>

            {/* 3. NOTÍCIAS DAS ATUALIZAÇÕES DO SISTEMA E ACESSO RÁPIDO */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Feed de Atualizações (2 Colunas no Desktop) */}
                <section className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Bell className="w-5 h-5 text-primary" />
                            <h2 className="text-lg font-bold tracking-tight">Atualizações do Sistema</h2>
                        </div>
                        <span className="text-xs text-muted-foreground">Notas da versão</span>
                    </div>

                    <div className="space-y-3">
                        {atualizacoesSistema.map((item) => (
                            <div
                                key={item.id}
                                className="p-4 rounded-2xl bg-card border border-border/60 shadow-sm hover:border-border/80 transition-all space-y-2 group"
                            >
                                <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary font-mono font-semibold">
                      {item.versao}
                    </span>
                                        <span className="text-muted-foreground">{item.data}</span>
                                    </div>

                                    {item.tipo === "FEATURE" && (
                                        <span className="text-[10px] uppercase tracking-wider font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      Novo
                    </span>
                                    )}
                                    {item.tipo === "IMPROVEMENT" && (
                                        <span className="text-[10px] uppercase tracking-wider font-semibold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full">
                      Melhoria
                    </span>
                                    )}
                                    {item.tipo === "FIX" && (
                                        <span className="text-[10px] uppercase tracking-wider font-semibold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                      Correção
                    </span>
                                    )}
                                </div>

                                <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                                    {item.titulo}
                                </h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    {item.descricao}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Informações Úteis & Acesso Rápido (1 Coluna) */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-primary" />
                        <h2 className="text-lg font-bold tracking-tight">Acesso Rápido</h2>
                    </div>

                    <div className="p-5 rounded-2xl bg-card border border-border/60 shadow-sm space-y-4">

                        <Link
                            href="/chat"
                            className="flex items-center justify-between p-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
                        >
                            <div className="flex items-center gap-2.5">
                                <MessageSquare className="w-4 h-4" />
                                <span>Ir para a Central de Chat</span>
                            </div>
                            <ArrowUpRight className="w-4 h-4" />
                        </Link>

                        <div className="pt-2 border-t border-border/40 space-y-3">
                            <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                                Lembretes do Dia
                            </h4>

                            <ul className="space-y-2 text-xs text-muted-foreground">
                                <li className="flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                    <span>Verificar se há mensagens não lidas com mídia pendente.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
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