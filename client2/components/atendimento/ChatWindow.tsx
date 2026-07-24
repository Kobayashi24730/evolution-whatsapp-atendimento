import Dropdown from "@/components/Dropdown";
import { Images, Paperclip, Send, MessageSquareDashed } from 'lucide-react';
import UseAudio from "@/components/atendimento/useAudio";

interface ChatWindowProps {
    atendimentoAtivo: any;
    mensagens: any[];
    msg: string;
    error: string | null;
    setMsg: (value: string) => void;
    onSubmit: () => void;
    onFinalizar: (id: string | number) => void;
    onMudarStatus: (id: string | number, status: string) => void;
}

export function ChatWindow({
                               atendimentoAtivo,
                               mensagens,
                               msg,
                               error,
                               setMsg,
                               onSubmit,
                               onFinalizar,
                               onMudarStatus,
                           }: ChatWindowProps) {
    return (
        <section className="lg:col-span-8 h-[calc(100vh-150px)] flex flex-col bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            {atendimentoAtivo ? (
                <>
                    <div className="shrink-0 flex items-center justify-between gap-3 px-5 py-3 border-b border-gray-100 bg-white">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="relative shrink-0">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 border border-blue-100 flex items-center justify-center overflow-hidden">
                                    {atendimentoAtivo.clienteAvatar ? (
                                        <img
                                            src={atendimentoAtivo.clienteAvatar}
                                            alt="Avatar"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-sm font-bold text-blue-600">{atendimentoAtivo.clienteNome?.charAt(0).toUpperCase() ?? "?"}</span>
                                    )}
                                </div>
                                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
                            </div>

                            <div className="min-w-0">
                                <h2 className="font-semibold text-gray-800 text-sm leading-tight truncate">{atendimentoAtivo.clienteNome || "Cliente sem nome"}</h2>
                                <p className="text-[11px] text-gray-400 truncate">{atendimentoAtivo.clienteNumero}</p>
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
                            <Dropdown status={atendimentoAtivo.status} onSelect={(status) => onMudarStatus(atendimentoAtivo.id, status)}/>
                            <button
                                onClick={() => onFinalizar(atendimentoAtivo.id)}
                                className="ml-1 text-xs font-semibold text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 active:scale-95 transition-all"
                            >
                                Finalizar
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-5 py-4 bg-slate-50 custom-scrollbar">
                        {mensagens.length > 0 ? (
                            <div className="flex flex-col gap-3">
                                {mensagens.map((m: any) => (
                                    <div key={m.id} className={`flex flex-col max-w-[72%] ${m.fromMe ? "self-end items-end" : "self-start items-start"}`}>
                                        <span className="text-[10px] font-medium text-gray-400 mb-1 px-1">
                                            {m.fromMe ? "Você" : atendimentoAtivo.clienteNome || "Cliente"}
                                        </span>
                                        {m.mediaUrl && m.tipo === "IMAGE" && (() => {
                                            const imageSrc = m.mediaUrl.startsWith("data:") || m.mediaUrl.startsWith("http") ? m.mediaUrl : `data:image/jpeg;base64,${m.mediaUrl}`;
                                            const handleOpenImage = () => {
                                                if (m.mediaUrl.startsWith("http")) {
                                                    window.open(m.mediaUrl, "_black", "noopener,noreferrer");
                                                } else {
                                                    const imageWindow = window.open("");
                                                    imageWindow?.document.write(
                                                        `<body style="margin:0; background:#0e0e0e; display:flex; align-items:center; justify-center:center; height:100vh;">
                                                          <img src="${imageSrc}" style="max-width:100%; max-height:100vh; object-fit:contain; margin:auto;" />
                                                        </body>`
                                                    );
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
                                            const videoSrc = m.mediaUrl.startsWith("data:") || m.mediaUrl.startsWith("http") ? m.mediaUrl : `data:video/mp4;base64,${m.mediaUrl}`;
                                            return(
                                                <div className="relative group max-w-xs sm:max-w-sm mt-1 overflow-hidden rounded-2xl border border-border/40 bg-black/10 dark:bg-black/40 shadow-sm transition-all duration-200 hover:shadow-md">
                                                    <div className="relative flex items-center justify-center bg-black/80 min-h-[180px]">
                                                        <video
                                                            controls src={m.mediaUrl.startsWith("data:") ? m.mediaUrl : `data:video/mp4/base64,${m.mediaUrl}`}
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
                                        {/*Ajustado sistema pata baixar o documento ja pronto*/}
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

                    <div className="shrink-0 px-4 py-3 border-t border-gray-100 bg-white">
                        {error && (<p className="text-xs text-red-500 mb-2 px-1">{error}</p>)}
                        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                            <input
                                type="text"
                                placeholder="Digite sua mensagem..."
                                value={msg}
                                onChange={(e) => setMsg(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && onSubmit()}
                                className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder:text-gray-400"
                            />
                            <button
                                onClick={onSubmit}
                                disabled={!msg.trim()}
                                className="shrink-0 flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold px-3.5 py-2 rounded-lg active:scale-95 transition-all"
                            >
                                <Send size={13} />
                                Enviar
                            </button>
                        </div>
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
        </section>
    );
}