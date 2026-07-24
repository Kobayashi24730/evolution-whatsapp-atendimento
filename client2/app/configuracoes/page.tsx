'use client';

import { useState } from "react";
import { useSession } from "next-auth/react";
import {
    User, Bell, Smartphone, Palette, Shield,
    Save, Eye, EyeOff, Check, Moon, Sun, Monitor,
    ChevronRight
} from "lucide-react";

// ── Tipos ──────────────────────────────────────────────
type Section = "perfil" | "notificacoes" | "whatsapp" | "aparencia" | "seguranca";

// ── Componente de seção com título ──────────────────────
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

// ── Campo de input reutilizável ─────────────────────────
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

// ── Page ────────────────────────────────────────────────
export default function ConfiguracoesPage() {
    const { data: session } = useSession();

    // Nav lateral
    const [activeSection, setActiveSection] = useState<Section>("perfil");

    // Perfil
    const [nome, setNome] = useState(session?.user?.name ?? "");
    const [email, setEmail] = useState(session?.user?.email ?? "");

    // Notificações
    const [notifSom, setNotifSom]       = useState(true);
    const [notifBrowser, setNotifBrowser] = useState(true);
    const [notifEmail, setNotifEmail]   = useState(false);
    const [notifNovoAtend, setNotifNovoAtend] = useState(true);

    // WhatsApp / Evolution
    const [instanceName, setInstanceName] = useState(process.env.NEXT_PUBLIC_EVOLUTION_INSTANCE ?? "");
    const [apiUrl, setApiUrl]             = useState("");
    const [apiKey, setApiKey]             = useState("");
    const [showApiKey, setShowApiKey]     = useState(false);
    const [webhookUrl, setWebhookUrl]     = useState("");

    // Aparência
    const [tema, setTema] = useState<"light" | "dark" | "system">("light");
    const [densidade, setDensidade] = useState<"confortavel" | "compacto">("confortavel");
    const [corAcento, setCorAcento] = useState("#2563eb");

    // Segurança
    const [senhaAtual, setSenhaAtual]   = useState("");
    const [novaSenha, setNovaSenha]     = useState("");
    const [confirmSenha, setConfirmSenha] = useState("");
    const [showSenhas, setShowSenhas]   = useState(false);
    const [auth2fa, setAuth2fa]         = useState(false);

    // Feedback de salvo
    const [saved, setSaved] = useState(false);
    const handleSave = () => {
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
                            <>
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
                                        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="email@exemplo.com" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    </Field>
                                </SectionCard>
                            </>
                        )}

                        {/* ── NOTIFICAÇÕES ── */}
                        {activeSection === "notificacoes" && (
                            <SectionCard title="Preferências de notificação" description="Controle como e quando você é notificado">
                                <ToggleRow label="Som de notificação"      description="Tocar som ao receber nova mensagem"        checked={notifSom}       onChange={() => setNotifSom(!notifSom)}             />
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
                            <SectionCard title="Instância Evolution API" description="Configuração da conexão com o WhatsApp">
                                <Field label="Nome da instância">
                                    <input value={instanceName} onChange={(e) => setInstanceName(e.target.value)} placeholder="ex: minha-empresa" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono" />
                                </Field>
                                <Field label="URL da API" hint="Ex: http://localhost:8080">
                                    <input value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} placeholder="https://api.seudominio.com" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </Field>
                                <Field label="API Key">
                                    <div className="relative">
                                        <input
                                            value={apiKey}
                                            onChange={(e) => setApiKey(e.target.value)}
                                            type={showApiKey ? "text" : "password"}
                                            placeholder="••••••••••••••••"
                                            className="w-full px-3 py-2 pr-10 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                                        />
                                        <button type="button" onClick={() => setShowApiKey(!showApiKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                            {showApiKey ? <EyeOff size={15} /> : <Eye size={15} />}
                                        </button>
                                    </div>
                                </Field>
                                <Field label="Webhook URL" hint="URL que a Evolution API irá chamar">
                                    <input value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} placeholder="https://seusite.com/api/webhook" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </Field>

                                {/* Status da conexão */}
                                <div className="flex items-center gap-2 pt-2 text-xs text-gray-500">
                                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                    Instância conectada
                                </div>
                            </SectionCard>
                        )}

                        {/* ── APARÊNCIA ── */}
                        {activeSection === "aparencia" && (
                            <>
                                <SectionCard title="Tema" description="Escolha como o sistema aparece para você">
                                    <div className="grid grid-cols-3 gap-3">
                                        {([
                                            { value: "light",  label: "Claro",    icon: <Sun size={18} />     },
                                            { value: "dark",   label: "Escuro",   icon: <Moon size={18} />    },
                                            { value: "system", label: "Sistema",  icon: <Monitor size={18} /> },
                                        ] as const).map((t) => (
                                            <button
                                                key={t.value}
                                                onClick={() => setTema(t.value)}
                                                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-xs font-medium transition-all ${
                                                    tema === t.value
                                                        ? "border-blue-500 bg-blue-50 text-blue-700"
                                                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                                                }`}
                                            >
                                                {t.icon}
                                                {t.label}
                                            </button>
                                        ))}
                                    </div>
                                </SectionCard>

                                <SectionCard title="Densidade" description="Ajuste o espaçamento da interface">
                                    <div className="grid grid-cols-2 gap-3">
                                        {([
                                            { value: "confortavel", label: "Confortável", desc: "Mais espaço entre itens"   },
                                            { value: "compacto",    label: "Compacto",    desc: "Mais itens por tela"       },
                                        ] as const).map((d) => (
                                            <button
                                                key={d.value}
                                                onClick={() => setDensidade(d.value)}
                                                className={`flex flex-col gap-1 p-4 rounded-xl border-2 text-left transition-all ${
                                                    densidade === d.value
                                                        ? "border-blue-500 bg-blue-50"
                                                        : "border-gray-200 hover:border-gray-300"
                                                }`}
                                            >
                                                <span className={`text-sm font-semibold ${densidade === d.value ? "text-blue-700" : "text-gray-700"}`}>{d.label}</span>
                                                <span className="text-xs text-gray-400">{d.desc}</span>
                                            </button>
                                        ))}
                                    </div>
                                </SectionCard>

                                <SectionCard title="Cor de destaque">
                                    <div className="flex items-center gap-4">
                                        {["#2563eb","#7c3aed","#059669","#dc2626","#d97706","#0891b2"].map((cor) => (
                                            <button
                                                key={cor}
                                                onClick={() => setCorAcento(cor)}
                                                style={{ backgroundColor: cor }}
                                                className="w-8 h-8 rounded-full border-2 border-white shadow-sm flex items-center justify-center transition-transform hover:scale-110"
                                            >
                                                {corAcento === cor && <Check size={14} className="text-white" />}
                                            </button>
                                        ))}
                                    </div>
                                </SectionCard>
                            </>
                        )}

                        {/* ── SEGURANÇA ── */}
                        {activeSection === "seguranca" && (
                            <>
                                <SectionCard title="Alterar senha" description="Use uma senha forte com pelo menos 8 caracteres">
                                    <Field label="Senha atual">
                                        <div className="relative">
                                            <input type={showSenhas ? "text" : "password"} value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} placeholder="••••••••" className="w-full px-3 py-2 pr-10 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                            <button type="button" onClick={() => setShowSenhas(!showSenhas)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                                {showSenhas ? <EyeOff size={15} /> : <Eye size={15} />}
                                            </button>
                                        </div>
                                    </Field>
                                    <Field label="Nova senha">
                                        <input type={showSenhas ? "text" : "password"} value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} placeholder="••••••••" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    </Field>
                                    <Field label="Confirmar nova senha">
                                        <input
                                            type={showSenhas ? "text" : "password"}
                                            value={confirmSenha}
                                            onChange={(e) => setConfirmSenha(e.target.value)}
                                            placeholder="••••••••"
                                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                                confirmSenha && novaSenha !== confirmSenha ? "border-red-300" : "border-gray-200"
                                            }`}
                                        />
                                        {confirmSenha && novaSenha !== confirmSenha && (
                                            <p className="text-xs text-red-500 mt-1">As senhas não coincidem</p>
                                        )}
                                    </Field>
                                </SectionCard>

                                <SectionCard title="Autenticação em dois fatores" description="Adicione uma camada extra de segurança">
                                    <ToggleRow
                                        label="Ativar 2FA"
                                        description="Exige código adicional ao fazer login"
                                        checked={auth2fa}
                                        onChange={() => setAuth2fa(!auth2fa)}
                                    />
                                    {auth2fa && (
                                        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
                                            Configure um aplicativo autenticador como Google Authenticator ou Authy.
                                        </div>
                                    )}
                                </SectionCard>
                            </>
                        )}

                        {/* Botão salvar fixo */}
                        <div className="flex justify-end pt-2">
                            <button
                                onClick={handleSave}
                                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
                            >
                                {saved ? <><Check size={15} /> Salvo!</> : <><Save size={15} /> Salvar alterações</>}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}