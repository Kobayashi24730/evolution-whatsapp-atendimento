'use client';

import { Sparkles } from "lucide-react";
import { WelcomeProps } from "@/types/types";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function Welcome({ nomeAtendente }: WelcomeProps) {
    const [saudacao, setSaudacao] = useState<string>("");
    const [motivacao, setMotivacao] = useState<string>("");

    useEffect(() => {
        const hora = new Date().getHours();
        if (hora < 12) {
            setSaudacao("Bom dia");
            setMotivacao("Cada mensagem atendida com atenção transforma um cliente em parceiro. Bom trabalho hoje!");
        } else if (hora < 18) {
            setSaudacao("Boa tarde");
            setMotivacao("O ritmo está ótimo! Mantenha o foco e garanta que nenhum atendimento fique sem resposta.");
        } else {
            setSaudacao("Boa noite");
            setMotivacao("Reta final do dia! Organize as pendências para começar o dia de amanhã com tranquilidade.");
        }
    }, []);

    return (
        <section className="relative overflow-hidden rounded-2xl bg-card border border-border/80 p-8 lg:p-10 shadow-sm transition-all hover:shadow-md">
            {/* Glow de fundo */}
            <div className="absolute -top-12 -right-12 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

            {/* CONTEÚDO PRINCIPAL */}
            <div className="relative z-10 space-y-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-primary/10 text-primary text-sm font-medium tracking-wide border border-primary/20">
                    <Sparkles className="w-4 h-4" />
                    <span>Painel Operacional</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
                    {saudacao}, <span className="text-primary">{nomeAtendente || "Atendente"}</span> 👋
                </h1>

                <p className="text-muted-foreground text-base sm:text-lg max-w-3xl leading-relaxed italic font-normal">
                    "{motivacao}"
                </p>
            </div>

            {/* QUADRADOS FLUTUANTES ANIMADOS */}
            <div className="absolute right-4 top-4 bottom-4 w-60 pointer-events-none hidden sm:block">
                {/* Quadrado Principal (Maior) */}
                <motion.div
                    animate={{
                        y: [-6, 6, -6],
                        rotate: [0, 6, 0],
                        scale: [1, 1.02, 1]
                    }}
                    transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute top-2 right-6 w-20 h-20 rounded-2xl bg-card/60 dark:bg-muted/30 backdrop-blur-md border border-border/60 shadow-lg"
                />

                {/* Quadrado Secundário (Médio) */}
                <motion.div
                    animate={{
                        y: [8, -8, 8],
                        rotate: [0, -12, 0]
                    }}
                    transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.5
                    }}
                    className="absolute top-16 right-24 w-12 h-12 rounded-xl bg-primary/10 backdrop-blur-sm border border-primary/20 shadow-md"
                />

                {/* Quadrado Terciário (Pequeno) */}
                <motion.div
                    animate={{
                        y: [-10, 10, -10],
                        rotate: [0, 15, 0]
                    }}
                    transition={{
                        duration: 7,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1
                    }}
                    className="absolute bottom-4 right-12 w-9 h-9 rounded-lg bg-card/40 dark:bg-muted/20 backdrop-blur-xs border border-border/40 shadow-sm"
                />
            </div>
        </section>
    );
}