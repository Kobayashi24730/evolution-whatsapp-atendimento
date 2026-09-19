import { Prisma } from "@prisma/client";
import React from "react";
import MediaAttachment from '../components/common/MediaAttachment';


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

export interface AttachmentItem {
    id: string;
    name: string;
    url: string;
    type: "image" | "video" | "docuement";
    size: number;
    createAt: string;
}
export interface MediaAttachmentProps {
    files?: AttachmentItem[];
    onUpload?: (files: FileList, type: "media" | "document") => void;
    onSelectFile?: (file: AttachmentItem) => void;
    mode?: "upload-actions" | "list" | "full";
    className?: string;
}

export interface HomeStats {
    totalCriadosHoje: number;
    totalAbertos: number;
    totalFinalizados: number;
    atendenteName: string;
}
export interface fututosKPIs {
    totalAbertos: number;
    aguardandoAprovacao: number;
    concluidos: number;
    vencidos: number;
    respostaVencida: number;
    aVencerHoje: number;
    meusVencidos: number;
}

export interface ChatListProps {
    atendimentos?: AtendimentoComTipo[];
    atendimentoAtivoId?: string;
    onSelectChat: (id: string) => void;
}

export type StatusConfig = {
    badge: string;
    dot: string;
};