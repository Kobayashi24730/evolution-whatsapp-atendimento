"use server";
import { signIn } from "@/services/auth";
import { AuthError } from "next-auth";

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
