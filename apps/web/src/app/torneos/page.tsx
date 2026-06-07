import Image from "next/image";
import {
    BarChart3,
    Bell,
    CalendarDays,
    CheckCircle2,
    ChevronRight,
    CircleMinus,
    Eye,
    Grid2X2,
    HelpCircle,
    LogOut,
    Menu,
    Plus,
    Settings,
    Shield,
    Trophy,
    Users,
} from "lucide-react";
import { Button } from "@/components/design-system";

const standings = [
    { pos: 1, team: "Fenix Dorado", pts: 22 },
    { pos: 2, team: "Trueno FC", pts: 20 },
    { pos: 3, team: "Los Galacticos FC", pts: 18, active: true },
    { pos: 4, team: "Atletico Norte", pts: 17 },
    { pos: 5, team: "Real Sportivo", pts: 15 },
    { pos: 6, team: "Titan FC", pts: 12 },
];

const stats = [
    { label: "Posicion", value: "3°", meta: "+1" },
    { label: "Puntos", value: "18" },
    { label: "Jugados", value: "8", meta: "/ 14" },
    { label: "Dif. gol", value: "+12" },
];

const fixtures = [
    { month: "MAR", day: "28", rival: "vs Real Sportivo", detail: "Cancha 4 - 20:00 hs" },
    { month: "ABR", day: "04", rival: "vs Titan FC", detail: "Cancha Central - 22:30 hs" },
];

const results = [
    { score: "3-1", title: "Victoria vs Leones", detail: "Fecha 7 - Visitante", status: "win" },
    { score: "2-2", title: "Empate vs Inter", detail: "Fecha 6 - Local", status: "draw" },
];

const sideItems = [
    { label: "Overview", icon: Grid2X2 },
    { label: "Squad", icon: Users, active: true },
    { label: "Schedule", icon: CalendarDays },
    { label: "Analytics", icon: BarChart3 },
    { label: "Facilities", icon: Trophy },
];

const topItems = ["Dashboard", "Tournaments", "Bookings", "Players"];

function TeamMark({ muted = false }: { muted?: boolean }) {
    return (
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#293428] shadow-inner sm:h-24 sm:w-24">
            <Shield className={muted ? "h-10 w-10 text-[#b8caff]" : "h-11 w-11 text-[#47e878]"} strokeWidth={2.4} />
        </div>
    );
}

