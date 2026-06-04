'use client';
import { useState } from "react";

export default function Login() {
    const [typeForm, setTypeForm] = useState("login");
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

                <form className="flex flex-col gap-4">
                    <input
                        type="email"
                        placeholder="Informe seu email"
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="password"
                        placeholder="Informe sua senha"
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {typeForm === "register" && (
                        <input
                            type="password"
                            placeholder="Confirme sua senha"
                            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    )}
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