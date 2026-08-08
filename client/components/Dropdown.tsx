'use client';

import { useState } from 'react';

interface DropdownProps {
    status: string;
    onSelect: (status: string) => void;
}

const statusStyles: Record<string, string> = {
    ABERTO:         "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
    EM_ATENDIMENTO: "bg-blue-50   text-blue-700   border-blue-200 hover:bg-blue-100",
    TRIAGEM:        "bg-amber-50  text-amber-700  border-amber-200 hover:bg-amber-100",
    FECHADO:        "bg-gray-100  text-gray-500   border-gray-200 hover:bg-gray-200",
    AGUARDANDO:     "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100",
};

const stylesDefault = "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200";

export default function StatusDropdown({ status, onSelect }: DropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const opcoes = ["ABERTO", "EM_ATENDIMENTO", "TRIAGEM", "AGUARDANDO", "FECHADO"];

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