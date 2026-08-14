import { Prisma } from "@prisma/client";
import React from "react";


export interface ChatWindowProps {
    id: string;
}

export type AtendimentoComTipo = Prisma.AtendimentoGetPayload<{
    include: {
        mensagens: true;
    }
}>;

export interface DashboardKPIs {
    totalAbertos: number;
    aguardandoAprovacao: number;
    concluidos: number;
    vencidos: number;
    respostaVencida: number;
    aVencerHoje: number;
    meusVencidos: number;
}

export interface ChamadoCritico {
    id: string;
    cliente: string;
    tempoEspera: string;
    prioridade: "ALTA" | "URGENTE";
    assunto: string;
}

export interface DashboardStatsData {
    kpis: DashboardKPIs;
    filaCritica: ChamadoCritico[];
}

export interface KpiProps {
    label: string;
    value: number;
    icon: React.ElementType;
    bg: string;
    iconBg: string;
}

export interface WidgetProps {
    title: string;
    icon?: React.ElementType;
    children: React.ReactNode;
    className?: string;
    onHeaderAction?: () => void;
}