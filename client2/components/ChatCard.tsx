interface ChatCardProps {
    onClose: () => void;
    data: any;
}

export default function ChatCard({ onClose, data }: ChatCardProps) {
    return (
        <div className="fixed top-0 left-0 w-full h-full bg-black/50 flex items-center justify-center">
            <div className="">
                <h2 className="text-2xl font-bold text-gray-800">Atendimento</h2>
                <button className="text-gray-500 cursor-pointer transition " onClick={onClose}>X</button>
                <div className="flex items-center justify-between">
                    <input type="text" placeholder="Digite o nome do cliente" className="border border-gray-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100" />
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-blue-700 transition">Iniciar</button>
                </div>
            </div>
        </div>
    )
}