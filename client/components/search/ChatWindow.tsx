'use client';

import {useEffect, useState} from "react";
import {Images, MessageSquareDashed, Paperclip, Send} from "lucide-react";
import UseAudio from "@/components/atendimento/useAudio";
import {ChatWindowProps} from "@/types/types";


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

export default function ChatWindow({id}: ChatWindowProps) {
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
    }

    const getMensagems = async (id: any) => {
        try {
            const response = await fetch(`/api/mensagens?atendimentoId=${id}`, {
                method: "GET",
                headers: { 'Content-Type': 'application/json' },
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
    }

    const style = data?.status ? (statusStyles[data.status]) : statusDefault;
    return (
        <div className="lg:col-span-8 h-[calc(100vh-150px)] flex flex-col bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            {data ? (
                <>
                    <div className="shrink-0 flex items-center justify-between gap-3 px-5 py-3 border-b border-gray-100 bg-white">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="relative shrink-0">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 border border-blue-100 flex items-center justify-center overflow-hidden">
                                    {data.clienteAvatar ? (
                                        <img
                                            src={data.clienteAvatar}
                                            alt="Avatar"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-sm font-bold text-blue-600">{data.clienteNome?.charAt(0).toUpperCase() ?? "?"}</span>
                                    )}
                                </div>
                            </div>

                            <div className="min-w-0">
                                <h2 className="font-semibold text-gray-800 text-sm leading-tight truncate">{data.clienteNome || "Cliente sem nome"}</h2>
                                <p className="text-[11px] text-gray-400 truncate">{data.clienteNumero}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                            <button className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors" title="Imagens">
                                <Images size={18} />
                            </button>
                            <button className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors" title="Anexar">
                                <Paperclip size={18} />
                            </button>

                            <div className="w-px h-5 bg-gray-200 mx-1" />
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${style.badge}`}>
                                {statusLabel[data.status] ?? data.status}
                            </span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-5 py-4 bg-slate-50 custom-scrollbar">
                        {mensagens.length > 0 ? (
                            <div className="flex flex-col gap-3">
                                {mensagens.map((m: any) => (
                                    <div key={m.id} className={`flex flex-col max-w-[72%] ${m.fromMe ? "self-end items-end" : "self-start items-start"}`}>
                                        <span className="text-[10px] font-medium text-gray-400 mb-1 px-1">
                                            {m.fromMe ? "Você" : data.clienteNome || "Cliente"}
                                        </span>
                                        {m.mediaUrl && m.tipo === "IMAGE" && (() => {
                                            const imageSrc = m.mediaUrl.startsWith("data:") || m.mediaUrl.startsWith("http") ? m.mediaUrl : `data:image/jpeg;base64,${m.mediaUrl}`;
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
                                            return(
                                                <div onClick={handleOpenImage} className="relative group max-w-sm mt-1 overflow-hidden rounded-xl border border-border/40 shadow-sm transition-all duration-200 hover:shadow-md">
                                                    <img
                                                        src={imageSrc}
                                                        alt={m.caption || "Imagem da conversa"}
                                                        loading="lazy"
                                                        className="w-full h-auto max-h-[320px] object-cover transition-transform duration-300 group-hover:scale-[1.02] active:scale-[0.98]"
                                                    />
                                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center text-white">
                                                        <div className="p-2 rounded-full bg-black/50 backdrop-blur-sm">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <circle cx="11" cy="11" r="8"/>
                                                                <line x1="21" x2="16.65" y1="21" y2="16.65"/>
                                                                <line x1="11" x2="11" y1="8" y2="14"/>
                                                                <line x1="8" x2="14" y1="11" y2="11"/>
                                                            </svg>
                                                        </div>
                                                    </div>
                                                    {m.caption && (
                                                        <div className="p-2.5 pt-2 text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap break-words border-t border-border/20">
                                                            {m.caption}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })()}
                                        {m.mediaUrl && m.tipo === "AUDIO" && (
                                            <UseAudio m={m}/>
                                        )}
                                        {m.mediaUrl && m.tipo === "VIDEO" && (() => {
                                            const videoSrc = m.mediaUrl.startsWith("data:") || m.mediaUrl.startsWith("http")
                                                ? m.mediaUrl
                                                : `data:video/mp4;base64,${m.mediaUrl}`;
                                            return(
                                                <div className="relative group max-w-xs sm:max-w-sm mt-1 overflow-hidden rounded-2xl border border-border/40 bg-black/10 dark:bg-black/40 shadow-sm transition-all duration-200 hover:shadow-md">
                                                    <div className="relative flex items-center justify-center bg-black/80 min-h-[180px]">
                                                        <video
                                                            controls
                                                            src={videoSrc}
                                                            className="rounded-lg max-w-full mt-1"
                                                        />
                                                    </div>
                                                    {m.caption && (
                                                        <div className="p-2.5 pt-2 text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap break-words border-t border-border/20 bg-card/50">
                                                            {m.caption}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })()}

                                        {m.mediaUrl && m.tipo === "DOCUMENT" && (() => {
                                            const isPdf = m.mediaName?.toLowerCase().endsWith(".pdf");
                                            const defaultMime = isPdf ? "application/pdf" : "application/octet-stream";
                                            const fileSrc = m.mediaUrl.startsWith("data:") ? m.mediaUrl : `data:${defaultMime};base64,${m.mediaUrl}`;
                                            const finame = m.mediaName || (isPdf ? "documento.pdf" : "documento");
                                            return (
                                                <a
                                                    href={fileSrc}
                                                    download={finame}
                                                    rel="noopener noreferrer"
                                                    target="_blank"
                                                    className="mt-1.5 flex items-center gap-3 p-2.5 px-3 bg-muted/40 hover:bg-muted/70 border border-border/40 rounded-xl transition-all duration-200 group max-w-xs sm:max-w-sm no-underline">
                                                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary shrink-0 group-hover:scale-105 transition-transform">
                                                        <span className="text-lg">📄</span>
                                                    </div>
                                                    <div className="flex-1 min-w-0 overflow-hidden">
                                                        <p className="text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors">
                                                            {finame}
                                                        </p>
                                                        <p className="text-[10px] text-muted-foreground uppercase font-semibold">{isPdf ? "PDF clique para baixar" : "Documento"}</p>
                                                    </div>
                                                    <div className="text-muted-foreground group-hover:text-primary transition-colors pr-1">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                                            <polyline points="7 10 12 15 17 20" />
                                                            <line x1="12" x2="12" y1="15" y2="3"/>
                                                        </svg>
                                                    </div>
                                                </a>
                                            );
                                        })()}
                                        {m.texto && !["IMAGE","VIDEO","AUDIO"].includes(m.tipo) && (
                                            <div
                                                className={`px-4 py-2.5 rounded-2xl shadow-xs text-sm leading-relaxed
                                                ${m.fromMe ? "bg-blue-600 text-white rounded-tr-sm"
                                                    : "bg-white text-gray-700 border border-gray-100 rounded-tl-sm"}`}
                                            >
                                                {m.texto}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center gap-3 text-center">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                                    <MessageSquareDashed size={22} className="text-gray-400" />
                                </div>
                                <p className="text-sm text-gray-400">Nenhuma mensagem ainda</p>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center justify-center text-xs sm:text-sm text-gray-500 border-t border-gray-100 pt-4 mt-2 text-center">
                        <p className="flex items-center gap-1.5 flex-wrap justify-center">
                            <span>Para enviar uma mensagem, clique no botão</span>
                            <button className="inline-flex items-center justify-center px-2.5 py-1 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 hover:text-blue-700 active:scale-95 transition-all cursor-pointer">
                                Ir para chat →
                            </button>
                        </p>
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
                        <MessageSquareDashed size={28} className="text-gray-400" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-600">Nenhum chat selecionado</p>
                        <p className="text-xs text-gray-400 mt-1">Selecione um atendimento na lista para começar</p>
                    </div>
                </div>
            )}
        </div>
    );
}