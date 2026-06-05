'use client';

import { useState } from 'react';
import { getChats } from '@/services/evolution';

export default function Dashboard() {
    const [faturamento, setFaturamento] = useState(12450);
    const chats = getChats()
    console.log("Meu chatsgi",chats);

    return (
        <main className="container mx-auto py-6 px-4">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">
                    Dashboard <span className="text-blue-500 font-semibold">Básica Interativa</span>
                </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col justify-between bg-gray-50 border border-gray-100 p-4 rounded-xl shadow-sm">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-1"><span className="text-blue-500">40%</span> de textos importantes</h3>
                        <p className="text-sm text-gray-800">Descrição breve da info um. Infos importantes são importantes.</p>
                    </div>
                </div>

                <div className="flex flex-col justify-between bg-gray-50 border border-gray-100 p-4 rounded-xl shadow-sm">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Vendas Mensais</h3>
                        <p className="text-2xl font-bold text-gray-800 mt-2">R$ {faturamento.toLocaleString('pt-BR')}</p>
                    </div>
                    <button
                        onClick={() => setFaturamento(prev => prev + 150)}
                        className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition"
                    >
                        Simular Nova Venda (+R$150)
                    </button>
                </div>

                <div className="flex flex-col bg-gray-50 border border-gray-100 p-4 rounded-xl shadow-sm">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Novos Clientes</h3>
                    <p className="text-2xl font-bold text-gray-800 mt-2">+48</p>
                    <span className="text-xs text-green-500 font-medium mt-1">↑ 12% em relação à semana passada</span>
                </div>

            </div>
        </main>
    );
}