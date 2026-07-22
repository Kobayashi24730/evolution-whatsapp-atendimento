interface ChatListProps {
    atendimentos: any[];
    atendimentoAtivoId?: string;
    onSelectChat: (id: string) => void;
}

export function ChartList({ atendimentos, atendimentoAtivoId, onSelectChat }: ChatListProps) {
    return (
        <aside className="lg:col-span-4 flex flex-col gap-4 overflow-hidden">
            <h2 className="text-lg font-bold text-gray-700 px-1">Todos os chats</h2>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {atendimentos.map((atendimento) => (
                    <div
                        key={atendimento.id}
                        onClick={() => onSelectChat(atendimento.id)}
                        className={`group flex flex-col gap-2 p-4 bg-white border rounded-xl hover:border-blue-300 hover:shadow-md transition-all cursor-pointer ${
                            atendimentoAtivoId === atendimento.id ? "border-blue-500 bg-blue-50/20" : "border-gray-100"
                        }`}
                    >
                        <div>
                            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                                <span className="text-primary-foreground text-xs font-semibold">{atendimento.clienteNome .charAt()}</span>
                            </div>
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold text-gray-800">{atendimento.clienteNome || "Sem nome"}</h3>
                                <span className="text-[10px] text-gray-400 font-medium">
                                        {atendimento.createdAt ? new Date(atendimento.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ""}
                                    </span>
                            </div>
                            <p className="text-sm text-gray-500 line-clamp-1 italic">WhatsApp: {atendimento.clienteNumero}</p>
                            <button className="mt-2 text-xs font-bold text-blue-600 group-hover:text-blue-700 uppercase tracking-wider text-left">
                                Ver chat
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </aside>
    );
}