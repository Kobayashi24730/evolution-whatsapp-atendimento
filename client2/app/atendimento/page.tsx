"use client";
import ChatCard from "@/components/ChatCard";
import "next-auth";
import "next-auth/jwt";
import {ChatWindow} from "@/components/atendimento/ChatWindow";
import {useAtendimentos} from "@/hooks/useAtendimentos";
import {ChartList} from "@/components/atendimento/ChatList";

export default function Atendimentos() {
    const { data,
        messagem,
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

    return (
        <main className="container mx-auto p-4 h-[calc(100vh-2rem)] flex flex-col gap-6">
            {isOpen && <ChatCard onClose={() => setIsOpen(false)} data={null} />}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-hidden">
                <ChartList atendimentos={data} atendimentoAtivoId={atendimentoAtivo?.id} onSelectChat={setIdAtendimentoAtivo} />
                <ChatWindow
                    atendimentoAtivo={atendimentoAtivo}
                    mensagens={messagem}
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