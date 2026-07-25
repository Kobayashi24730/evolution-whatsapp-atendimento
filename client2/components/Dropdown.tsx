'use client'

import { useState } from 'react'

interface Dropdown {
    status: string;
    onSelect: (status: string) => void;
}

const statusStyles: Record<string, string> = {
    ABERTO:         "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
    EM_ATENDIMENTO: "bg-blue-50   text-blue-700   border-blue-200 hover:bg-blue-100",
    TRIAGEM:        "bg-amber-50  text-amber-700  border-amber-200 hover:bg-amber-100",
    FECHADO:        "bg-gray-100  text-gray-500   border-gray-200 hover:bg-gray-100",
    AGUARDANDO:     "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100",
};
const stylesDefault = { badge: "bg-gray-100 text-gray-600 border-gray-200", dot: "bg-gray-300" };

export default function dropdown({status, onSelect}: Dropdown) {
    const [isOpen, setIsOpen] = useState(false);
    const opcoes = ["ABERTO", "ESPERA", "EM_ATENDIMENTO", "TRIAGEM", "AGUARDANDO"];
    return (
        <div className="relative inline-block text-left">
            <button
                type="button"
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border ${statusStyles[status] ?? stylesDefault.badge} shadow-sm flex items-center gap-2`}
                onClick={(e) => setIsOpen(!isOpen)}
            >
                <span>{status}</span>
                <span className={`text - [10px] transition-transform duration-200 ease-in-out ${isOpen ? "rotate-180" : "rotate-0"}`}>▼</span>
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10 animate-in fade-in zoom-in-95 duration-100">
                    {opcoes.map((i) => (
                        <button
                            key={i}
                            className={`
                                w-full text-left px-4 py-2 text-xs transition-colors
                                ${statusStyles[i] ?? stylesDefault}
                            `}
                            onClick={(e) => {
                                onSelect(i);
                                setIsOpen(!isOpen)
                            }}
                        >
                            {i}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}