"use client";

import {
    CheckCircle2,
    ChevronRight,
    CircleMinus,
    Eye,
    Shield,
    Trophy,
} from "lucide-react";
import { Button } from "@/components/design-system";

// ── Shared data ───────────────────────────────────────────────────────────────

export const standings = [
    { pos: 1, team: "Fenix Dorado",      pts: 22 },
    { pos: 2, team: "Trueno FC",          pts: 20 },
    { pos: 3, team: "Los Galacticos FC",  pts: 18, active: true },
    { pos: 4, team: "Atletico Norte",     pts: 17 },
    { pos: 5, team: "Real Sportivo",      pts: 15 },
    { pos: 6, team: "Titan FC",           pts: 12 },
];

export const fixtures = [
    { month: "MAR", day: "28", rival: "vs Real Sportivo", detail: "Cancha 4 · 20:00 hs",    status: "upcoming" },
    { month: "ABR", day: "04", rival: "vs Titan FC",      detail: "Cancha Central · 22:30 hs", status: "upcoming" },
];

export const results = [
    { score: "3-1", title: "Victoria vs Leones",  detail: "Fecha 7 · Visitante", status: "win"  },
    { score: "2-2", title: "Empate vs Inter",      detail: "Fecha 6 · Local",     status: "draw" },
    { score: "0-1", title: "Derrota vs Fenix",     detail: "Fecha 5 · Visitante", status: "loss" },
];

// ── TeamBadge (shared visual) ─────────────────────────────────────────────────

