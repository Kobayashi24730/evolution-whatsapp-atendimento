'use client';

import {useEffect, useState} from "react";
import {Images, MessageSquareDashed, Paperclip, Send} from "lucide-react";
import UseAudio from "@/components/atendimento/useAudio";
import {ChatWindowProps} from "@/types/types";
import { useRouter } from "next/navigation";


const statusStyles: Record<string, { badge: string; dot: string }> = {
    ABERTO:         { badge: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-400" },
    EM_ATENDIMENTO: { badge: "bg-blue-50   text-blue-700   border-blue-200",     dot: "bg-blue-400"    },
    TRIAGEM:        { badge: "bg-amber-50  text-amber-700  border-amber-200",    dot: "bg-amber-400"   },
    FECHADO:        { badge: "bg-gray-100  text-gray-500   border-gray-200",     dot: "bg-gray-300"    },
    AGUARDANDO:     { badge: "bg-purple-50 text-purple-700 border-purple-200",   dot: "bg-purple-400"  },
};
const statusDefault = { badge: "bg-gray-100 text-gray-600 border-gray-200", dot: "bg-gray-300" };
const statusLabel: Record<string, string> = {
    ABERTO:         "Aberto",
    EM_ATENDIMENTO: "Em atendimento",
    TRIAGEM:        "Triagem",
    FECHADO:        "Fechado",
    AGUARDANDO:     "Aguardando",
};

function dataUriToBlobUrl(dataUri: string): string | null {
    try {
        const [meta, base64] = dataUri.split(",");
        const mimeMatch = meta.match(/data:(.*);base64/);
        const mime = mimeMatch?.[1] || "application/octet-stream";
        const byteString = atob(base64);
        const bytes = new Uint8Array(byteString.length);
        for (let i = 0; i < byteString.length; i++) {
            bytes[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: mime });
        return URL.createObjectURL(blob);
    } catch (err) {
        console.error("Falha ao converter mídia para Blob URL:", err);
        return null;
    }
}

export default function ChatWindow({ id }: ChatWindowProps) {
    const router = useRouter();
    const [data, setData] = useState<any>(null);
    const [mensagens, setMensagem] = useState<any>([]);

    useEffect(() => {
        searchAtendimento();
    }, [id]);

    const searchAtendimento = async () => {
        try {
            const response = await fetch("/api/atendimento");
            if (!response.ok) {
                throw new Error("Erro ao buscar atendimento");
            }
            const lista = await response.json();
            const item = lista.data.find((i: any) => i.id === id);
            setData(item);
            if (item) {
                getMensagems(item.id);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const getMensagems = async (id: any) => {
        try {
            const response = await fetch(`/api/mensagens?atendimentoId=${id}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            if (!response.ok) {
                throw new Error(`Erro ao buscar mensagens: ${response.status}`);
            }
            const res = await response.json();
            setMensagem(res.data ?? []);
        } catch (error) {
            console.error("Erro ao buscar mensagens:", error);
            setMensagem([]);
        }
    };

    const handleGoToChat = () => {
        router.push(`/atendimento?id=${data.id}`);
    };

    const style = data?.status ? statusStyles[data.status] : statusDefault;

    return (
        <section className="lg:col-span-8 h-[calc(100vh-150px)] flex flex-col bg-card border border-border/70 rounded-xl overflow-hidden shadow-sm font-sans">
            {data ? (
                <>
                    {/* Header do Chat */}
                    <div className="shrink-0 flex items-center justify-between gap-3 px-5 py-3 border-b border-border/70 bg-card">
                        <div className="flex items-center gap-3.5 min-w-0">
                            <div className="relative shrink-0">
                                <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden">
                                    {data.clienteAvatar ? (
                                        <img
                                            src={data.clienteAvatar}
                                            alt="Avatar"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-base font-bold text-primary">
                                            {data.clienteNome?.charAt(0).toUpperCase() ?? "?"}
                                        </span>
                                    )}
                                </div>
                                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-background rounded-full" />
                            </div>

                            <div className="min-w-0 space-y-0.5">
                                <h2 className="font-bold text-foreground text-base leading-none truncate">
                                    {data.clienteNome || "Cliente sem nome"}
                                </h2>
                                <p className="text-xs font-mono text-muted-foreground truncate">
                                    {data.clienteNumero}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                            <button
                                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all cursor-pointer"
                                title="Imagens"
                            >
                                <Images size={18} />
                            </button>
                            <button
                                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all cursor-pointer"
                                title="Anexar"
                            >
                                <Paperclip size={18} />
                            </button>

                            <div className="w-px h-5 bg-border mx-1" />
                            <span
                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${style.badge}`}
                            >
                                {statusLabel[data.status] ?? data.status}
                            </span>
                        </div>
                    </div>

                    {/* Área das Mensagens */}
                    <div className="flex-1 overflow-y-auto px-5 py-4 bg-muted/20 custom-scrollbar">
                        {mensagens.length > 0 ? (
                            <div className="flex flex-col gap-3.5">
                                {mensagens.map((m: any) => (
                                    <div
                                        key={m.id}
                                        className={`flex flex-col max-w-[75%] ${
                                            m.fromMe ? "self-end items-end" : "self-start items-start"
                                        }`}
                                    >
                                        <span className="text-[11px] font-medium text-muted-foreground mb-1 px-1">
                                            {m.fromMe ? "Você" : data.clienteNome || "Cliente"}
                                        </span>

                                        {/* Imagem */}
                                        {m.mediaUrl && m.tipo === "IMAGE" && (() => {
                                            const imageSrc =
                                                m.mediaUrl.startsWith("data:") || m.mediaUrl.startsWith("http")
                                                    ? m.mediaUrl
                                                    : `data:image/jpeg;base64,${m.mediaUrl}`;
                                            const handleOpenImage = () => {
                                                if (imageSrc.startsWith("http")) {
                                                    window.open(imageSrc, "_blank", "noopener,noreferrer");
                                                    return;
                                                }
                                                const blobUrl = dataUriToBlobUrl(imageSrc);
                                                if (blobUrl) {
                                                    window.open(blobUrl, "_blank", "noopener,noreferrer");
                                                }
                                            };
                                            return (
                                                <div
                                                    onClick={handleOpenImage}
                                                    className="relative group max-w-sm mt-0.5 overflow-hidden rounded-xl border border-border/50 bg-card shadow-xs transition-all duration-200 hover:shadow-md cursor-pointer"
                                                >
                                                    <img
                                                        src={imageSrc}
                                                        alt={m.caption || "Imagem da conversa"}
                                                        loading="lazy"
                                                        className="w-full h-auto max-h-[320px] object-cover transition-transform duration-300 group-hover:scale-[1.01]"
                                                    />
                                                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center text-white">
                                                        <div className="p-2.5 rounded-xl bg-black/60 backdrop-blur-md">
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                width="18"
                                                                height="18"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth="2"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                            >
                                                                <circle cx="11" cy="11" r="8" />
                                                                <line x1="21" x2="16.65" y1="21" y2="16.65" />
                                                                <line x1="11" x2="11" y1="8" y2="14" />
                                                                <line x1="8" x2="14" y1="11" y2="11" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                    {m.caption && (
                                                        <div className="p-3 text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap break-words border-t border-border/30 bg-card">
                                                            {m.caption}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })()}

                                        {/* Áudio */}
                                        {m.mediaUrl && m.tipo === "AUDIO" && <UseAudio m={m} />}

                                        {/* Vídeo */}
                                        {m.mediaUrl && m.tipo === "VIDEO" && (() => {
                                            const videoSrc =
                                                m.mediaUrl.startsWith("data:") || m.mediaUrl.startsWith("http")
                                                    ? m.mediaUrl
                                                    : `data:video/mp4;base64,${m.mediaUrl}`;
                                            return (
                                                <div className="relative group max-w-xs sm:max-w-sm mt-0.5 overflow-hidden rounded-xl border border-border/50 bg-black/90 shadow-xs">
                                                    <div className="relative flex items-center justify-center min-h-[180px]">
                                                        <video controls src={videoSrc} className="rounded-lg max-w-full" />
                                                    </div>
                                                    {m.caption && (
                                                        <div className="p-3 text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap break-words border-t border-border/30 bg-card">
                                                            {m.caption}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })()}

                                        {/* Documento */}
                                        {m.mediaUrl && m.tipo === "DOCUMENT" && (() => {
                                            const isPdf = m.mediaName?.toLowerCase().endsWith(".pdf");
                                            const defaultMime = isPdf ? "application/pdf" : "application/octet-stream";
                                            const fileSrc = m.mediaUrl.startsWith("data:")
                                                ? m.mediaUrl
                                                : `data:${defaultMime};base64,${m.mediaUrl}`;
                                            const finame = m.mediaName || (isPdf ? "documento.pdf" : "documento");
                                            return (
                                                <a
                                                    href={fileSrc}
                                                    download={finame}
                                                    rel="noopener noreferrer"
                                                    target="_blank"
                                                    className="mt-0.5 flex items-center gap-3 p-3 bg-card hover:bg-muted/60 border border-border/70 rounded-xl transition-all duration-150 group max-w-xs sm:max-w-sm no-underline shadow-xs"
                                                >
                                                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary shrink-0 group-hover:scale-105 transition-transform">
                                                        <span className="text-xl">📄</span>
                                                    </div>
                                                    <div className="flex-1 min-w-0 overflow-hidden">
                                                        <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                                                            {finame}
                                                        </p>
                                                        <p className="text-[10px] text-muted-foreground uppercase font-mono font-bold mt-0.5">
                                                            {isPdf ? "PDF • Clique para baixar" : "Documento"}
                                                        </p>
                                                    </div>
                                                    <div className="text-muted-foreground group-hover:text-primary transition-colors pr-1">
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            width="16"
                                                            height="16"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        >
                                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                            <polyline points="7 10 12 15 17 20" />
                                                            <line x1="12" x2="12" y1="15" y2="3" />
                                                        </svg>
                                                    </div>
                                                </a>
                                            );
                                        })()}

                                        {/* Texto Simples */}
                                        {m.texto && !["IMAGE", "VIDEO", "AUDIO"].includes(m.tipo) && (
                                            <div
                                                className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-xs ${
                                                    m.fromMe
                                                        ? "bg-primary text-primary-foreground font-medium rounded-tr-xs"
                                                        : "bg-card text-foreground border border-border/70 rounded-tl-xs"
                                                }`}
                                            >
                                                {m.texto}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center gap-3 text-center">
                                <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center">
                                    <MessageSquareDashed size={22} className="text-muted-foreground" />
                                </div>
                                <p className="text-sm font-medium text-muted-foreground">Nenhuma mensagem ainda</p>
                            </div>
                        )}
                    </div>

                    {/* Banner para Redirecionamento ao Chat */}
                    <div className="shrink-0 flex items-center justify-center px-4 py-3 bg-card border-t border-border/70 text-xs sm:text-sm text-muted-foreground text-center">
                        <div className="flex items-center gap-2 flex-wrap justify-center">
                            <span>Para responder esta conversa:</span>
                            <button
                                onClick={handleGoToChat}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-xl active:scale-95 transition-all cursor-pointer"
                            >
                                Abrir atendimento no Chat →
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-center">
                    <div className="w-14 h-14 bg-muted/60 rounded-2xl flex items-center justify-center border border-border/40">
                        <MessageSquareDashed size={28} className="text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-base font-bold text-foreground">Nenhum chat selecionado</p>
                        <p className="text-xs text-muted-foreground">
                            Selecione um atendimento na lista ao lado para visualizar o histórico
                        </p>
                    </div>
                </div>
            )}
        </section>
    );
}