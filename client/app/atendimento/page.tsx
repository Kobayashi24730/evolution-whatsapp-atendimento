"use client";
import ChatCard from "@/components/ChatCard";
import "next-auth";
import "next-auth/jwt";
import {ChatWindow} from "@/components/atendimento/ChatWindow";
import {useAtendimentos} from "@/hooks/useAtendimentos";
import {ChatList} from "@/components/atendimento/ChatList";
import {useEffect} from "react";
import { useSearchParams } from "next/navigation";

export default function Atendimentos() {
    const searchParams = useSearchParams();
    const { data,
        mensagem,
        msg,
        setMsg,
        error,
        atendimentoAtivo,
        setIdAtendimentoAtivo,
        submitInfos,
        finalizarAtendimento,
        mudarStatus,
        setIsOpen,
        isOpen } = useAtendimentos();

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
                <ChatList atendimentos={data} atendimentoAtivoId={atendimentoAtivo?.id} onSelectChat={setIdAtendimentoAtivo} />
                <ChatWindow
                    atendimentoAtivo={atendimentoAtivo}
                    mensagens={mensagem}
                    msg={msg}
                    error={error}
                    setMsg={setMsg}
                    onSubmit={submitInfos}
                    onFinalizar={finalizarAtendimento}
                    onMudarStatus={mudarStatus}
                />
            </div>
        </main>
    );
}