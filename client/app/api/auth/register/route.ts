import { prisma } from "@/libs/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { nome, email, password } = await request.json();
        if (!nome || !email || !password) {
            return NextResponse.json({ error: "Dados imcompletos" }, { status: 400 });
        }

        const userExists = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
        if  (userExists){
            return NextResponse.json({ error: "Email já cadastrado" }, { status: 400 })
        }

        const passwordhash = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { nome, email: email.toLowerCase(), password: passwordhash }
        });
        return NextResponse.json({ user: {id: user.id, email: user.email } }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Erro ao cadastrar usuário" }, { status: 500 });
    }
}