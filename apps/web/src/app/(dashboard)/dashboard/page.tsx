import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import {
    Search,
    ShieldCheck,
    Plus,
    Bell,
    Settings,
    PlusCircle,
    Building2,
    UserPlus,
    Pencil,
    ExternalLink,
    Grid3x3,
    Filter,
    MapPin,
    Landmark,
    Users,
} from "lucide-react";

export default async function DashboardPage() {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("picadito_access_token")?.value;

    if (!accessToken) redirect("/login");

    return (
        <div className="animate-fade-in min-h-full bg-[radial-gradient(1200px_500px_at_80%_-10%,rgba(75,225,118,0.18),transparent_65%),radial-gradient(1000px_420px_at_10%_0%,rgba(5,102,217,0.12),transparent_60%),#0e150e] p-4 text-[#dce5d9] sm:p-6">
            <div className="mx-auto max-w-[1440px] space-y-4 sm:space-y-6">
                {/* Admin banner */}
                <div className="rounded-xl border border-[#3d4a3d]/70 bg-[linear-gradient(90deg,rgba(5,102,217,0.2),rgba(33,196,93,0.1))] px-4 py-2">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="h-4 w-4 shrink-0 text-[#adc6ff]" />
                            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#adc6ff]">
                                Modo super administrador activo
                            </span>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                            <div className="relative">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#bccbb9]" />
                                <input
                                    type="text"
                                    placeholder="Buscar dueno o complejo..."
                                    className="h-9 w-full rounded-full border border-[#3d4a3d] bg-[#0e150e]/80 pl-9 pr-3 text-sm text-[#dce5d9] placeholder:text-[#bccbb9]/70 focus:border-[#0566d9] focus:outline-none sm:w-[220px] lg:w-[250px]"
                                />
                            </div>
                            <button className="rounded-full border border-[#0566d9]/60 bg-[#0566d9]/20 px-3 py-1.5 text-xs font-medium text-[#adc6ff] transition hover:bg-[#0566d9]/30">
                                Cambiar a Vista Dueno
                            </button>
                        </div>
                    </div>
                </div>

                {/* Page title + sede selector */}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6bfe8f]">
                            Gestion de propiedad
                        </p>
                        <h1 className="text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl">Dueno: Carlos Rodriguez</h1>
                        <p className="mt-2 max-w-2xl text-sm text-[#bccbb9] sm:text-base">
                            Administracion jerarquica de sedes deportivas y optimizacion de campos de juego.
                        </p>
                    </div>
                    <div className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur-xl lg:w-auto">
                        <div className="flex-1 lg:flex-none">
                            <p className="text-xs text-[#bccbb9]">Sede seleccionada</p>
                            <select className="w-full bg-transparent text-lg font-semibold text-[#4be176] focus:outline-none sm:text-xl">
                                <option className="bg-[#1a221a]">Sede Norte (Principal)</option>
                                <option className="bg-[#1a221a]">Sede Centro (Urbana)</option>
                                <option className="bg-[#1a221a]">Sede Sur (Recreativa)</option>
                            </select>
                        </div>
                        <div className="h-10 w-px bg-white/20" />
                        <button className="flex flex-col items-center text-[#bccbb9] transition hover:text-[#4be176]">
                            <MapPin className="h-5 w-5" />
                            <span className="text-xs">Nueva sede</span>
                        </button>
                    </div>
                </div>

                {/* Bento grid */}
                <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-12">
                    {/* Complex overview */}
                    <section className="lg:col-span-8">
                        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl sm:p-5">
                            <div className="absolute inset-0 bg-[radial-gradient(700px_240px_at_80%_10%,rgba(75,225,118,0.13),transparent_70%)]" />
                            <div className="relative z-10 flex min-h-[280px] flex-col sm:min-h-[380px]">
                                <div className="mb-auto flex items-start justify-between">
                                    <span className="rounded-full border border-[#4be176]/30 bg-[#4be176]/15 px-3 py-1 text-xs text-[#6bfe8f]">
                                        Complejo activo: Sede Norte
                                    </span>
                                    <div className="flex gap-2">
                                        <button className="rounded-lg border border-white/10 bg-white/5 p-2 text-[#bccbb9] transition hover:bg-white/10">
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                        <button className="rounded-lg border border-white/10 bg-white/5 p-2 text-[#bccbb9] transition hover:bg-white/10">
                                            <ExternalLink className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:grid-cols-4">
                                    {[
                                        { label: "Canchas", value: "12", accent: "text-[#dce5d9]" },
                                        { label: "Ocupacion", value: "84%", accent: "text-[#4be176]" },
                                        { label: "Staff", value: "08", accent: "text-[#dce5d9]" },
                                        { label: "Ingresos Hoy", value: "$1.2k", accent: "text-[#dce5d9]" },
                                    ].map((item) => (
                                        <article key={item.label} className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                                            <p className="text-xs text-[#bccbb9]">{item.label}</p>
                                            <p className={`text-xl font-bold sm:text-2xl ${item.accent}`}>{item.value}</p>
                                        </article>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Right panel */}
                    <section className="space-y-4 sm:space-y-6 lg:col-span-4">
                        <div className="rounded-2xl border border-[#4be176]/30 bg-white/[0.03] p-4 backdrop-blur-xl">
                            <h3 className="mb-3 text-xl font-semibold sm:text-2xl">Acciones Rapidas</h3>
                            <div className="space-y-2">
                                {[
                                    { label: "Crear Nuevo Complejo", icon: PlusCircle },
                                    { label: "Anadir Cancha a Sede Norte", icon: Building2 },
                                    { label: "Asignar Manager", icon: UserPlus },
                                ].map(({ label, icon: Icon }) => (
                                    <button key={label} className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-[#1a221a]/70 p-3 text-left transition hover:border-[#4be176]/50 hover:bg-[#1a221a]">
                                        <Icon className="h-4 w-4 shrink-0 text-[#bccbb9]" />
                                        <span className="text-sm">{label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl">
                            <div className="mb-4 flex items-center justify-between">
                                <h4 className="text-xs font-semibold uppercase tracking-[0.1em] text-[#bccbb9]">Vista jerarquica</h4>
                                <Grid3x3 className="h-4 w-4 text-[#bccbb9]" />
                            </div>
                            <ul className="space-y-3 text-sm">
                                <li className="flex items-center gap-3"><span className="h-2 w-2 shrink-0 rounded-full bg-[#4be176]" />Propiedad (C. Rodriguez)</li>
                                <li className="ml-4 flex items-center gap-3 border-l border-white/10 pl-4"><span className="h-2 w-2 shrink-0 rounded-full bg-[#adc6ff]" />Complejo Sede Norte</li>
                                <li className="ml-8 flex items-center gap-2 border-l border-white/10 pl-4 text-[#bccbb9]">8x Canchas F5</li>
                                <li className="ml-8 flex items-center gap-2 border-l border-white/10 pl-4 text-[#bccbb9]">4x Canchas F11</li>
                            </ul>
                        </div>
                    </section>

                    {/* Field management */}
                    <section className="lg:col-span-12">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <h2 className="text-lg font-semibold sm:text-xl lg:text-2xl xl:text-3xl">Gestion de Canchas: Sede Norte</h2>
                            <div className="flex shrink-0 items-center gap-2">
                                <button className="rounded-lg border border-white/10 bg-[#1a221a]/70 p-2 text-[#bccbb9]">
                                    <Filter className="h-4 w-4" />
                                </button>
                                <button className="rounded-lg border border-white/10 bg-[#1a221a]/70 p-2 text-[#bccbb9]">
                                    <Grid3x3 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            {[
                                { name: "Cancha 01", type: "Futbol 5 - Sintetico", status: "DISPONIBLE", next: "18:00 - 19:00", action: "Gestionar Horarios", reserveNow: false },
                                { name: "Cancha 02", type: "Futbol 5 - Sintetico", status: "RESERVADA", next: "AHORA", action: "Ver Reserva", reserveNow: true },
                                { name: "Cancha 03", type: "Futbol 7 - Sintetico", status: "DISPONIBLE", next: "19:30 - 20:30", action: "Gestionar Horarios", reserveNow: false },
                            ].map((field) => (
                                <article key={field.name} className={`rounded-2xl border p-4 backdrop-blur-xl ${field.reserveNow ? "border-[#adc6ff]/70" : "border-[#4be176]/70"} bg-white/[0.03]`}>
                                    <div className="mb-3 flex items-start justify-between">
                                        <div>
                                            <h3 className="text-xl font-semibold sm:text-2xl">{field.name}</h3>
                                            <p className="text-xs text-[#bccbb9]">{field.type}</p>
                                        </div>
                                        <span className={`rounded-md px-2 py-1 text-[10px] font-bold ${field.reserveNow ? "bg-[#adc6ff]/15 text-[#adc6ff]" : "bg-[#4be176]/15 text-[#6bfe8f]"}`}>
                                            {field.status}
                                        </span>
                                    </div>

                                    <div className={`mb-3 flex h-20 items-center justify-center rounded-xl border sm:h-24 ${field.reserveNow ? "border-[#adc6ff]/25 bg-[#adc6ff]/10" : "border-[#4be176]/25 bg-[#4be176]/10"}`}>
                                        {field.reserveNow ? <Users className="h-8 w-8 text-[#adc6ff]/40 sm:h-9 sm:w-9" /> : <Landmark className="h-8 w-8 text-[#4be176]/40 sm:h-9 sm:w-9" />}
                                    </div>

                                    <div className="mb-3 flex items-center justify-between text-xs text-[#bccbb9]">
                                        <span>Prox. Reserva:</span>
                                        <span className="text-[#dce5d9]">{field.next}</span>
                                    </div>

                                    <button className="w-full rounded-lg border border-white/10 bg-[#2f372e]/50 px-3 py-2 text-sm transition hover:border-[#4be176]/60 hover:bg-[#4be176]/10">
                                        {field.action}
                                    </button>
                                </article>
                            ))}

                            <button className="flex min-h-[200px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/20 bg-transparent text-center transition hover:border-[#4be176]/60 sm:min-h-[280px]">
                                <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#1a221a]">
                                    <Plus className="h-6 w-6 text-[#bccbb9]" />
                                </span>
                                <p className="text-xl font-semibold sm:text-2xl">Nueva Cancha</p>
                                <p className="max-w-[220px] text-sm text-[#bccbb9]">Anadir un nuevo campo de juego a esta sede.</p>
                            </button>
                        </div>
                    </section>

                    {/* Insights */}
                    <section className="lg:col-span-12">
                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl sm:p-5">
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                                <div>
                                    <h3 className="text-xl font-semibold sm:text-2xl lg:text-3xl">Insights de Rendimiento</h3>
                                    <p className="mt-2 text-sm text-[#bccbb9]">Comparativa de ingresos y ocupacion entre tus sedes activas.</p>

                                    <div className="mt-6 space-y-3 text-sm">
                                        {[
                                            { label: "Sede Norte", w: "84%", color: "bg-[#4be176]" },
                                            { label: "Sede Centro", w: "62%", color: "bg-[#6bfe8f]" },
                                            { label: "Sede Sur", w: "45%", color: "bg-[#869585]" },
                                        ].map((s) => (
                                            <div key={s.label} className="flex items-center justify-between gap-3">
                                                <span className="shrink-0">{s.label}</span>
                                                <div className="h-2 w-full max-w-[144px] rounded-full bg-[#1a221a]">
                                                    <div className={`h-2 rounded-full ${s.color}`} style={{ width: s.w }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="lg:col-span-2">
                                    <div className="relative h-48 overflow-hidden rounded-xl border border-white/10 bg-[#1a221a]/60 px-4 pb-3 pt-4 sm:h-64 sm:px-6 sm:pb-4 sm:pt-6">
                                        <div className="absolute inset-0 z-0 flex flex-col justify-between p-4 opacity-20">
                                            <div className="border-t border-[#bccbb9]" />
                                            <div className="border-t border-[#bccbb9]" />
                                            <div className="border-t border-[#bccbb9]" />
                                            <div className="border-t border-[#bccbb9]" />
                                        </div>
                                        <div className="relative z-10 flex h-full items-end justify-between gap-1 sm:gap-3">
                                            {[40, 60, 55, 80, 75, 90, 100, 85, 70, 65].map((h, idx) => (
                                                <div key={h + idx} className="w-full rounded-t bg-[#4be176]" style={{ height: `${h}%`, opacity: 0.22 + idx * 0.06 }} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
