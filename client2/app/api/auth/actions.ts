'use server';
import { prisma } from "@/libs/prisma";
import bcrypt from "bcryptjs";
import { signIn } from "@/services/auth";
import { AuthError } from "next-auth";

export async function loginForm(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
        return null;
    }

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if ( !user || !user.password ) {
            return { success: false ,error: "User not found" }
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return { success: false, error: "Invalid password" }
        }
        await signIn("credentials", {
            email,
            password,
            redirect: "/dashboard"
        });

        return { success: true }
    } catch (error) {
        if (error instanceof AuthError) {
            switch(error.type) {
                case "CredentialsSignin":
                    return "invalid_credentials"
                default:
                    return "Something went wrong"
            }
        }
        throw error
    }
}