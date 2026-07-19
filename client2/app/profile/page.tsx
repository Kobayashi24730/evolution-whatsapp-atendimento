"use client";

import { useSession } from "next-auth/react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Profile() {
    const { data: session } = useSession();
    const router = useRouter()

    return (
        <section className="max-w-2xl mx-auto p-6 bg-white border border-gray-100 rounded-2xl shadow-sm mt-8">
            <button onClick={() => router.push("/atendimento")} className="p-2 text-gray-500 hover:text-blue-600 rounded-lg transition-colors" >
                <ArrowLeft size={20} />
            </button>
            <div className="border-b border-gray-100 pb-6 mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Meu Perfil</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Gerencie suas informações de conta e verifique suas permissões de acesso ao sistema de atendimento.
                </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center shadow-md overflow-hidden shrink-0">
                    {session?.user?.image ? (
                        <img
                            className="w-full h-full object-cover"
                            src={session?.user?.image}
                            alt="Foto de perfil"
                        />
                    ) : (
                        <span className="text-white text-2xl font-bold uppercase">
                            {session?.user?.image ? session.user.image.charAt(0) : (session?.user?.email ? session.user.email .charAt(0).toUpperCase() : "U")}
                        </span>
                    )}
                </div>
                <div className="flex-1 w-full space-y-4">
                    <div>
                        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Nome Completo</h2>
                        <p className="text-lg font-bold text-gray-800 mt-0.5">
                            {session?.user?.name || "Usuário não identificado"}
                        </p>
                    </div>
                    <div>
                        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">E-mail Corporativo</h2>
                        <p className="text-gray-600 font-medium mt-0.5">
                            {session?.user?.email || "E-mail não disponível"}
                        </p>
                    </div>
                    <div className="pt-2 border-t border-gray-50 flex flex-wrap gap-4 items-center justify-between">
                        <div>
                            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Cargo / Função</h2>
                            <span className="inline-flex items-center gap-1.5 mt-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                                Atendente de Suporte
                            </span>
                        </div>
                        <div>
                            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Status da Conta</h2>
                            <span className="inline-flex items-center gap-1.5 mt-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-100">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                Conectado
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-xs text-gray-500 leading-relaxed">
                    <strong>Nota de Segurança:</strong> Esta conta está vinculada à sessão segura do painel. Se você notar qualquer atividade suspeita ou precisar alterar suas credenciais, entre em contato com o administrador do sistema.
                </p>
            </div>
        </section>
    );
}