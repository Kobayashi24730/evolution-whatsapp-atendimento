'use client';

import { useState } from "react";
import { useSession } from "next-auth/react";
import {
    User, Bell, Smartphone, Palette, Shield,
    Save, Check, Wrench
} from "lucide-react";

type Section = "perfil" | "notificacoes" | "whatsapp" | "aparencia" | "seguranca";

function SectionCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
    return (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50">
                <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
                {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
            </div>
            <div className="px-6 py-5 space-y-4">
                {children}
            </div>
        </div>
    );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-600">{label}</label>
            {children}
            {hint && <p className="text-[11px] text-gray-400">{hint}</p>}
        </div>
    );
}

// ── Toggle ──────────────────────────────────────────────
function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
    return (
        <button
            type="button"
            onClick={onChange}
            className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${checked ? "bg-blue-600" : "bg-gray-200"}`}
        >
            <span className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? "translate-x-4" : "translate-x-0"}`} />
        </button>
    );
}

// ── Linha de toggle com label ───────────────────────────
function ToggleRow({ label, description, checked, onChange }: { label: string; description?: string; checked: boolean; onChange: () => void }) {
    return (
        <div className="flex items-center justify-between gap-4 py-1">
            <div>
                <p className="text-sm text-gray-700 font-medium">{label}</p>
                {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
            </div>
            <Toggle checked={checked} onChange={onChange} />
        </div>
    );
}

// ── Componente de Placeholder para Recursos em Desenvolviento ──
function InDevelopmentCard({ title }: { title: string }) {
    return (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-12 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
                <Wrench size={24} />
            </div>
            <h3 className="text-base font-semibold text-gray-800">{title} em desenvolvimento</h3>
            <p className="text-xs text-gray-400 max-w-xs">
                Esta funcionalidade está sendo atualizada e estará disponível em breve.
            </p>
        </div>
    );
}

// ── Page ────────────────────────────────────────────────
export default function ConfiguracoesPage() {
    const { data: session } = useSession();

    // Nav lateral
    const [activeSection, setActiveSection] = useState<Section>("perfil");

    // Perfil
    const [nome, setNome] = useState(session?.user?.name ?? "");
    const [email] = useState(session?.user?.email ?? "");
    const [newEmail, setNewEmail] = useState(session?.user?.email ?? "");

    // Notificações
    const [notifSom, setNotifSom]         = useState(true);
    const [notifBrowser, setNotifBrowser] = useState(true);
    const [notifEmail, setNotifEmail]     = useState(false);
    const [notifNovoAtend, setNotifNovoAtend] = useState(true);

    // Feedback de salvo
    const [saved, setSaved] = useState(false);
    const handleSave = async () => {
        await fetch("api/user", {
            method: "PUT",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email, newEmail })
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    const navItems: { id: Section; label: string; icon: React.ReactNode }[] = [
        { id: "perfil",       label: "Perfil",         icon: <User size={16} />       },
        { id: "notificacoes", label: "Notificações",   icon: <Bell size={16} />       },
        { id: "whatsapp",     label: "WhatsApp",       icon: <Smartphone size={16} /> },
        { id: "aparencia",    label: "Aparência",      icon: <Palette size={16} />    },
        { id: "seguranca",    label: "Segurança",      icon: <Shield size={16} />     },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-5xl mx-auto px-4 py-8">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
                    <p className="text-sm text-gray-400 mt-1">Gerencie sua conta e preferências do sistema</p>
                </div>

                <div className="flex gap-6 items-start">

                    {/* Nav lateral */}
                    <nav className="w-52 shrink-0 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden sticky top-6">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveSection(item.id)}
                                className={`
                                    w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors
                                    ${activeSection === item.id
                                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-500"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                                }
                                `}
                            >
                                <span className={activeSection === item.id ? "text-blue-600" : "text-gray-400"}>
                                    {item.icon}
                                </span>
                                {item.label}
                            </button>
                        ))}
                    </nav>

                    {/* Conteúdo */}
                    <div className="flex-1 space-y-4">

                        {/* ── PERFIL ── */}
                        {activeSection === "perfil" && (
                            <SectionCard title="Informações pessoais" description="Seus dados públicos de perfil">
                                {/* Avatar */}
                                <div className="flex items-center gap-4 pb-2">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 border-2 border-blue-100 flex items-center justify-center text-2xl font-bold text-blue-600 shrink-0">
                                        {nome?.charAt(0).toUpperCase() || session?.user?.email?.charAt(0).toUpperCase() || "U"}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">{nome || "Usuário"}</p>
                                        <p className="text-xs text-gray-400">{email}</p>
                                        <button className="mt-1.5 text-xs text-blue-600 hover:underline">Trocar foto</button>
                                    </div>
                                </div>

                                <Field label="Nome completo">
                                    <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </Field>
                                <Field label="E-mail" hint="Usado para login e notificações">
                                    <input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} type="email" placeholder="email@exemplo.com" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </Field>
                            </SectionCard>
                        )}

                        {/* ── NOTIFICAÇÕES ── */}
                        {activeSection === "notificacoes" && (
                            <SectionCard title="Preferências de notificação" description="Controle como e quando você é notificado">
                                <ToggleRow label="Som de notificação"     description="Tocar som ao receber nova mensagem"        checked={notifSom}       onChange={() => setNotifSom(!notifSom)}             />
                                <hr className="border-gray-50" />
                                <ToggleRow label="Notificação no navegador" description="Mostrar pop-up mesmo fora da aba"         checked={notifBrowser}   onChange={() => setNotifBrowser(!notifBrowser)}     />
                                <hr className="border-gray-50" />
                                <ToggleRow label="Alertas por e-mail"      description="Receber resumo diário de atendimentos"    checked={notifEmail}     onChange={() => setNotifEmail(!notifEmail)}         />
                                <hr className="border-gray-50" />
                                <ToggleRow label="Novo atendimento"        description="Notificar quando um chat for aberto"      checked={notifNovoAtend} onChange={() => setNotifNovoAtend(!notifNovoAtend)} />
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

                        {/* Botão salvar fixo (exibido apenas para abas ativas) */}
                        {(activeSection === "perfil" || activeSection === "notificacoes") && (
                            <div className="flex justify-end pt-2">
                                <button
                                    onClick={handleSave}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
                                >
                                    {saved ? <><Check size={15} /> Salvo!</> : <><Save size={15} /> Salvar alterações</>}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}