export default function TorneosPage() {
    return (
        <main className="min-h-screen bg-[#071009] text-[#edf5ea]">
            <header className="sticky top-0 z-30 border-b border-white/10 bg-[#071009]/95 backdrop-blur">
                <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:h-20">
                    <div className="flex items-center gap-3">
                        <button className="rounded-md border border-white/10 p-2 text-[#d8e3d3] lg:hidden" aria-label="Abrir menu">
                            <Menu className="h-5 w-5" />
                        </button>
                        <span className="font-heading text-2xl font-extrabold text-[#47e878] sm:text-3xl">Elite Pitch</span>
                    </div>

                    <nav className="hidden items-center gap-8 text-base text-[#cbd6c7] md:flex lg:gap-10 lg:text-lg">
                        {topItems.map((item) => (
                            <a
                                key={item}
                                href="#"
                                className={
                                    item === "Tournaments"
                                        ? "border-b-2 border-[#47e878] pb-2 font-bold text-[#47e878]"
                                        : "pb-2 transition hover:text-white"
                                }
                            >
                                {item}
                            </a>
                        ))}
                    </nav>

                    <div className="flex items-center gap-2 sm:gap-4">
                        <button className="hidden rounded-md p-2 text-[#d8e3d3] transition hover:bg-white/5 sm:inline-flex" aria-label="Notificaciones">
                            <Bell className="h-5 w-5" />
                        </button>
                        <button className="hidden rounded-md p-2 text-[#d8e3d3] transition hover:bg-white/5 sm:inline-flex" aria-label="Configuracion">
                            <Settings className="h-5 w-5" />
                        </button>
                        <div className="h-10 w-10 overflow-hidden rounded-full border border-[#47e878]/25 bg-[#142018]">
                            <Image src="/logo-picadito.png" alt="Perfil" width={40} height={40} className="h-full w-full object-cover" />
                        </div>
                    </div>
                </div>

                <nav className="flex gap-5 overflow-x-auto px-4 pb-3 text-sm text-[#cbd6c7] md:hidden">
                    {topItems.map((item) => (
                        <a key={item} href="#" className={item === "Tournaments" ? "font-bold text-[#47e878]" : ""}>
                            {item}
                        </a>
                    ))}
                </nav>
            </header>

            <div className="mx-auto grid max-w-[1560px] lg:grid-cols-[304px_minmax(0,1fr)]">
                <aside className="hidden min-h-[calc(100vh-80px)] border-r border-white/10 bg-[#142018] px-5 py-9 lg:flex lg:flex-col">
                    <div className="mb-14 flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[#071009] shadow-lg">
                            <Shield className="h-7 w-7 text-[#47e878]" />
                        </div>
                        <div>
                            <p className="font-heading text-2xl font-extrabold">Elite FC</p>
                            <p className="text-xs font-semibold uppercase text-[#cbd6c7]">Pro management</p>
                        </div>
                    </div>

                    <nav className="space-y-3">
                        {sideItems.map(({ label, icon: Icon, active }) => (
                            <a
                                key={label}
                                href="#"
                                className={
                                    active
                                        ? "flex items-center gap-4 rounded-md border-r-4 border-[#47e878] bg-[#1f3b23] px-5 py-4 font-bold uppercase text-[#47e878]"
                                        : "flex items-center gap-4 rounded-md px-5 py-4 font-bold uppercase text-[#d7e2d2] transition hover:bg-white/5"
                                }
                            >
                                <Icon className="h-6 w-6" />
                                <span className="text-sm">{label}</span>
                            </a>
                        ))}
                    </nav>

                    <div className="mt-auto space-y-8">
                        <Button className="h-14 w-full gap-3 rounded-md bg-[#47e878] text-lg font-bold text-[#061009] hover:bg-[#62f18b]">
                            <Plus className="h-6 w-6" />
                            New Booking
                        </Button>
                        <div className="space-y-3">
                            <a href="#" className="flex items-center gap-4 px-5 py-2 font-bold uppercase text-[#d7e2d2]">
                                <HelpCircle className="h-6 w-6" />
                                <span className="text-sm">Support</span>
                            </a>
                            <a href="#" className="flex items-center gap-4 px-5 py-2 font-bold uppercase text-[#d7e2d2]">
                                <LogOut className="h-6 w-6" />
                                <span className="text-sm">Logout</span>
                            </a>
                        </div>
                    </div>
                </aside>

                <section className="bg-[radial-gradient(900px_520px_at_55%_20%,rgba(37,122,55,0.18),transparent_72%),#071009] px-4 py-6 sm:px-6 lg:px-14 lg:py-10">
                    <div className="mx-auto max-w-[1120px] space-y-8">
                        <section className="relative overflow-hidden rounded-xl border border-white/10 bg-[#101a12] px-6 py-8 shadow-2xl shadow-black/30 sm:px-10 lg:px-10">
                            <Image src="/marketing-1.png" alt="" fill priority className="object-cover opacity-20" />
                            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,16,9,0.95),rgba(7,16,9,0.76)),linear-gradient(180deg,transparent,rgba(7,16,9,0.82))]" />
                            <div className="relative">
                                <div className="mb-3 flex flex-wrap items-center gap-4">
                                    <span className="rounded-full bg-[#47e878] px-4 py-2 text-xs font-extrabold uppercase text-[#061009]">En curso</span>
                                    <span className="text-base text-[#dce6d8]">Liga Apertura 2025</span>
                                </div>
                                <h1 className="font-heading text-5xl font-extrabold leading-none sm:text-6xl lg:text-7xl">Mis Torneos</h1>
                                <div className="my-7 h-px bg-white/10" />
                                <dl className="grid max-w-md grid-cols-3 gap-5">
                                    <div>
                                        <dt className="mb-2 text-xs font-semibold uppercase text-[#cbd6c7]">Posicion</dt>
                                        <dd className="text-3xl font-extrabold text-[#47e878]">3°</dd>
                                    </div>
                                    <div>
                                        <dt className="mb-2 text-xs font-semibold uppercase text-[#cbd6c7]">Puntos</dt>
                                        <dd className="text-3xl font-extrabold">18</dd>
                                    </div>
                                    <div>
                                        <dt className="mb-2 text-xs font-semibold uppercase text-[#cbd6c7]">Progreso</dt>
                                        <dd className="text-3xl font-extrabold">F8 <span className="text-base font-medium">de 14</span></dd>
                                    </div>
                                </dl>
                            </div>
                        </section>

                        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_344px]">
                            <div className="space-y-8">
                                <section className="rounded-xl border-2 border-[#205d32] bg-[#101a12]/92 p-5 shadow-2xl shadow-black/20 sm:p-9">
                                    <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex items-center gap-3 text-sm font-extrabold uppercase text-[#47e878]">
                                            <Trophy className="h-6 w-6" />
                                            Proximo encuentro
                                        </div>
                                        <p className="text-[#edf5ea]">Viernes, 21:00 hs</p>
                                    </div>

                                    <div className="grid items-center gap-6 sm:grid-cols-[1fr_auto_1fr]">
                                        <div className="text-center">
                                            <div className="mx-auto mb-5 flex justify-center">
                                                <TeamMark />
                                            </div>
                                            <h2 className="font-heading text-2xl font-extrabold">Los Galacticos FC</h2>
                                            <p className="text-sm font-semibold uppercase text-[#dce6d8]">Local</p>
                                        </div>

                                        <div className="flex flex-col items-center gap-5">
                                            <span className="font-heading text-6xl font-black text-[#2d382d]">VS</span>
                                            <span className="rounded-full bg-[#3b493b] px-6 py-3 text-sm font-bold">Cancha Central</span>
                                        </div>

                                        <div className="text-center">
                                            <div className="mx-auto mb-5 flex justify-center">
                                                <TeamMark muted />
                                            </div>
                                            <h2 className="font-heading text-2xl font-extrabold">Atletico Norte</h2>
                                            <p className="text-sm font-semibold uppercase text-[#dce6d8]">Visitante</p>
                                        </div>
                                    </div>

                                    <Button className="mt-10 h-16 w-full gap-4 rounded-md bg-[#47e878] text-xl font-extrabold text-[#061009] shadow-lg shadow-[#47e878]/20 hover:bg-[#62f18b]">
                                        <Eye className="h-6 w-6" />
                                        Ver Partido
                                    </Button>
                                </section>

                                <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                                    {stats.map((stat) => (
                                        <article key={stat.label} className="rounded-xl border border-white/10 bg-[linear-gradient(90deg,rgba(255,255,255,0.035),rgba(71,232,120,0.04))] p-6">
                                            <p className="mb-10 text-xs font-extrabold uppercase text-[#cbd6c7]">{stat.label}</p>
                                            <p className="text-4xl font-black">
                                                {stat.value}
                                                {stat.meta && <span className="ml-2 text-sm font-semibold text-[#47e878]">{stat.meta}</span>}
                                            </p>
                                        </article>
                                    ))}
                                </section>

                                <section className="grid gap-8 lg:grid-cols-2">
                                    <div>
                                        <h2 className="mb-5 font-heading text-2xl font-extrabold">Proximas Fechas</h2>
                                        <div className="space-y-4">
                                            {fixtures.map((fixture) => (
                                                <article key={fixture.day} className="flex items-center gap-5 rounded-xl border border-white/10 bg-[linear-gradient(90deg,rgba(255,255,255,0.035),rgba(71,232,120,0.035))] p-4">
                                                    <div className="border-r border-white/10 pr-4 text-center">
                                                        <p className="text-xs font-bold text-[#cbd6c7]">{fixture.month}</p>
                                                        <p className="text-2xl font-black">{fixture.day}</p>
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <h3 className="truncate text-xl font-extrabold">{fixture.rival}</h3>
                                                        <p className="text-xs uppercase text-[#cbd6c7]">{fixture.detail}</p>
                                                    </div>
                                                    <ChevronRight className="h-5 w-5 text-[#384638]" />
                                                </article>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h2 className="mb-5 font-heading text-2xl font-extrabold">Resultados Recientes</h2>
                                        <div className="space-y-4">
                                            {results.map((result) => (
                                                <article
                                                    key={result.title}
                                                    className={
                                                        result.status === "win"
                                                            ? "flex items-center gap-5 rounded-xl border-2 border-[#47e878] bg-white/[0.03] p-4"
                                                            : "flex items-center gap-5 rounded-xl border border-[#dce6d8] bg-white/[0.03] p-4"
                                                    }
                                                >
                                                    <span className="rounded-md bg-[#18351f] px-3 py-1 text-2xl font-black text-[#47e878]">{result.score}</span>
                                                    <div className="min-w-0 flex-1">
                                                        <h3 className="truncate text-xl font-extrabold">{result.title}</h3>
                                                        <p className="text-xs uppercase text-[#cbd6c7]">{result.detail}</p>
                                                    </div>
                                                    {result.status === "win" ? (
                                                        <CheckCircle2 className="h-7 w-7 text-[#47e878]" />
                                                    ) : (
                                                        <CircleMinus className="h-7 w-7 text-[#dce6d8]" />
                                                    )}
                                                </article>
                                            ))}
                                        </div>
                                    </div>
                                </section>
                            </div>

                            <aside className="space-y-8">
                                <section className="overflow-hidden rounded-xl border border-white/10 bg-[#172117] shadow-2xl shadow-black/20">
                                    <h2 className="px-8 py-8 font-heading text-2xl font-extrabold">Tabla de Posiciones</h2>
                                    <div className="border-y border-white/5 bg-[#0f190f] px-7 py-4">
                                        <div className="grid grid-cols-[58px_1fr_42px] text-xs font-extrabold uppercase text-[#cbd6c7]">
                                            <span>Pos</span>
                                            <span>Equipo</span>
                                            <span className="text-right">Pts</span>
                                        </div>
                                    </div>
                                    <div className="py-4">
                                        {standings.map((row) => (
                                            <div
                                                key={row.team}
                                                className={
                                                    row.active
                                                        ? "mx-3 grid grid-cols-[58px_1fr_42px] items-center border border-[#1f7d3a] bg-[#14361c] px-4 py-4 font-extrabold text-[#47e878]"
                                                        : "mx-3 grid grid-cols-[58px_1fr_42px] items-center px-4 py-4 font-bold text-[#edf5ea]"
                                                }
                                            >
                                                <span>{row.pos}</span>
                                                <span>{row.team}</span>
                                                <span className="text-right">{row.pts}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <a href="#" className="block border-t border-white/5 bg-white/[0.02] px-8 py-7 text-center text-sm font-extrabold uppercase text-[#47e878]">
                                        Ver tabla completa
                                    </a>
                                </section>

                                <section className="rounded-xl border border-white/10 bg-[linear-gradient(135deg,rgba(71,232,120,0.09),rgba(255,255,255,0.025))] p-8 shadow-2xl shadow-black/20">
                                    <div className="mb-9 flex h-14 w-14 items-center justify-center rounded-lg bg-[#1e6730]">
                                        <Trophy className="h-8 w-8 text-[#47e878]" />
                                    </div>
                                    <h2 className="font-heading text-3xl font-extrabold leading-tight">¿Queres organizar tu propio torneo?</h2>
                                    <p className="mt-5 text-base leading-7 text-[#dce6d8]">
                                        Gestiona equipos, fixture, tablas y estadisticas con la plataforma lider para administradores de predios.
                                    </p>
                                    <Button variant="secondary" className="mt-8 h-16 w-full rounded-md bg-[#e7efe4] text-base font-extrabold uppercase text-[#061009] hover:bg-white">
                                        Crear torneo
                                    </Button>
                                </section>
                            </aside>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
