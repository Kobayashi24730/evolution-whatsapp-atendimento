"use client";

import { createAuthClient } from "better-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerForm } from "@/app/actions";

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_APP_URL
});

export default function LoginPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [typeForm, setTypeForm] = useState("login");

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setLoading(true);
        const formData = new FormData(event.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        if (typeForm == "login") {
            await authClient.signIn.email({
                email,
                password,
                callbackURL: "/dashboard",
            }, {
                onRequest: () => {
                    setLoading(true);
                },
                onSuccess: () => {
                    setLoading(false);
                    router.push("/dashboard");
                    router.refresh();
                },
                onError: (ctx) => {
                    setLoading(false);
                    setError(ctx.error.message || "E-mail ou senha inválidos.");
                }
            });
        } else {
            const result = await registerForm(formData);
            console.log(formData.get("nome"), formData.get("email"), formData.get("password"));
            setLoading(false);
            if (!result.success) {
                setError(result.error);
                return;
            }
            router.push("/dashboard");
            router.refresh();
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
                <div className="flex justify-end mb-6">
                    <button
                        onClick={() =>
                            setTypeForm(
                                typeForm === "login"
                                    ? "register"
                                    : "login"
                            )
                        }
                        className="text-sm text-blue-600 hover:text-blue-800 transition"
                    >
                        {typeForm === "login"
                            ? "Quero me cadastrar"
                            : "Quero logar"}
                    </button>
                </div>

                <h1 className="text-3xl font-bold text-center mb-6">
                    {typeForm === "login" ? "Login" : "Cadastrar"}
                </h1>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {typeForm === "register" && (
                        <input
                            name="nome"
                            type="text"
                            placeholder="Informe seu nome"
                            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    )}
                    <input
                        name="email"
                        type="email"
                        placeholder="Informe seu email"
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        name="password"
                        type="password"
                        placeholder="Informe sua senha"
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {error && <p className="text-red-500">{error}</p>}
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                    >
                        {typeForm === "login"
                            ? "Entrar"
                            : "Cadastrar"}
                    </button>
                </form>

                {typeForm === "login" && (
                    <div className="text-center mt-4">
                        <small className="text-gray-500 cursor-pointer hover:text-blue-600">
                            Esqueceu sua senha?
                        </small>
                    </div>
                )}
            </div>
        </main>
    );
}