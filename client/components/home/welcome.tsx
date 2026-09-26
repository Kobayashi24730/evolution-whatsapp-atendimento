'use client';
import { Sparkles } from "lucide-react";
import { WelcomeProps } from "@/types/types";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function Welcome({ nomeAtendente }: WelcomeProps) {
    const [saudacao, setSaudacao] = useState<String | null>("");
    const [motivacao, setMotivacao] = useState<String | null>("");

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
        <section className="relative overflow-hidden rounded-2xl bg-card border border-border p-8 lg:p-10 shadow-md transition-all hover:shadow-lg">
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-primary/10 text-primary text-sm font-medium tracking-wide border border-primary/20">
                    <Sparkles className="w-4 h-4" />
                    <span>Painel Operacional</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
                    {saudacao}, <span className="text-primary">{nomeAtendente|| "Atendente"}</span> 👋
                </h1>

                <p className="text-muted-foreground text-base sm:text-lg max-w-3xl leading-relaxed italic font-normal">
                    "{motivacao}"
                </p>
            </div>

            <motion.div
                animate={{ y: [-8, 8, -8], rotate: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-4 right-2 sm:right-6 w-16 h-16 bg-white/10 dark:bg-blue/5 backdrop-blur-md border border-blue/20 rounded-2xl shadow-lg z-0"
           />

        </section>
    );
}