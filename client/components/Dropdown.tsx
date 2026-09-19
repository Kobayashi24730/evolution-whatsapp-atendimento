'use client';

import { useState } from 'react';

interface DropdownProps {
    status: string;
    onSelect: (status: string) => void;
}

const statusStyles: Record<string, string> = {
    //? Status Ativos e Inicial
    TRIAGEM:            "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
    ABERTO:             "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
    EM_ATENDIMENTO:     "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800",

    //? Status de Espera / Pendência
    AGUARDANDO_HUMANO:  "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800",
    AGUARDANDO_CLIENTE: "bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100 dark:bg-cyan-950/40 dark:text-cyan-400 dark:border-cyan-800",

    //? Status de Conclusão e Cancelamento
    RESOLVIDO:          "bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100 dark:bg-teal-950/40 dark:text-teal-400 dark:border-teal-800",
    FINALIZADO:         "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
    FECHADO:            "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
    CANCELADO:          "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800",
};

const stylesDefault = "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200";

export default function StatusDropdown({ status, onSelect }: DropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const opcoes = ["ABERTO", "ESPERA", "TRIAGEM", "EM_ATENDIMENTO", "AGUARDANDO_HUMANO", "AGUARDANDO_CLIENTE", "RESOLVIDO", "FINALIZADO", "CANCELADO"];

    return (
        <div className="relative inline-block text-left">
            <button
                type="button"
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border ${statusStyles[status] ?? stylesDefault} shadow-xs flex items-center gap-2 cursor-pointer transition-all`}
                onClick={() => setIsOpen((prev) => !prev)}
            >
                <span>{status}</span>
                <span className={`inline-block text-[10px] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
                    ▼
                </span>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-20 animate-in fade-in zoom-in-95 duration-100 overflow-hidden">
                    {opcoes.map((opcao) => (
                        <button
                            key={opcao}
                            type="button"
                            className={`
                                w-full text-left px-4 py-2 text-xs font-medium transition-colors cursor-pointer block
                                ${statusStyles[opcao] ?? stylesDefault}
                            `}
                            onClick={() => {
                                onSelect(opcao);
                                setIsOpen(false);
                            }}
                        >
                            {opcao}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}