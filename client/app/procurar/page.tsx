'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Hash, Phone, Loader2, SearchX, X } from "lucide-react";
import ChatWindow from "@/components/search/ChatWindow";

interface Card {
    id: string | number;
    clienteNumero: string;
    clienteNome: string;
    status: string;
}

const statusStyles: Record<string, { badge: string; dot: string; label: string }> = {
    ABERTO:         { badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20", dot: "bg-emerald-500", label: "Aberto" },
    EM_ATENDIMENTO: { badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20", dot: "bg-blue-500", label: "Em atendimento" },
    TRIAGEM:        { badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20", dot: "bg-amber-500", label: "Triagem" },
    FECHADO:        { badge: "bg-muted text-muted-foreground border-border/70", dot: "bg-muted-foreground/60", label: "Fechado" },
    AGUARDANDO:     { badge: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20", dot: "bg-purple-500", label: "Aguardando" },
};
const statusDefault = { badge: "bg-muted text-muted-foreground border-border/70", dot: "bg-muted-foreground/60", label: "Desconhecido" };

export default function Procurar() {
    const router = useRouter();
    const [data, setData] = useState<Card[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [openChatWindow, setOpenChatWindow] = useState(false);
    const [chatId, setChatId] = useState<string | null>(null);

    useEffect(() => {
        const getValues = async () => {
            try {
                const response = await fetch("/api/atendimento", {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });
                if (!response.ok) {
                    const error = await response.json().catch(() => null);
                    throw new Error(error?.message || `Erro na requisição: ${response.status}`);
                }
                const json = await response.json();
                setData(Array.isArray(json.data) ? json.data : []);
            } catch (err) {
                console.error("Erro no fetch:", err);
                setData([]);
            } finally {
                setLoading(false);
            }
        };
        getValues();
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpenChatWindow(false);
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const filteredData = data.filter((i) => {
        const termo = search.toLowerCase();
        return (
            i.clienteNumero.toLowerCase().includes(termo) ||
            String(i.id).toLowerCase().includes(termo) ||
            i.clienteNome.toLowerCase().includes(termo)
        );
    });

    return (
        <section className="max-w-4xl mx-auto px-4 py-8 space-y-6 font-sans">
            {/* Header da Página */}
            <div>
                <h1 className="text-xl font-bold text-foreground">Buscar atendimentos</h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                    Pesquise por nome, telefone ou código de protocolo
                </p>
            </div>

            {/* Input de Busca */}
            <div className="space-y-2">
                <div className="relative">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        type="text"
                        placeholder="Nome, celular ou protocolo..."
                        className="w-full pl-11 pr-20 py-3 bg-card border border-border/70 rounded-xl shadow-xs text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground hover:text-foreground px-2.5 py-1 rounded-lg hover:bg-muted/80 transition-colors cursor-pointer"
                        >
                            Limpar
                        </button>
                    )}
                </div>

                {!loading && search && (
                    <p className="text-xs text-muted-foreground px-1">
                        {filteredData.length} resultado{filteredData.length !== 1 ? "s" : ""} para{" "}
                        <span className="font-semibold text-foreground">"{search}"</span>
                    </p>
                )}
            </div>

            {/* Modal de Detalhes do Chat */}
            {openChatWindow && (
                <div
                    onClick={() => setOpenChatWindow(false)}
                    className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="relative w-full max-w-4xl shadow-2xl"
                    >
                        <button
                            onClick={() => setOpenChatWindow(false)}
                            className="absolute -top-3 -right-3 z-10 p-2 bg-card text-muted-foreground hover:text-foreground hover:bg-muted rounded-full shadow-md border border-border transition-colors cursor-pointer focus:outline-none"
                            title="Fechar (Esc)"
                        >
                            <X size={18} />
                        </button>

                        <ChatWindow id={String(chatId)} />
                    </div>
                </div>
            )}

            {/* Estados da Interface */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <Loader2 size={28} className="text-primary animate-spin" />
                    <p className="text-xs text-muted-foreground font-medium">Carregando atendimentos...</p>
                </div>
            ) : filteredData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 bg-card rounded-2xl border border-dashed border-border/70 text-center">
                    <div className="w-12 h-12 bg-muted/60 border border-border/50 rounded-xl flex items-center justify-center shadow-xs">
                        <SearchX size={22} className="text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-bold text-foreground">Nenhum atendimento encontrado</p>
                        <p className="text-xs text-muted-foreground">Tente buscar por outro termo ou limpe os filtros</p>
                    </div>
                </div>
            ) : (
                /* Grid de Cards */
                <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2">
                    {filteredData.map((i) => {
                        const style = statusStyles[i.status] ?? statusDefault;
                        const inicial = i.clienteNome?.charAt(0).toUpperCase() ?? "?";
                        const protocolDisplay = String(i.id).length > 6 ? `${String(i.id).slice(0, 6)}...` : String(i.id);

                        return (
                            <div
                                key={i.id}
                                onClick={() => {
                                    setOpenChatWindow(true);
                                    setChatId(String(i.id));
                                }}
                                className="group bg-card p-4 rounded-xl border border-border/70 shadow-xs hover:shadow-md hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-150 cursor-pointer flex flex-col justify-between gap-3"
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                                            <span className="text-sm font-bold text-primary">{inicial}</span>
                                        </div>
                                        <div className="min-w-0 space-y-0.5">
                                            <p className="text-sm font-bold text-foreground truncate">
                                                {i.clienteNome || "Sem nome"}
                                            </p>
                                            <div className="flex items-center gap-1 text-[11px] font-mono text-muted-foreground">
                                                <Phone size={11} className="shrink-0" />
                                                <span className="truncate">{i.clienteNumero}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="shrink-0">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${style.badge}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                                            {style.label}
                                        </span>
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                                    <div className="flex items-center gap-1 text-[11px] font-mono text-muted-foreground">
                                        <Hash size={11} className="shrink-0" />
                                        <span>{protocolDisplay}</span>
                                    </div>
                                    <span className="text-[11px] font-bold text-primary group-hover:underline transition-all">
                                        Ver chat →
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}