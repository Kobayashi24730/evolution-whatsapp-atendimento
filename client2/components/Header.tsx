import Link from "next/link";
import { Menu, Search, LogIn } from 'lucide-react';

export default function Header() {
    return (
        <header className="w-full border-b bg-white sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="text-2xl font-bold text-blue-600">
                    Meu sistema
                </Link>

                <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
                    <Link href="/atendimento" className="text-black hover:text-blue-600  transition">Atendimento</Link>
                    <Link href="/login" className="text-black hover:text-blue-600  transition">Seu usuario</Link>
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