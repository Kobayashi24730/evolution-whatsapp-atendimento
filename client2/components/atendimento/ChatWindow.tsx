
import Dropdown from "@/components/Dropdown";

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

export function ChatWindow({ atendimentoAtivo, mensagens, msg, error, setMsg, onSubmit, onFinalizar, onMudarStatus }: ChatWindowProps) {
    return (
        <section className="lg:col-span-8 flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            {atendimentoAtivo ? (
                <>
                    <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                        <div>
                            <h2 className="font-bold text-gray-800 text-lg">
                                {atendimentoAtivo.clienteNome || "Cliente sem nome"}
                            </h2>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                Status: {atendimentoAtivo.status} | WhatsApp: {atendimentoAtivo.clienteNumero}
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <Dropdown status={atendimentoAtivo.status} onSelect={(status) => onMudarStatus(atendimentoAtivo.id, status)} />
                            <button onClick={() => onFinalizar(atendimentoAtivo.id)} className="text-xs font-bold text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition">
                                Finalizar
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 p-6 overflow-y-auto bg-slate-50">
                        <div className="flex flex-col gap-4">
                            {mensagens.length > 0 ? (
                                mensagens.map((msg: any) => (
                                    <div
                                        key={msg.id}
                                        className={`max-w-[80%] p-3 rounded-2xl shadow-sm ${
                                            msg.fromMe
                                                ? "bg-blue-600 text-white self-end rounded-tr-none"
                                                : "bg-white text-gray-700 self-start border border-gray-100 rounded-tl-none"
                                        }`}
                                    >
                                        {!msg.fromMe ? <p>{atendimentoAtivo.clienteNome}</p> : <p>Voce</p>}
                                        <p className="text-sm">{msg.texto}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center p-4 text-gray-400 text-sm italic">
                                    Nenhuma mensagem por enquanto...
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-4 border-t bg-white">
                        {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
                        <div className="flex gap-2 p-2 bg-gray-100 rounded-xl focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                            <input
                                type="text"
                                placeholder="Digite sua mensagem..."
                                value={msg}
                                className="flex-1 bg-transparent outline-none px-2 text-sm text-gray-700"
                                onChange={(e) => setMsg(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && onSubmit()}
                            />
                            <button onClick={onSubmit} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-blue-700 transition">
                                Enviar
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex-1 flex items-center justify-center p-4">
                    <p className="text-gray-500">Selecione ou abra um atendimento para iniciar</p>
                </div>
            )}
        </section>
    )
}