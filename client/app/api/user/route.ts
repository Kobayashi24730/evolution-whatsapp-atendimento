import { NextResponse } from "next/server";
import {validateSession} from "@/libs/auth"; //? atenticacao
import { prisma } from "@/libs/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
    const session = await validateSession(); //? verifica se o usuario esta autenticado
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    try {
        const { email, password } = await request.json(); //? coreleta os dados do usuario
        if (!email || !password) {
            return NextResponse.json({message: "Missing email or password"}, {status: 400});
        }
        const hashPassword = await bcrypt.hash(password, 10); //? gera o hash da senha
        //? cria o usuario no banco de dados pelo prismas
        const response = await prisma.user.create({
            data: {
                name: "Usuario",
                email: email,
                password: hashPassword
            }
        });
        return NextResponse.json({ message: "Success in create user"}, {status: 200});
    } catch (err) {
        console.error("Failed in create user, error line: ", err);
        return NextResponse.json({ message: "Failed in create user"}, {status: 500});
    }
};

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get("email");
        const password = searchParams.get("password"); //! password amostra corrigir ainda..
        if (!email || !password) {
            return NextResponse.json({ message: "Missing email or password" }, { status: 400 });
        }
        const user = await prisma.user.findUnique({
            where: {
                email: email
            }
        });
        // ? verifica se o user existe se não existe retorna 404
        if (!user) {
            return NextResponse.json({message: "User not exists"}, {status: 404});
        }
        if (!user.password) return null;
        const isValidPassord = await bcrypt.compare(password.trim(), user.password);
        if (!isValidPassord) {
            return NextResponse.json({message: "Invalid password"}, {status: 401});
        }
        return NextResponse.json({
            id: user.id,
            name: user.name,
            email: user.email
        })
    } catch (err) {
        console.error("Failed in get user, error line: ", err);
        return NextResponse.json({ message: "Failed in get user"}, {status: 500});
    }
}