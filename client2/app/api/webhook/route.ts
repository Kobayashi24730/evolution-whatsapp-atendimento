import { NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";

export async function POST(request: Request) {
    try {
        const data = await request.json();
        console.log('📨 Webhook recebido:', JSON.stringify(data, null, 2));
        
        if (data.event === 'messages.upsert') {
            const message = data.data;
            const numero = message.key.remoteJid;
            const texto = message.message?.conversation;

            console.log('📱 Mensagem recebida de:', numero, '| Texto:', texto);

            if (message.key.fromMe === true) {
                console.log('⏭️ Mensagem ignorada (enviada por mim)');
                return NextResponse.json({ status: "ignorado (enviado por mim)" })
            }

            let atendimento = await prisma.atendimento.findFirst({
                where: { clienteNumero: numero, status: {in: ["ABERTO", "TRIAGEM", "EM_ATENDIMENTO"]}}
            });

            console.log('🔍 Atendimento existente:', atendimento ? atendimento.id : 'Nenhum');

            if (!atendimento) {
                console.log('🆕 Criando novo atendimento para:', numero);
                atendimento = await prisma.atendimento.upsert({
                    where: { clienteNumero: numero },
                    update: {},
                    create: {
                        clienteNumero: numero,
                        clienteNome: data.instanceName || 'Cliente',
                    },
                });
                console.log('✅ Atendimento criado:', atendimento.id);
            }

            console.log('💾 Salvando mensagem...');
            await prisma.mensagem.create({
                data: {
                    atendimentoId: atendimento.id,
                    texto: texto || "",
                    fromMe: message.key.fromMe,
                }
            });
            console.log('✅ Mensagem salva');

            const evolutionIP = process.env.EVOLUTION_API_URL || "http://evolution_api:8080";
            const instance_name = process.env.EVOLUTION_INSTANCE_NAME || "gui";
            const API_KEY_SECERT = process.env.EVOLUTION_API_KEY || "7996256f-dfb9-4028-9fa3-1ed9a2f8b640";
            const nomeCliente = data.instanceName || 'Cliente';
            const textoRespostaAutomatica = `Olá, ${nomeCliente}! Seu atendimento foi iniciado sob o protocolo nº ${atendimento.id.slice(0, 5)}. Um atendente humano falará com você em breve.`;

            console.log('🚀 Enviando resposta automática via Evolution API...');
            console.log('URL:', `${evolutionIP}/message/sendText/${instance_name}`);
            console.log('Número:', atendimento.clienteNumero.split('@')[0]);
            
            const responseEvolution = await fetch(`${evolutionIP}/message/sendText/${instance_name}`, {
                method: "POST",
                headers: {'Content-Type': 'application/json', "apikey": API_KEY_SECERT},
                body: JSON.stringify({
                    number: atendimento.clienteNumero.split('@')[0],
                    text: textoRespostaAutomatica,
                    delay: 1200
                })
            });

            if (!responseEvolution.ok) {
                const errorStatus = responseEvolution.status;
                const errorText = await responseEvolution.text();
                console.error(`❌ Erro ao enviar para Evolution. Status: ${errorStatus} | Resposta:`, errorText);
            } else {
                const successData = await responseEvolution.json();
                console.log("✅ Resposta enviada para a Evolution com sucesso!", successData);
            }
        } else {
            console.log('⏭️ Evento ignorado:', data.event);
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('❌ Erro no webhook:', error);
        return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
    }
}