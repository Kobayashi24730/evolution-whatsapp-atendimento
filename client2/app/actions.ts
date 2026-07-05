'use server';
import { auth } from "@/services/auth";
import {authClient} from "@/app/login/page";

export async function loginForm(prevState: any, formData: FormData) {
    try {
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        await authClient.signIn.email( {
            email,
            password,
        });
    } catch (error) {
        console.log(error);
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