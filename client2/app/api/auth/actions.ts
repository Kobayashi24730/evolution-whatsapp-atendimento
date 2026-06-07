'use server';
import { prisma } from "@/libs/prisma";
import * as bcrypt from "bcrypt-ts";
import { signIn } from "next-auth/react";

export async function loginForm(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) return null;
    const user = await prisma.user.findUnique({ where: { email} });
    if (!user || !user.password) return { success: false ,error: "User not found" };
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) return { success: false, error: "Invalid password" };

    try {
        await signIn("credentials", {
            email,
            password,
            redirectTo: "/dashboard"
        });
        return { success: true }
        //^4.24.14
    } catch (error: any) {
        if (error && typeof error === "object" && (error.name === "AuthError" || error.type === "CredentialsSignin")) {
            return { success: false, error: "invalid_credentials" };
        }
        throw error
    }
}

export async function registerForm(formData: FormData) {
    const nome = formData.get("nome") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!nome || !email || !password) return { success: false, error: "Preencha todos os campos." }
    if (password.length < 6) return { success: false, error: "Senha deve ter no minimo 6 caracteres." }

    try {
        const userExists = await prisma.user.findUnique({ where: { email } });
        if (userExists) return { success: false, error: "Email ja cadastrado." }
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);

        await prisma.user.create({
            data: {
                nome,
                email,
                password: hashedPassword,
            }
        });
        return { success: true }
    } catch (error) {
        return { success: false, error: "Something went wrong" }
    }
}