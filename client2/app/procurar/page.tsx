'use client';
import {useEffect, useState} from "react";
import {toLowerCase} from "zod";
import { Search } from "lucide-react";

interface card {
    id: string | number;
    clienteNumero: string;
    clienteNome: string;
    status: string;
}

export default function Procurar() {
    const [data, setData] = useState<card[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    useEffect(() => {
        async function getValues(){
            try {
                const response = await fetch("/api/atendimento");
                if (!response.ok) throw new Error("Erro na requisição");
                const data = await response.json();
                console.log(data);
                if (data && Array.isArray(data.data)) {
                    setData(data.data);
                } else {
                    setData([]);
                }
            } catch (err) {
                console.error("Erro no fetch, line: ", err);
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
            i.clienteNumero.includes(termo) || String(i.id).includes(termo) || i.clienteNome.includes(termo)
        )
    });

    if (loading) return <div>Loading...</div>;
    return (
        <section className="max-w-4xl mx-auto p-4 space-y-6">
            <div className="relative flex items-center">
                <input
                    className="w-full pl-4 pr-10 py-3 bg-white border border-gray-300 rounded-xl shadow-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    type="text"
                    placeholder="Procure atendimentos pelo celular ou protocolo..."
                />
                <span className="absolute right-3 text-gray-400 pointer-events-none"><Search size={30} /></span>
            </div>

            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                {filteredData.length === 0 ? (
                    <div className="col-span-full text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        <p className="text-gray-500 font-medium">Nenhum atendimento encontrado</p>
                        <p className="text-gray-400 text-sm mt-1">Tente buscar por outro termo.</p>
                    </div>
                ) : (
                    filteredData.map((i: any) => (
                        <div
                            key={i.id}
                            className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between gap-3">
                            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${ i.status === "EM_ATENDIMENTO" ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-yellow-50 text-yellow-700 border-yellow-100"} border`}>{i.status}</span>
                            <div className="flex items-start justify-between space-x-2">
                                <div>
                                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Protocolo / Tel</span>
                                    <p className="text-sm font-bold text-gray-700">{i.clienteNumero} {i.clienteNumero}</p>
                                </div>
                            </div>
                            <hr className="border-gray-100" />
                            <div>
                                <span className="text-xs text-gray-400">Cliente</span>
                                <p className="text-base font-semibold text-gray-900">{i.clienteNome}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </section>
    )
}