'use client';
import { Sparkles } from "lucide-react";
import { WelcomeProps } from "@/types/types";
import { motion } from "framer-motion";

export function Welcome({ saudacao, motivacao, nomeAtendente }: WelcomeProps) {
    
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

            //? Quadrados flutuantes
            <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="absolute -bottom-12 -right-12 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"
            />

        </section>
    );
}