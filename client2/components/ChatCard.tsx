import { useState } from "react";
import {useSession} from "next-auth/react";
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
        }
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id?: string;
    }
}

interface ChatCardProps {
    onClose: () => void;
    data: any;
}

export default function ChatCard({ onClose, data }: ChatCardProps) {
    const { data: session } = useSession();
    const [loading, setLoading] = useState<boolean>(false);
    const [clienteNome, setClienteNome] = useState<string>("");
    async function iniciarAtendimento() {
        if (!clienteNome.trim()) {
            alert("Por favor, insira o nome do cliente.");
            return;
        }
        setLoading(true);
        try {
            const userId = session?.user?.id;
            const response = await fetch("api/atendimento", {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clienteNumero: "99999999999" ,clienteNome, userId })
            });
            if (!response.ok) {
                return;
            }
            const atendimento = await response.json();
            console.log(atendimento);
            onClose();
        } catch (error) {
            console.log("Failed to post, error line: ", error );
            return;
        } finally {
            setLoading(false);
        }
    }
    return (
        <div className="fixed top-0 left-0 w-full h-full bg-black/50 flex items-center justify-center">
            <div className="bg-white rounded-xl p-6 w-[450px] space-y-5">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Atendimento</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-red-500"
                    >
                        ✕
                    </button>
                </div>

                <input
                    type="text"
                    value={clienteNome}
                    onChange={(e) => setClienteNome(e.target.value)}
                    placeholder="Digite o nome do cliente"
                    className="w-full border rounded-lg px-4 py-2"
                />

                <button
                    onClick={iniciarAtendimento}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white rounded-lg py-2"
                >
                    {loading ? "Criando..." : "Iniciar Atendimento"}
                </button>
            </div>
        </div>
    )
}