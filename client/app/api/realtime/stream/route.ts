import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        start(controller) {
            //? Função para enviar eventos ao cliente
            const sendEvent = (event: string, data: any) => {
                controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
            };

            //? Exemplo: Envia um keep-alive a cada 15s para manter a conexão aberta
            const timer = setInterval(() => {
                sendEvent("ping", { time: new Date().toISOString() });
            }, 15000);

            //? Quando o cliente desconecta
            req.signal.addEventListener("abort", () => {
                clearInterval(timer);
                controller.close();
            });
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
        },
    });
}