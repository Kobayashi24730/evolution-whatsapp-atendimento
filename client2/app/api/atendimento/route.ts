import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/libs/prisma";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const clienteNumero = searchParams.get("clienteNumero");
        const clienteNome = searchParams.get("clienteNome");
        const userId = searchParams.get("userId");

        const atendimento = await prisma.atendimento.findMany({
            where: {
                status: {in: ["ABERTO", "ESPERA", "EM_ATENDIMENTO"]},
                ...(clienteNumero && {clienteNumero}),
                ...(clienteNome && {clienteNome}),
                ...(userId && {
                    OR: [
                        { userId: userId },
                        { userId: null }
                    ]
                })
            }, include: {
                mensagens: {
                    orderBy: {
                        timestamp: 'asc',
                    },
                },
            },
        });
        return NextResponse.json({ message: "Success to get atendimentos", data: atendimento }, { status: 200 });
    } catch (error) {
        console.error("Failed to post, error line: ", error);
        return NextResponse.json({
            error: "Internal Server Error",
            details: error instanceof Error ? error.message : error
        }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { clienteNumero, clienteNome, userId } = await request.json();
        if (!clienteNumero || !clienteNome || !userId ) return NextResponse.json({ message: "Missing clienteNumero, clienteNome or userId" }, { status: 400 })
        const atendimento = await prisma.atendimento.create({
            data: {
                clienteNumero,
                clienteNome,
                userId,
            }
        });
        return NextResponse.json({ message: "Success to create atendimento", data: atendimento }, { status: 201 });
    } catch (error) {
        console.error("Failed to post, error line: ", error);
        return NextResponse.json({
            error: "Internal Server Error",
            details: error instanceof Error ? error.message : error
        }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const { mensagens, atendimentoId, by} = await request.json();
        if (!mensagens) return NextResponse.json({ message: "Missing message" }, { status: 400 });
        const data = await prisma.atendimento.update({
            where: {
                id: atendimentoId
            }, data: {
                status: "EM_ATENDIMENTO",
                mensagens: {
                    create: {
                        texto: mensagens,
                        fromMe: Boolean(by)
                    }
                }
            },
            include: {
                mensagens: true
            },
        });

        if (Boolean(by) === true) {
            const evolutionURL = process.env.EVOLUTION_API_URL || "http://evolution_api:8080";
            const instanceName = process.env.INSTANCE_NAME || "gui";
            const apikey = process.env.INSTANCE_API_KEY || "7996256f-dfb9-4028-9fa3-1ed9a2f8b640";
            try {
                const destinoJid = data.clienteNumero.includes("@") ? data.clienteNumero : `${data.clienteNumero}@s.whatsapp.net`;
                const payload = {
                    number: destinoJid,
                    text: mensagens,
                    options: {
                        delay: 1200,
                        presence: "composing",
                        checkContact: false
                    }
                };

                console.log("[Envio Painel] Disparando com checkContact desabilitado:", JSON.stringify(payload));
                const response = await fetch(`${evolutionURL}/message/sendText/${instanceName}`, {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                        "apikey": apikey
                    },
                    body: JSON.stringify(payload)
                });

                const responseData = await response.json().catch(() => ({}));
                if (!response.ok) {
                    console.error("A Evolution API v2 retornou Bad Request (400):");
                    console.dir(responseData, { depth: null });
                } else {
                    console.log("Mensagem enviada ao WhatsApp do cliente com sucesso!");
                }
            } catch (fetchError) {
                console.error("Falha crítica de rede com a Evolution API:", fetchError);
            }
        }
        return NextResponse.json({ message: "Success to update message", data: data }, { status: 200 });
    } catch (error) {
        console.error("Failed to message post, error line: ", error);
        return NextResponse.json({
            error: "Internal Serve Error",
            details: error instanceof Error ? error.message : error
        }, { status: 500 });
    }
}
