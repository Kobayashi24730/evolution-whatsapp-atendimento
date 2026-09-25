"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
    BarChart3,
    LogIn,
    LogOut,
    Search,
    MessageSquare,
    Settings,
    Home,
    Loader2,
} from "lucide-react";

// Mapeamento centralizado de rotas e ícones da barra superior
const navigationItems = [
    { icon: Home, label: "Início", path: "/home" },
    { icon: MessageSquare, label: "Atendimento", path: "/atendimento" },
    { icon: Search, label: "Procurar", path: "/procurar" },
    { icon: BarChart3, label: "Dashboard", path: "/dashboard" },
    { icon: Settings, label: "Configurações", path: "/configuracoes" },
];

export default function Header() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();

    // Redirecionamento de segurança para usuários não autenticados
    useEffect(() => {
        if (status === "loading") return;
        if (status === "unauthenticated" && pathname !== "/login") {
            router.push("/login");
        }
    }, [status, pathname, router]);

    // Skeleton / Spinner minimalista durante o carregamento da sessão
    if (status === "loading") {
        return (
            <header className="w-full h-16 bg-card border-b border-border/70 flex items-center justify-between px-6 sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 animate-pulse" />
                    <span className="text-sm font-bold text-muted-foreground animate-pulse">
                        Carregando...
                    </span>
                </div>
                <Loader2 size={18} className="text-primary animate-spin" />
            </header>
        );
    }

    const initialLetter = session?.user?.email
        ? session.user.email.charAt(0).toUpperCase()
        : session?.user?.name
        ? session.user.name.charAt(0).toUpperCase()
        : "U";

    return (
        <header className="w-full border-b border-border/70 bg-card/95 backdrop-blur-md sticky top-0 z-50 shadow-xs font-sans transition-colors">
            {/* Header Principal */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
                {/* Logo */}
                <Link
                    href="/atendimento"
                    className="text-xl font-bold tracking-tight text-primary hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                    <span className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
                        <MessageSquare className="w-4 h-4" />
                    </span>
                    NEX <span className="font-medium text-foreground">Atendimento</span>
                </Link>

                {/* Ações do Usuário e Status */}
                <div className="flex items-center gap-3">
                    {/* Perfil Rápido / Avatar */}
                    <Link
                        href="/configuracoes"
                        className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full bg-accent/40 hover:bg-accent border border-border/60 transition-all"
                        title="Ir para configurações de perfil"
                    >
                        <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0">
                            <span className="text-primary-foreground text-xs font-bold">
                                {initialLetter}
                            </span>
                        </div>
                        <span className="hidden lg:inline text-xs font-semibold text-foreground max-w-[120px] truncate">
                            {session?.user?.name || session?.user?.email || "Usuário"}
                        </span>
                    </Link>

                    {/* Botão de Logout / Login */}
                    {status === "authenticated" ? (
                        <button
                            type="button"
                            onClick={() => signOut({ callbackUrl: "/login" })}
                            title="Encerrar sessão"
                            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-all cursor-pointer"
                        >
                            <LogOut size={18} />
                        </button>
                    ) : (
                        <Link
                            href="/login"
                            title="Fazer Login"
                            className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-all"
                        >
                            <LogIn size={18} />
                        </Link>
                    )}
                </div>
            </div>

            {/* Sub-bar de Navegação Rápida (Exibida somente se autenticado) */}
            {status === "authenticated" && (
                <div className="w-full border-t border-border/50 bg-card/50 py-1 px-4">
                    <div className="max-w-7xl mx-auto flex items-center justify-end gap-1 overflow-x-auto no-scrollbar">
                        {navigationItems.map(({ icon: Icon, label, path }) => {
                            const isActive = pathname === path;
                            return (
                                <Link
                                    key={path}
                                    href={path}
                                    title={label}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                        isActive
                                            ? "bg-primary/10 text-primary border border-primary/20"
                                            : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                                    }`}
                                >
                                    <Icon className="w-4 h-4 shrink-0" />
                                    <span className="hidden sm:inline">{label}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}
        </header>
    );
}