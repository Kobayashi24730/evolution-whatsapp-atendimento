"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import {
    User,
    Bell,
    Smartphone,
    Palette,
    Shield,
    Save,
    Check,
    Wrench,
    Loader2,
} from "lucide-react";

type Section = "perfil" | "notificacoes" | "whatsapp" | "aparencia" | "seguranca";

// ── Cards genéricos ─────────────────────────────────────
function SectionCard({
    title,
    description,
    children,
}: {
    title: string;
    description?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="bg-card border border-border/70 rounded-2xl shadow-xs overflow-hidden transition-colors">
            <div className="px-6 py-4 border-b border-border/50">
                <h2 className="text-sm font-bold text-foreground">{title}</h2>
                {description && (
                    <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                )}
            </div>
            <div className="px-6 py-5 space-y-4">{children}</div>
        </div>
    );
}

function Field({
    label,
    hint,
    children,
}: {
    label: string;
    hint?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-foreground/80">{label}</label>
            {children}
            {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
        </div>
    );
}

// ── Switch / Toggle ──────────────────────────────────────
function Toggle({
    checked,
    onChange,
}: {
    checked: boolean;
    onChange: () => void;
}) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={onChange}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-primary/40 ${
                checked ? "bg-primary" : "bg-muted-foreground/20"
            }`}
        >
            <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-background shadow-xs ring-0 transition duration-200 ease-in-out ${
                    checked ? "translate-x-4" : "translate-x-0"
                }`}
            />
        </button>
    );
}

// ── Linha de Toggle ──────────────────────────────────────
function ToggleRow({
    label,
    description,
    checked,
    onChange,
}: {
    label: string;
    description?: string;
    checked: boolean;
    onChange: () => void;
}) {
    return (
        <div className="flex items-center justify-between gap-4 py-1">
            <div>
                <p className="text-sm text-foreground font-medium">{label}</p>
                {description && (
                    <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                )}
            </div>
            <Toggle checked={checked} onChange={onChange} />
        </div>
    );
}

// ── Placeholder para Recursos em Desenvolvimento ────────
function InDevelopmentCard({ title }: { title: string }) {
    return (
        <div className="bg-card border border-border/70 rounded-2xl shadow-xs p-12 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center">
                <Wrench size={22} />
            </div>
            <h3 className="text-base font-bold text-foreground">{title} em desenvolvimento</h3>
            <p className="text-xs text-muted-foreground max-w-xs">
                Esta funcionalidade está sendo aprimorada e estará disponível em breve.
            </p>
        </div>
    );
}

