'use client';
import Link from "next/link";
import { Menu, Search, LogIn } from 'lucide-react';
import { useSession } from "next-auth/react";
import LoginForm from "@/app/login/page";
import {useEffect} from "react";
import {usePathname, useRouter} from "next/navigation";

export default function Header() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    useEffect(() => {
        if (status === "loading") return;
        if (status === "unauthenticated" && pathname !== "\login") {
            router.push("/login");
        }
    }, [status, pathname]);

    if (status === "loading") {
        return <div className="h-16 w-full bg-white border-b flex items-center justify-center text-sm">Carregando...</div>;
    }
    return (
        <header className="w-full border-b bg-white sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/atendimento" className="text-2xl font-bold text-blue-600">
                    NEX Atendimento
                </Link>

                <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
                    <Link href={session?.user ? "/atendimento" : "/login"} className="text-black hover:text-blue-600  transition">Atendimento</Link>
                    <Link href="/profile" className="flex items-center gap-2 px-2 py-1.5 rounded-md hover-subtle transition-all">
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                            <span className="text-primary-foreground text-xs font-semibold">{session?.user?.email ? session.user.email .charAt(0).toUpperCase() : "U"}</span>
                        </div>
                        <div className="hidden lg:block">
                            {status === "authenticated" && (<span>Logado</span>)}
                            {status === "unauthenticated" && (<span>Deslogado</span>)}
                        </div>
                    </Link>
                </nav>

                <div className="flex items-center gap-4">
                    <button className="p-2 text-black hover:bg-blue-600 rounded-full transition">
                        <Search size={20} />
                    </button>
                    <button className="md:hidden p-2">
                        <Menu size={24} />
                    </button>
                    <Link href="/login" className="p-2 text-black hover:bg-blue-600 rounded-full transition">
                        <LogIn size={20} />
                    </Link>
                </div>
            </div>
        </header>
    );
}