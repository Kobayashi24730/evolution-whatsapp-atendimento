import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/libs/prisma";

export async function POST(request: Request) {
    const { email, password } = await request.json();
    const user = await prisma.user.findUnique({
        where: { email }
    });
    if (!user) {
        return NextResponse.json({ error: "Credenciais inválidas"}, { status: 401 });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if(!isPasswordValid) {
        return NextResponse.json({ error: "Credenciais inválidas"}, { status: 401});
    }
    return NextResponse.json({
        message: "Login realizado com sucesso",
        user: { id: user.id, nome: user.nome, email: user.email }
    });
}