"use client";

import { ChevronRight, Plus, Trophy, Users, Calendar, CheckCircle2, Clock } from "lucide-react";

// ── Types & Data ──────────────────────────────────────────────────────────────

type TournamentStatus = "active" | "upcoming" | "finished";

interface Tournament {
    id: string;
    name: string;
    organizer: string;
    status: TournamentStatus;
    teams: number;
    myTeam: string;
    position?: number;
    points?: number;
    startDate: string;
    endDate?: string;
    matchesPlayed: number;
    totalMatches: number;
    nextMatch?: string;
}

const TOURNAMENTS: Tournament[] = [
    {
        id: "1",
        name:          "Liga Apertura 2025",
        organizer:     "Complejo Central",
        status:        "active",
        teams:         8,
        myTeam:        "Los Galacticos FC",
        position:      3,
        points:        18,
        startDate:     "Mar 2025",
        matchesPlayed: 8,
        totalMatches:  14,
        nextMatch:     "vs Real Sportivo — Mar 28, 20:00 hs",
    },
    {
        id: "2",
        name:          "Copa Invierno 2025",
        organizer:     "Predio Norte",
        status:        "upcoming",
        teams:         6,
        myTeam:        "Los Galacticos FC",
        startDate:     "Jul 2025",
        matchesPlayed: 0,
        totalMatches:  10,
    },
    {
        id: "3",
        name:          "Torneo Clausura 2024",
        organizer:     "Complejo Sur",
        status:        "finished",
        teams:         10,
        myTeam:        "Los Galacticos FC",
        position:      1,
        points:        28,
        startDate:     "Sep 2024",
        endDate:       "Dic 2024",
        matchesPlayed: 9,
        totalMatches:  9,
    },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<TournamentStatus, { label: string; cls: string }> = {
    active:   { label: "En curso",   cls: "bg-[#1cff87] text-[#071b28]"                        },
    upcoming: { label: "Próximo",    cls: "border border-amber-500/40 bg-amber-950/40 text-amber-400" },
    finished: { label: "Finalizado", cls: "border border-[#1b3442] bg-[#0a1118] text-[#577080]" },
};

function ProgressBar({ value, max }: { value: number; max: number }) {
    const pct = Math.round((value / max) * 100);
    return (
        <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-[#0a1118]">
                <div
                    className="h-full rounded-full bg-[#1cff87] transition-all duration-700"
                    style={{ width: `${pct}%` }}
                />
            </div>
            <span className="shrink-0 text-[10px] font-bold text-[#577080]">{value}/{max} fechas</span>
        </div>
    );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function TorneosTab() {
    return (
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_300px]">
            {/* ── Left: tournament list ────────────────────────────────── */}
            <div className="space-y-5">
                {TOURNAMENTS.map((t) => {
                    const cfg = STATUS_CONFIG[t.status];
                    return (
                        <article
                            key={t.id}
                            className={`group relative overflow-hidden rounded-2xl border transition hover:border-[#2c5368] ${
                                t.status === "active"
                                    ? "border-[#1cff87]/20 bg-[#071b28] shadow-lg shadow-[#1cff87]/5"
                                    : t.status === "finished"
                                    ? "border-[#1b3442] bg-[#071b28]"
                                    : "border-amber-500/15 bg-[#071b28]"
                            }`}
                        >
                            {/* Subtle ambient glow for active */}
                            {t.status === "active" && (
                                <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-[#1cff87]/8 blur-2xl" />
                            )}

                            <div className="relative p-6">
                                {/* Header row */}
                                <div className="mb-4 flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${
                                            t.status === "active"   ? "border-[#1cff87]/30 bg-[#0b2637]"
                                            : t.status === "finished" ? "border-[#1b3442] bg-[#0a1118]"
                                            : "border-amber-500/20 bg-amber-950/30"
                                        }`}>
                                            <Trophy className={`h-6 w-6 ${
                                                t.status === "active" ? "text-[#1cff87]"
                                                : t.status === "finished" ? "text-[#577080]"
                                                : "text-amber-400"
                                            }`} strokeWidth={1.8} />
                                        </div>
                                        <div>
                                            <h2 className="text-base font-black text-white">{t.name}</h2>
                                            <p className="mt-0.5 text-xs text-[#577080]">{t.organizer}</p>
                                        </div>
                                    </div>
                                    <span className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${cfg.cls}`}>
                                        {cfg.label}
                                    </span>
                                </div>

                                {/* Meta grid */}
                                <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                                    {t.position != null && (
                                        <div className="rounded-xl border border-[#1b3442] bg-[#0b2637]/60 p-3 text-center">
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-[#577080]">Posición</p>
                                            <p className="mt-1 text-2xl font-black text-[#1cff87]">{t.position}°</p>
                                        </div>
                                    )}
                                    {t.points != null && (
                                        <div className="rounded-xl border border-[#1b3442] bg-[#0b2637]/60 p-3 text-center">
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-[#577080]">Puntos</p>
                                            <p className="mt-1 text-2xl font-black text-white">{t.points}</p>
                                        </div>
                                    )}
                                    <div className="rounded-xl border border-[#1b3442] bg-[#0b2637]/60 p-3 text-center">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#577080]">Equipos</p>
                                        <p className="mt-1 text-2xl font-black text-white">{t.teams}</p>
                                    </div>
                                    <div className="rounded-xl border border-[#1b3442] bg-[#0b2637]/60 p-3 text-center">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#577080]">Inicio</p>
                                        <p className="mt-1 text-sm font-black text-white">{t.startDate}</p>
                                    </div>
                                </div>

                                {/* Progress */}
                                <ProgressBar value={t.matchesPlayed} max={t.totalMatches} />

                                {/* Extra info */}
                                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                                    <div className="flex items-center gap-4 text-xs text-[#70889a]">
                                        <span className="flex items-center gap-1.5">
                                            <Users className="h-3.5 w-3.5 text-[#1cff87]" strokeWidth={1.8} />
                                            {t.myTeam}
                                        </span>
                                        {t.nextMatch && (
                                            <span className="flex items-center gap-1.5">
                                                <Clock className="h-3.5 w-3.5 text-amber-400" strokeWidth={1.8} />
                                                {t.nextMatch}
                                            </span>
                                        )}
                                        {t.status === "finished" && t.endDate && (
                                            <span className="flex items-center gap-1.5">
                                                <CheckCircle2 className="h-3.5 w-3.5 text-[#577080]" strokeWidth={1.8} />
                                                Finalizado {t.endDate}
                                            </span>
                                        )}
                                    </div>
                                    <button className="flex items-center gap-1 text-xs font-black uppercase tracking-wider text-[#1cff87] transition hover:underline">
                                        Ver detalles <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.5} />
                                    </button>
                                </div>
                            </div>
                        </article>
                    );
                })}
            </div>

            {/* ── Right: actions & summary ─────────────────────────────── */}
            <div className="space-y-6">
                {/* Create tournament CTA */}
                <section className="relative overflow-hidden rounded-2xl border border-[#1cff87]/20 bg-[#071b28] p-6 shadow-xl shadow-black/30">
                    <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#1cff87]/10 blur-2xl" />
                    <div className="relative">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-[#24465a] bg-[#0b2637]">
                            <Trophy className="h-6 w-6 text-[#1cff87]" strokeWidth={1.8} />
                        </div>
                        <h3 className="text-lg font-black leading-tight text-white">
                            ¿Querés crear un torneo?
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-[#70889a]">
                            Armá tu propio torneo, invitá equipos y gestioná todo desde acá.
                        </p>
                        <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1cff87] py-3 text-sm font-black uppercase tracking-wide text-[#071b28] shadow-lg shadow-[#1cff87]/20 transition hover:bg-[#00e676] active:scale-[0.98]">
                            <Plus className="h-4 w-4" strokeWidth={2.5} />
                            Crear torneo
                        </button>
                    </div>
                </section>

                {/* Join tournament CTA */}
                <section className="overflow-hidden rounded-2xl border border-[#1b3442] bg-[#071b28] p-6 shadow-xl shadow-black/30">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-[#24465a] bg-[#0b2637]">
                        <Calendar className="h-6 w-6 text-[#56d6ff]" strokeWidth={1.8} />
                    </div>
                    <h3 className="text-lg font-black leading-tight text-white">
                        Unirse a un torneo
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#70889a]">
                        Explorá torneos disponibles en tu zona e inscribí tu equipo.
                    </p>
                    <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-[#56d6ff]/30 bg-[#0b2637] py-3 text-sm font-black uppercase tracking-wide text-[#56d6ff] transition hover:bg-[#56d6ff]/10 active:scale-[0.98]">
                        Explorar torneos
                    </button>
                </section>

                {/* Quick summary */}
                <section className="rounded-2xl border border-[#1b3442] bg-[#071b28] p-6 shadow-xl shadow-black/30">
                    <h3 className="mb-4 text-sm font-black uppercase tracking-widest text-[#dbe8ef]">Resumen</h3>
                    <div className="space-y-3">
                        {[
                            { label: "En curso",   count: TOURNAMENTS.filter((t) => t.status === "active").length,   color: "text-[#1cff87]" },
                            { label: "Próximos",   count: TOURNAMENTS.filter((t) => t.status === "upcoming").length,  color: "text-amber-400" },
                            { label: "Finalizados",count: TOURNAMENTS.filter((t) => t.status === "finished").length, color: "text-[#577080]" },
                        ].map(({ label, count, color }) => (
                            <div key={label} className="flex items-center justify-between rounded-xl border border-[#1b3442] px-4 py-3">
                                <span className="text-sm text-[#a6b8c4]">{label}</span>
                                <span className={`text-xl font-black ${color}`}>{count}</span>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
