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

export async function PUT(request: Request) {
    const session = await validateSession(); //? verifica se o usuario esta autenticado
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    try {
        const { nome, email, newEmail } = await request.json();
        if (!nome || !email) {
            return NextResponse.json({ message: "Missing name or email" }, { status: 400 });
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
        let targetEmail = email;
        if (newEmail && newEmail !== null) {
            const verifyExistsEmail = await prisma.user.findUnique({
                where: { email: newEmail }
            });
            if (verifyExistsEmail) {
                return NextResponse.json({ message: "Email already exists" }, { status: 400 });
            }
            targetEmail = newEmail;
        }

        const update = await prisma.user.update({
            where: {
                email: email
            },
            data: {
                name: nome,
                email: targetEmail
            }
        });

        return NextResponse.json({ message: "Success in update user"}, {status: 200});
    } catch (err) {
        console.error("Failed in update user, error line: ", err);
        return NextResponse.json({ message: "Failed in update user"}, {status: 500});
    }
}