// ── Page Principal ──────────────────────────────────────
export default function ConfiguracoesPage() {
    const { data: session } = useSession();

    // Navegação Lateral
    const [activeSection, setActiveSection] = useState<Section>("perfil");

    // Perfil
    const [nome, setNome] = useState(session?.user?.name ?? "");
    const [email] = useState(session?.user?.email ?? "");
    const [newEmail, setNewEmail] = useState(session?.user?.email ?? "");

    // Notificações
    const [notifSom, setNotifSom] = useState(true);
    const [notifBrowser, setNotifBrowser] = useState(true);
    const [notifEmail, setNotifEmail] = useState(false);
    const [notifNovoAtend, setNotifNovoAtend] = useState(true);

    // Estados de feedback do formulário
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSave = async () => {
        try {
            setIsSaving(true);
            await fetch("/api/user", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nome, email, newEmail }),
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } catch (error) {
            console.error("Erro ao salvar configurações:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const navItems: { id: Section; label: string; icon: React.ReactNode }[] = [
        { id: "perfil", label: "Perfil", icon: <User size={16} /> },
        { id: "notificacoes", label: "Notificações", icon: <Bell size={16} /> },
        { id: "whatsapp", label: "WhatsApp", icon: <Smartphone size={16} /> },
        { id: "aparencia", label: "Aparência", icon: <Palette size={16} /> },
        { id: "seguranca", label: "Segurança", icon: <Shield size={16} /> },
    ];

    return (
        <div className="min-h-screen bg-background text-foreground font-sans">
            <div className="max-w-5xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Configurações
                    </h1>
                    <p className="text-xs text-muted-foreground mt-1">
                        Gerencie sua conta e preferências do sistema
                    </p>
                </div>

                <div className="flex flex-col md:flex-row gap-6 items-start">
                    {/* Navegação Lateral */}
                    <nav className="w-full md:w-52 shrink-0 bg-card border border-border/70 rounded-2xl shadow-xs overflow-hidden md:sticky md:top-6">
                        <div className="p-1 space-y-0.5">
                            {navItems.map((item) => {
                                const isActive = activeSection === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => setActiveSection(item.id)}
                                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                                            isActive
                                                ? "bg-primary/10 text-primary border border-primary/20"
                                                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                                        }`}
                                    >
                                        <span className={isActive ? "text-primary" : "text-muted-foreground"}>
                                            {item.icon}
                                        </span>
                                        {item.label}
                                    </button>
                                );
                            })}
                        </div>
                    </nav>

                    {/* Conteúdo Principal */}
                    <div className="flex-1 w-full space-y-4">
                        {/* ── PERFIL ── */}
                        {activeSection === "perfil" && (
                            <SectionCard
                                title="Informações pessoais"
                                description="Seus dados públicos de perfil"
                            >
                                {/* Avatar */}
                                <div className="flex items-center gap-4 pb-2">
                                    <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xl font-bold text-primary shrink-0">
                                        {nome?.charAt(0).toUpperCase() ||
                                            session?.user?.email?.charAt(0).toUpperCase() ||
                                            "U"}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-foreground">
                                            {nome || "Usuário"}
                                        </p>
                                        <p className="text-xs text-muted-foreground">{email}</p>
                                        <button
                                            type="button"
                                            className="mt-1 text-xs font-medium text-primary hover:underline cursor-pointer"
                                        >
                                            Trocar foto
                                        </button>
                                    </div>
                                </div>

                                <Field label="Nome completo">
                                    <input
                                        value={nome}
                                        onChange={(e) => setNome(e.target.value)}
                                        placeholder="Seu nome"
                                        className="w-full px-3.5 py-2 text-xs bg-background border border-border/80 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-primary/40 focus:border-primary text-foreground placeholder:text-muted-foreground transition-all"
                                    />
                                </Field>

                                <Field label="E-mail" hint="Usado para login e notificações">
                                    <input
                                        value={newEmail}
                                        onChange={(e) => setNewEmail(e.target.value)}
                                        type="email"
                                        placeholder="email@exemplo.com"
                                        className="w-full px-3.5 py-2 text-xs bg-background border border-border/80 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-primary/40 focus:border-primary text-foreground placeholder:text-muted-foreground transition-all"
                                    />
                                </Field>
                            </SectionCard>
                        )}

                        {/* ── NOTIFICAÇÕES ── */}
                        {activeSection === "notificacoes" && (
                            <SectionCard
                                title="Preferências de notificação"
                                description="Controle como e quando você é notificado"
                            >
                                <ToggleRow
                                    label="Som de notificação"
                                    description="Tocar som ao receber nova mensagem"
                                    checked={notifSom}
                                    onChange={() => setNotifSom(!notifSom)}
                                />
                                <hr className="border-border/40" />
                                <ToggleRow
                                    label="Notificação no navegador"
                                    description="Mostrar pop-up mesmo fora da aba"
                                    checked={notifBrowser}
                                    onChange={() => setNotifBrowser(!notifBrowser)}
                                />
                                <hr className="border-border/40" />
                                <ToggleRow
                                    label="Alertas por e-mail"
                                    description="Receber resumo diário de atendimentos"
                                    checked={notifEmail}
                                    onChange={() => setNotifEmail(!notifEmail)}
                                />
                                <hr className="border-border/40" />
                                <ToggleRow
                                    label="Novo atendimento"
                                    description="Notificar quando um chat for aberto"
                                    checked={notifNovoAtend}
                                    onChange={() => setNotifNovoAtend(!notifNovoAtend)}
                                />
                            </SectionCard>
                        )}

                        {/* ── WHATSAPP ── */}
                        {activeSection === "whatsapp" && (
                            <InDevelopmentCard title="Módulo WhatsApp" />
                        )}

                        {/* ── APARÊNCIA ── */}
                        {activeSection === "aparencia" && (
                            <InDevelopmentCard title="Aparência e Tema" />
                        )}

                        {/* ── SEGURANÇA ── */}
                        {activeSection === "seguranca" && (
                            <InDevelopmentCard title="Configurações de Segurança" />
                        )}

                        {/* Botão de Salvar Ações */}
                        {(activeSection === "perfil" || activeSection === "notificacoes") && (
                            <div className="flex justify-end pt-2">
                                <button
                                    type="button"
                                    disabled={isSaving}
                                    onClick={handleSave}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none text-primary-foreground text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 size={15} className="animate-spin" />
                                            Salvando...
                                        </>
                                    ) : saved ? (
                                        <>
                                            <Check size={15} />
                                            Salvo!
                                        </>
                                    ) : (
                                        <>
                                            <Save size={15} />
                                            Salvar alterações
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}