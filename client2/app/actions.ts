'use server';
import { signIn } from "@/services/auth";
import { AuthError } from "next-auth";
import { auth } from "@/services/auth";

export async function loginForm(prevState: any, formData: FormData) {
    try {
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        await signIn("credentials", {
            email,
            password,
            redirectTo: "/dashboard",
        });
    } catch (error) {
        if (error instanceof AuthError) {
            return "Credenciais inválidas.";
        }
        throw error;
    }
}

export async function registerForm(formData: FormData) {
    try {
        const nome = formData.get("nome") as string;
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        console.log(nome, email, password);
        await auth.api.signUpEmail({
            body: {
                name: nome,
                email,
                password,
            },
        });

        return {
            success: true,
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message,
        };
    }
}