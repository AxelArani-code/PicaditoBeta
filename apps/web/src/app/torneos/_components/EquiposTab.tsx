"use client";

import { Crown, Shield, Star, Users } from "lucide-react";
import { StandingsPanel } from "./OverviewTab";

// ── Data ──────────────────────────────────────────────────────────────────────

const players = [
    { name: "Marcos Díaz",     number: 1,  role: "Arquero",    goals: 0,  assists: 0,  yellowCards: 1, captain: false },
    { name: "Lucas Pereyra",   number: 3,  role: "Defensor",   goals: 1,  assists: 2,  yellowCards: 2, captain: false },
    { name: "Rodrigo Sánchez", number: 5,  role: "Defensor",   goals: 0,  assists: 1,  yellowCards: 3, captain: false },
    { name: "Gabriel Torres",  number: 7,  role: "Mediocampista", goals: 4, assists: 5, yellowCards: 1, captain: true  },
    { name: "Nicolás Vera",    number: 10, role: "Mediocampista", goals: 6, assists: 8, yellowCards: 0, captain: false },
    { name: "Emilio Castro",   number: 11, role: "Delantero",  goals: 9,  assists: 3,  yellowCards: 1, captain: false },
    { name: "Facundo Ríos",    number: 9,  role: "Delantero",  goals: 7,  assists: 2,  yellowCards: 2, captain: false },
];

const ROLE_COLORS: Record<string, string> = {
    Arquero:       "border-amber-500/30 bg-amber-950/40 text-amber-400",
    Defensor:      "border-blue-500/30 bg-blue-950/40 text-blue-400",
    Mediocampista: "border-[#1cff87]/30 bg-[#1cff87]/5 text-[#1cff87]",
    Delantero:     "border-red-500/30 bg-red-950/40 text-red-400",
};

// ── Component ─────────────────────────────────────────────────────────────────

export function EquiposTab() {
    return (
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
            {/* Left: Squad */}
            <div className="space-y-6">
                {/* Team header */}
                <section className="flex items-center gap-5 rounded-2xl border border-[#1b3442] bg-[#071b28] p-6 shadow-xl shadow-black/30">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-[#24465a] bg-[#0b2637]">
                        <Shield className="h-9 w-9 text-[#1cff87]" strokeWidth={1.8} />
                    </div>
                    <div className="min-w-0">
                        <h2 className="text-2xl font-black text-white">Los Galacticos FC</h2>
                        <p className="mt-0.5 text-xs font-bold uppercase tracking-widest text-[#577080]">
                            Liga Apertura 2025 · 3° Posición
                        </p>
                    </div>
                    <div className="ml-auto flex shrink-0 items-center gap-2 rounded-xl border border-[#1b3442] bg-[#0b2637] px-4 py-2">
                        <Users className="h-4 w-4 text-[#1cff87]" strokeWidth={1.8} />
                        <span className="text-sm font-black text-white">{players.length}</span>
                        <span className="text-xs text-[#577080]">jugadores</span>
                    </div>
                </section>

                {/* Player cards */}
                <section>
                    <h3 className="mb-4 text-sm font-black uppercase tracking-widest text-[#dbe8ef]">Plantel</h3>
                    <div className="space-y-2">
                        {players.map((p) => (
                            <article
                                key={p.number}
                                className="group flex items-center gap-4 rounded-xl border border-[#1b3442] bg-[#071b28] p-4 transition hover:border-[#2c5368] hover:bg-[#0b2637]"
                            >
                                {/* Jersey number */}
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0a1118] text-lg font-black text-[#1cff87]">
                                    {p.number}
                                </div>

                                {/* Name + role */}
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="truncate text-sm font-black text-white">{p.name}</h4>
                                        {p.captain && (
                                            <Crown className="h-3.5 w-3.5 shrink-0 text-amber-400" strokeWidth={2} />
                                        )}
                                    </div>
                                    <span className={`mt-1 inline-block rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${ROLE_COLORS[p.role]}`}>
                                        {p.role}
                                    </span>
                                </div>

                                {/* Stats chips */}
                                <div className="hidden items-center gap-4 sm:flex">
                                    <div className="text-center">
                                        <p className="text-[10px] font-bold uppercase text-[#577080]">Goles</p>
                                        <p className="text-base font-black text-white">{p.goals}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-bold uppercase text-[#577080]">Asist.</p>
                                        <p className="text-base font-black text-white">{p.assists}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-bold uppercase text-[#577080]">TA</p>
                                        <div className="flex items-center justify-center gap-0.5">
                                            {Array.from({ length: Math.min(p.yellowCards, 3) }).map((_, i) => (
                                                <span key={i} className="inline-block h-3.5 w-2.5 rounded-sm bg-amber-400" />
                                            ))}
                                            {p.yellowCards === 0 && <span className="text-sm font-black text-[#577080]">—</span>}
                                        </div>
                                    </div>
                                </div>

                                <Star
                                    className="h-4 w-4 shrink-0 text-[#1b3442] transition group-hover:text-[#577080]"
                                    strokeWidth={1.5}
                                />
                            </article>
                        ))}
                    </div>
                </section>
            </div>

            {/* Right: Standings + top scorer */}
            <div className="space-y-6">
                <StandingsPanel />

                {/* Top scorer card */}
                <section className="rounded-2xl border border-[#1b3442] bg-[#071b28] p-6 shadow-xl shadow-black/30">
                    <h3 className="mb-4 text-sm font-black uppercase tracking-widest text-[#dbe8ef]">Goleadores</h3>
                    <div className="space-y-3">
                        {[...players]
                            .sort((a, b) => b.goals - a.goals)
                            .slice(0, 4)
                            .map((p, i) => (
                                <div key={p.name} className="flex items-center gap-3">
                                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-black ${i === 0 ? "bg-[#1cff87] text-[#071b28]" : "bg-[#0b2637] text-[#577080]"}`}>
                                        {i + 1}
                                    </span>
                                    <span className="min-w-0 flex-1 truncate text-sm font-bold text-[#a6b8c4]">{p.name}</span>
                                    <span className="text-sm font-black text-white">{p.goals} <span className="text-[#577080] font-normal">goles</span></span>
                                </div>
                            ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