export function TeamBadge({ muted = false }: { muted?: boolean }) {
    return (
        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[#24465a] bg-[#0b2637] shadow-inner sm:h-24 sm:w-24">
            <Shield
                className={muted ? "h-10 w-10 text-[#56d6ff]" : "h-11 w-11 text-[#1cff87]"}
                strokeWidth={2.2}
            />
        </div>
    );
}

// ── StandingsPanel (reusable) ─────────────────────────────────────────────────

export function StandingsPanel() {
    return (
        <section className="overflow-hidden rounded-2xl border border-[#1b3442] bg-[#071b28] shadow-xl shadow-black/30">
            <div className="border-b border-[#1b3442] px-6 py-5">
                <h2 className="text-sm font-black uppercase tracking-widest text-[#dbe8ef]">
                    Tabla de Posiciones
                </h2>
            </div>
            <div className="border-b border-[#1b3442] bg-[#0b2230]/60 px-6 py-3">
                <div className="grid grid-cols-[48px_1fr_36px] text-[10px] font-black uppercase tracking-widest text-[#577080]">
                    <span>Pos</span>
                    <span>Equipo</span>
                    <span className="text-right">Pts</span>
                </div>
            </div>
            <div className="py-2">
                {standings.map((row) => (
                    <div
                        key={row.team}
                        className={`mx-3 my-0.5 grid grid-cols-[48px_1fr_36px] items-center rounded-lg px-3 py-3 text-sm font-bold transition ${
                            row.active
                                ? "bg-[#0b2637] text-[#1cff87] ring-1 ring-[#1cff87]/20"
                                : "text-[#a6b8c4] hover:bg-[#0b2637]/50"
                        }`}
                    >
                        <span className={row.active ? "font-black" : ""}>{row.pos}</span>
                        <span className="truncate">{row.team}</span>
                        <span className="text-right font-black">{row.pts}</span>
                    </div>
                ))}
            </div>
            <a
                href="#"
                className="block border-t border-[#1b3442] px-6 py-4 text-center text-xs font-black uppercase tracking-widest text-[#1cff87] transition hover:bg-[#0b2637]"
            >
                Ver tabla completa
            </a>
        </section>
    );
}

// ── OverviewTab ───────────────────────────────────────────────────────────────

export function OverviewTab() {
    return (
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
            {/* Left */}
            <div className="space-y-8">
                {/* Next match */}
                <section className="overflow-hidden rounded-2xl border border-[#1b3442] bg-[#071b28] shadow-xl shadow-black/30">
                    <div className="flex items-center justify-between border-b border-[#1b3442] px-6 py-5">
                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#1cff87]">
                            <Trophy className="h-4 w-4" strokeWidth={1.8} />
                            Próximo encuentro
                        </div>
                        <span className="text-sm text-[#a6b8c4]">Viernes, 21:00 hs</span>
                    </div>
                    <div className="px-6 py-8">
                        <div className="grid items-center gap-6 sm:grid-cols-[1fr_auto_1fr]">
                            <div className="text-center">
                                <div className="mx-auto mb-4 flex justify-center"><TeamBadge /></div>
                                <h2 className="text-xl font-black text-white">Los Galacticos FC</h2>
                                <p className="mt-1 text-xs font-bold uppercase tracking-wider text-[#577080]">Local</p>
                            </div>
                            <div className="flex flex-col items-center gap-4">
                                <span className="font-heading text-5xl font-black text-[#1b3442]">VS</span>
                                <span className="rounded-xl border border-[#1b3442] bg-[#0b2637] px-5 py-2 text-xs font-bold uppercase tracking-wider text-[#70889a]">
                                    Cancha Central
                                </span>
                            </div>
                            <div className="text-center">
                                <div className="mx-auto mb-4 flex justify-center"><TeamBadge muted /></div>
                                <h2 className="text-xl font-black text-white">Atletico Norte</h2>
                                <p className="mt-1 text-xs font-bold uppercase tracking-wider text-[#577080]">Visitante</p>
                            </div>
                        </div>
                        <div className="mt-8">
                            <Button className="flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-[#1cff87] text-base font-black text-[#071b28] shadow-lg shadow-[#1cff87]/20 transition hover:bg-[#00e676] active:scale-[0.98]">
                                <Eye className="h-5 w-5" strokeWidth={2} />
                                Ver Partido
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Fixtures & Results */}
                <div className="grid gap-6 sm:grid-cols-2">
                    <section>
                        <h2 className="mb-4 text-sm font-black uppercase tracking-widest text-[#dbe8ef]">Próximas Fechas</h2>
                        <div className="space-y-3">
                            {fixtures.map((f) => (
                                <article key={f.day} className="flex items-center gap-4 rounded-xl border border-[#1b3442] bg-[#071b28] p-4 transition hover:border-[#2c5368] hover:bg-[#0b2637]">
                                    <div className="shrink-0 border-r border-[#1b3442] pr-4 text-center">
                                        <p className="text-[10px] font-bold uppercase text-[#577080]">{f.month}</p>
                                        <p className="text-2xl font-black text-white">{f.day}</p>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="truncate text-sm font-black text-white">{f.rival}</h3>
                                        <p className="mt-0.5 text-[10px] uppercase tracking-wide text-[#577080]">{f.detail}</p>
                                    </div>
                                    <ChevronRight className="h-4 w-4 shrink-0 text-[#1b3442]" />
                                </article>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h2 className="mb-4 text-sm font-black uppercase tracking-widest text-[#dbe8ef]">Resultados Recientes</h2>
                        <div className="space-y-3">
                            {results.map((r) => (
                                <article
                                    key={r.title}
                                    className={`flex items-center gap-4 rounded-xl border p-4 transition ${
                                        r.status === "win"
                                            ? "border-[#1cff87]/30 bg-[#071b28] hover:border-[#1cff87]/50"
                                            : r.status === "loss"
                                            ? "border-red-500/20 bg-[#071b28] hover:border-red-500/40"
                                            : "border-[#1b3442] bg-[#071b28] hover:border-[#2c5368]"
                                    }`}
                                >
                                    <span className={`shrink-0 rounded-lg px-3 py-1.5 text-xl font-black ${
                                        r.status === "win" ? "bg-[#0b2637] text-[#1cff87]"
                                        : r.status === "loss" ? "bg-red-950/60 text-red-400"
                                        : "bg-[#0b2637] text-[#56d6ff]"
                                    }`}>
                                        {r.score}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="truncate text-sm font-black text-white">{r.title}</h3>
                                        <p className="mt-0.5 text-[10px] uppercase tracking-wide text-[#577080]">{r.detail}</p>
                                    </div>
                                    {r.status === "win" ? (
                                        <CheckCircle2 className="h-5 w-5 shrink-0 text-[#1cff87]" />
                                    ) : r.status === "loss" ? (
                                        <CircleMinus className="h-5 w-5 shrink-0 text-red-400" />
                                    ) : (
                                        <CircleMinus className="h-5 w-5 shrink-0 text-[#56d6ff]" />
                                    )}
                                </article>
                            ))}
                        </div>
                    </section>
                </div>
            </div>

            {/* Right */}
            <div className="space-y-6">
                <StandingsPanel />
                {/* CTA */}
                <section className="relative overflow-hidden rounded-2xl border border-[#1b3442] bg-[#071b28] p-6 shadow-xl shadow-black/30">
                    <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#1cff87]/10 blur-2xl" />
                    <div className="relative">
                        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-[#24465a] bg-[#0b2637]">
                            <Trophy className="h-6 w-6 text-[#1cff87]" strokeWidth={1.8} />
                        </div>
                        <h2 className="text-xl font-black leading-tight text-white">¿Querés organizar tu propio torneo?</h2>
                        <p className="mt-3 text-sm leading-relaxed text-[#70889a]">
                            Gestioná equipos, fixture, tablas y estadísticas con la plataforma líder.
                        </p>
                        <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1cff87] py-3 text-sm font-black uppercase tracking-wide text-[#071b28] shadow-lg shadow-[#1cff87]/20 transition hover:bg-[#00e676] active:scale-[0.98]">
                            Crear torneo
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
}
