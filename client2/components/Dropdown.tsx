'use client'

import { useState } from 'react'

interface Dropdown {
    status: string;
    onSelect: (status: string) => void;
}

export default function dropdown({status, onSelect}: Dropdown) {
    const [isOpen, setIsOpen] = useState(false);
    const opcoes = ["ABERTO", "ESPERA", "EM_ATENDIMENTO"];
    return (
        <div className="relative inline-block text-left">
            <button
                type="button"
                className="px-3 py-1.5 text-xs font-medium rounded-lg border bg-white shadow-sm hover:bg-gray-50 flex items-center gap-2"
                onClick={(e) => setIsOpen(!isOpen)}
            >
                <span>{status}</span>
                <span className="text-[10px]">▼</span>
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10 animate-in fade-in zoom-in-95 duration-100">
                    {opcoes.map((i) => (
                        <button
                            key={i}
                            className={`
                                w-full text-left px-4 py-2 text-xs transition-colors
                                ${status === i ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-50'}
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