import Dropdown from "@/components/Dropdown";
import { Images, Paperclip, Send, MessageSquareDashed } from 'lucide-react';

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
                                        <div
                                            className={`px-4 py-2.5 rounded-2xl shadow-xs text-sm leading-relaxed
                                                ${m.fromMe ? "bg-blue-600 text-white rounded-tr-sm" 
                                                : "bg-white text-gray-700 border border-gray-100 rounded-tl-sm"}`}
                                        >
                                            {m.texto}
                                        </div>
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