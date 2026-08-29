"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
    name: z.string().optional(),
    email: z.string().email("E-mail inválido"),
    password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

type FormValues = z.infer<typeof formSchema>;

export default function LoginForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [typeForm, setTypeForm] = useState<"login" | "register">("login");

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "", // <-- Adicionado string vazia para evitar undefined
            email: "",
            password: "",
        },
    });

    async function onSubmit(values: FormValues) {
        if (typeForm === "login") {
            try {
                setLoading(true);
                setError(null);
                const res = await signIn("credentials", {
                    redirect: false,
                    email: values.email,
                    password: values.password,
                });
                if (res?.error) {
                    setError("E-mail ou senha inválidos.");
                } else {
                    router.refresh();
                    router.push("/atendimento");
                }
            } catch (error) {
                setError("E-mail ou senha inválidos.");
            } finally {
                setLoading(false);
            }
        } else {
            try {
                setLoading(true);
                setError(null);
                const res = await fetch("/api/user", {
                    method: "POST",
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        name: values.name, 
                        email: values.email, 
                        password: values.password 
                    })
                });
                const data = await res.json();
                if (!res.ok) {
                    setError(data?.message || "Falha ao registrar usuário.");
                    return;
                }
                const signInResult = await signIn("credentials", {
                    redirect: false,
                    email: values.email,
                    password: values.password,
                });
                if (signInResult?.error) {
                    setError("Conta criada, mas ocorreu um erro ao fazer login automático.");
                    return;
                }
                router.refresh();
                router.push("/atendimento");
            } catch (error) {
                setError("Falha ao registrar usuário");
            } finally {
                setLoading(false);
            }
        }
    }

    return (
        <section className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-4">
                    <div className="flex justify-end mb-6">
                        <button
                            type="button"
                            onClick={() => {
                                setError(null);
                                setTypeForm(typeForm === "login" ? "register" : "login");
                            }}
                            className="text-sm text-blue-600 hover:text-blue-800 transition"
                        >
                            {typeForm === "login"
                                ? "Quero me cadastrar"
                                : "Quero logar"}
                        </button>
                    </div>

                    <h1 className="text-blue-600 text-3xl font-bold text-center mb-6">
                        {typeForm === "login" ? "Login" : "Cadastrar"}
                    </h1>

                    {typeForm === "register" && (
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel htmlFor="name">Nome</FormLabel>
                                    <FormControl>
                                        <Input id="name" placeholder="Seu nome completo" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}

                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel htmlFor="email">E-mail</FormLabel>
                                <FormControl>
                                    <Input id="email" type="email" placeholder="seu@email.com" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel htmlFor="password">Senha</FormLabel>
                                <FormControl>
                                    <Input id="password" type="password" placeholder="******" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {loading 
                            ? "Carregando..." 
                            : typeForm === "login" ? "Entrar" : "Cadastrar"}
                    </button>

                    {typeForm === "login" && (
                        <div className="text-center mt-4">
                            <small className="text-gray-500 cursor-pointer hover:text-blue-600">
                                Esqueceu sua senha?
                            </small>
                        </div>
                    )}
                </form>
            </Form>
        </section>
    );
}