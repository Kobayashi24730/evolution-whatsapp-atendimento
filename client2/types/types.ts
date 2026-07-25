import { Prisma } from "@prisma/client";

export type AtendimentoComTipo = Prisma.AtendimentoGetPayload<{
    include: {
        mensagens: true;
        etiquetas: true;
    }
}>;