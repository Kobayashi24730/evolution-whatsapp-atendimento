'use client';
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import LoginForm from "@/app/login/page";
import {useEffect} from "react";
import {usePathname, useRouter} from "next/navigation";
import { BarChart3,
    LogIn,
    LogOut,
    Search,
    FileText,
    Users2,
    Gift,
    MessageSquare,
    Settings } from "lucide-react";

const iconsTopBar = [
    { icon: MessageSquare, label: "atendimento" },
    { icon: Search, label: "procurar" },
    { icon: BarChart3, label: "dashboard" },
    { icon: Settings, label: "configuracoes" }
];

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
        <header className="w-full border-b bg-white sticky top-0 z-50 shadow-sm">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/atendimento" className="text-2xl font-bold text-blue-600">
                    NEX Atendimento
                </Link>

                <div className="flex items-center gap-4">
                    <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
                        {/*<Link href={session?.user ? "/atendimento" : "/login"} className="text-black hover:text-blue-600  transition">Atendimento</Link>*/}
                        <Link href="/profile" className="flex items-center gap-2 px-2 py-1.5 rounded-md hover-subtle transition-all">
                            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                                <span className="text-primary-foreground text-xs font-semibold">{session?.user?.email ? session.user.email .charAt(0).toUpperCase() : "U"}</span>
                            </div>
                            <div className="hidden lg:block">
                                {status === "authenticated" && (<span></span>)}
                                {status === "unauthenticated" && (<span>Deslogado</span>)}
                            </div>
                        </Link>
                    </nav>
                    {status === "authenticated" ? (
                            <button onClick={() => signOut({callbackUrl: "/login"})}  title="Sair" className="p-2 text-black hover:bg-blue-600 rounded-full transition">
                                <LogOut size={20} />
                            </button>
                        ) : (
                            <Link href="/login" className="p-2 text-black hover:bg-blue-600 rounded-full transition" title="Entrar">
                                <LogIn size={20} />
                            </Link>
                        )
                    }
                </div>
            </div>
            {status === "authenticated" && (
                <div className="w-full border-t bg-gray-50/50 py-1.5 px-4">
                    <div className="max-w-7xl mx-auto flex items-center justify-end gap-1">
                        {iconsTopBar.map(({icon: Componenet, label}, index) => (
                            <button key={index} title={label} onClick={() => router.push(`${label}`)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-150">
                                <Componenet className="w-5 h-5" />
                            </button>
                        ))}
                    </div>
                </div>
            )
            }
        </header>
    );
}