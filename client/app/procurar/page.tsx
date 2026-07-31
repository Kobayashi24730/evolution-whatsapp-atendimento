'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, User, Hash, Phone, Loader2, SearchX } from "lucide-react";

interface Card {
    id: string | number;
    clienteNumero: string;
    clienteNome: string;
    status: string;
}

const statusStyles: Record<string, { badge: string; dot: string; label: string }> = {
    ABERTO:         { badge: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-400", label: "Aberto"          },
    EM_ATENDIMENTO: { badge: "bg-blue-50   text-blue-700   border-blue-200",     dot: "bg-blue-400",    label: "Em atendimento"  },
    TRIAGEM:        { badge: "bg-amber-50  text-amber-700  border-amber-200",    dot: "bg-amber-400",   label: "Triagem"         },
    FECHADO:        { badge: "bg-gray-100  text-gray-500   border-gray-200",     dot: "bg-gray-300",    label: "Fechado"         },
    AGUARDANDO:     { badge: "bg-purple-50 text-purple-700 border-purple-200",   dot: "bg-purple-400",  label: "Aguardando"      },
};
const statusDefault = { badge: "bg-gray-100 text-gray-600 border-gray-200", dot: "bg-gray-300", label: "Desconhecido" };

export default function Procurar() {
    const router = useRouter();
    const [data, setData] = useState<Card[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        async function getValues() {
            try {
                const response = await fetch("/api/atendimento");
                if (!response.ok) throw new Error("Erro na requisição");
                const json = await response.json();
                setData(Array.isArray(json.data) ? json.data : []);
            } catch (err) {
                console.error("Erro no fetch:", err);
                setData([]);
            } finally {
                setLoading(false);
            }
        }
        getValues();
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
        <section className="max-w-4xl mx-auto px-4 py-8 space-y-6">
            <div>
                <h1 className="text-xl font-bold text-gray-800">Buscar atendimentos</h1>
                <p className="text-sm text-gray-400 mt-0.5">Pesquise por nome, telefone ou protocolo</p>
            </div>

            <div className="relative">
                <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    type="text"
                    placeholder="Nome, celular ou protocolo..."
                    className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                {search && (
                    <button
                        onClick={() => setSearch("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
                    >Limpar</button>
                )}
            </div>

            {!loading && search && (
                <p className="text-xs text-gray-400 -mt-2">
                    {filteredData.length} resultado{filteredData.length !== 1 ? "s" : ""} para <span className="font-semibold text-gray-600">"{search}"</span>
                </p>
            )}

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <Loader2 size={28} className="text-blue-500 animate-spin" />
                    <p className="text-sm text-gray-400">Carregando atendimentos...</p>
                </div>
            ) : filteredData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <div className="w-12 h-12 bg-white border border-gray-200 rounded-xl flex items-center justify-center shadow-sm">
                        <SearchX size={22} className="text-gray-400" />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-medium text-gray-600">Nenhum atendimento encontrado</p>
                        <p className="text-xs text-gray-400 mt-1">Tente buscar por outro termo</p>
                    </div>
                </div>
            ) : (
                <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2">
                    {filteredData.map((i: any) => {
                        const style = statusStyles[i.status] ?? statusDefault;
                        const inicial = i.clienteNome?.charAt(0).toUpperCase() ?? "?";
                        return (
                            <div
                                key={i.id}
                                onClick={() => router.push(`/atendimento/${i.id}`)}
                                className="group bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 hover:-translate-y-0.5 transition-all duration-150 cursor-pointer flex flex-col gap-3"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 border border-blue-100 flex items-center justify-center shrink-0">
                                            <span className="text-sm font-bold text-blue-600">{inicial}</span>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-gray-800 truncate">{i.clienteNome || "Sem nome"}</p>
                                            <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-0.5">
                                                <Phone size={10} />
                                                <span>{i.clienteNumero}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${style.badge}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                                            {style.label}
                                        </span>
                                    </div>
                                </div>
                                <hr className="border-gray-100" />
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                                        <Hash size={11} />
                                        <span className="font-mono font-medium text-gray-500">{i.id}</span>
                                    </div>
                                    <span className="text-[11px] font-medium text-blue-500 group-hover:text-blue-600 transition-colors">
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