"use client";
import ChatCard from "@/components/ChatCard";
import "next-auth";
import "next-auth/jwt";
import {ChatWindow} from "@/components/atendimento/ChatWindow";
import {ChatList} from "@/components/atendimento/ChatList";
import {useEffect} from "react";
import { useSearchParams } from "next/navigation";
import { useRealtimeApp } from '@/hooks/useRealtimeApp';

export default function Atendimentos() {
    const searchParams = useSearchParams();
    const { 
        atendimentos,
        mensagens,
        inputMsg,
        setInputMsg,
        error,
        atendimentoAtivo,
        setIdAtendimentoAtivo,
        enviarMensagem,
        finalizarAtendimento,
        mudarStatusAtendimento,
        setIsOpen,
        isOpen 
    } = useRealtimeApp();

    //? Sincroniza o id do atendimento ativo com o id da url vindo do botão "ir para o chat" 
    useEffect(() => {
        const idFromUrl = searchParams.get("id");
        if (idFromUrl && idFromUrl !== atendimentoAtivo?.id) {
            setIdAtendimentoAtivo(idFromUrl);
        }
    }, [searchParams]);

    return (
        <main className="container mx-auto p-4 h-[calc(100vh-2rem)] flex flex-col gap-6">
            {isOpen && <ChatCard onClose={() => setIsOpen(false)} data={null} />}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-hidden">
                <ChatList 
                    atendimentos={atendimentos} 
                    atendimentoAtivoId={atendimentoAtivo?.id} 
                    onSelectChat={setIdAtendimentoAtivo} 
                />
                <ChatWindow
                    atendimentoAtivo={atendimentoAtivo}
                    mensagens={mensagens}
                    msg={inputMsg}
                    error={error}
                    setMsg={setInputMsg}
                    onSubmit={enviarMensagem}
                    onFinalizar={finalizarAtendimento}
                    onMudarStatus={mudarStatusAtendimento}
                />
            </div>
        </main>
    );
}