"use client";

import { TrendingUp, TrendingDown, Minus, Target, Shield as ShieldIcon, Zap } from "lucide-react";
import { StandingsPanel } from "./OverviewTab";

// ── Data ──────────────────────────────────────────────────────────────────────

const record = { wins: 5, draws: 2, losses: 1, total: 8 };

const FORM: ("win" | "draw" | "loss")[] = ["win", "win", "loss", "draw", "win"];

const attackStats = [
    { label: "Goles anotados",   value: 18, max: 30, color: "#1cff87"  },
    { label: "Goles en contra",  value: 7,  max: 30, color: "#f87171"  },
    { label: "Tiros al arco",    value: 42, max: 60, color: "#56d6ff"  },
    { label: "Córners ejecutados", value: 23, max: 40, color: "#facc15" },
];

const topScorers = [
    { name: "Emilio Castro",   goals: 9, assists: 3, color: "#1cff87" },
    { name: "Facundo Ríos",    goals: 7, assists: 2, color: "#56d6ff" },
    { name: "Nicolás Vera",    goals: 6, assists: 8, color: "#facc15" },
    { name: "Gabriel Torres",  goals: 4, assists: 5, color: "#f87171" },
];

const matchHistory = [
    { round: "F8", rival: "Leones FC",    result: "3-1", status: "win",  scored: 3, conceded: 1 },
    { round: "F7", rival: "Inter Palermo",result: "2-2", status: "draw", scored: 2, conceded: 2 },
    { round: "F6", rival: "Fenix Dorado", result: "0-1", status: "loss", scored: 0, conceded: 1 },
    { round: "F5", rival: "Titan FC",     result: "2-0", status: "win",  scored: 2, conceded: 0 },
    { round: "F4", rival: "Trueno FC",    result: "4-2", status: "win",  scored: 4, conceded: 2 },
    { round: "F3", rival: "Real Sportivo",result: "1-1", status: "draw", scored: 1, conceded: 1 },
    { round: "F2", rival: "Atletico Norte",result:"3-0", status: "win",  scored: 3, conceded: 0 },
    { round: "F1", rival: "Fenix Dorado", result: "2-0", status: "win",  scored: 2, conceded: 0 },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function pct(value: number, total: number) {
    return Math.round((value / total) * 100);
}

// ── Component ─────────────────────────────────────────────────────────────────

export function EstadisticasTab() {
    const winPct  = pct(record.wins,   record.total);
    const drawPct = pct(record.draws,  record.total);
    const lossPct = pct(record.losses, record.total);

    return (
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
            {/* ── Left column ─────────────────────────────────────────── */}
            <div className="space-y-8">
                {/* W/D/L donut-style card */}
                <section className="overflow-hidden rounded-2xl border border-[#1b3442] bg-[#071b28] shadow-xl shadow-black/30">
                    <div className="border-b border-[#1b3442] px-6 py-5">
                        <h2 className="text-sm font-black uppercase tracking-widest text-[#dbe8ef]">Rendimiento General</h2>
                    </div>
                    <div className="px-6 py-7">
                        {/* Summary chips */}
                        <div className="mb-7 grid grid-cols-3 gap-3 text-center">
                            {[
                                { label: "Victorias", value: record.wins,   color: "text-[#1cff87]", bg: "bg-[#1cff87]/10 border-[#1cff87]/20" },
                                { label: "Empates",   value: record.draws,  color: "text-[#56d6ff]", bg: "bg-[#56d6ff]/10 border-[#56d6ff]/20" },
                                { label: "Derrotas",  value: record.losses, color: "text-red-400",    bg: "bg-red-950/40 border-red-500/20"      },
                            ].map(({ label, value, color, bg }) => (
                                <div key={label} className={`rounded-xl border p-4 ${bg}`}>
                                    <p className={`text-3xl font-black ${color}`}>{value}</p>
                                    <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-[#577080]">{label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Stacked bar */}
                        <div className="mb-3 flex h-4 overflow-hidden rounded-full bg-[#0a1118]">
                            <div className="bg-[#1cff87] transition-all duration-700" style={{ width: `${winPct}%` }} />
                            <div className="bg-[#56d6ff] transition-all duration-700" style={{ width: `${drawPct}%` }} />
                            <div className="bg-red-400 transition-all duration-700" style={{ width: `${lossPct}%` }} />
                        </div>
                        <div className="flex justify-between text-[10px] font-bold uppercase text-[#577080]">
                            <span>{winPct}% victorias</span>
                            <span className="text-[#56d6ff]">{drawPct}% empates</span>
                            <span className="text-red-400">{lossPct}% derrotas</span>
                        </div>

                        {/* Form strip */}
                        <div className="mt-6">
                            <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-[#577080]">Últimas 5 fechas</p>
                            <div className="flex gap-2">
                                {FORM.map((f, i) => (
                                    <div
                                        key={i}
                                        className={`flex h-9 w-9 items-center justify-center rounded-lg text-xs font-black ${
                                            f === "win"  ? "bg-[#1cff87] text-[#071b28]"
                                            : f === "draw" ? "bg-[#0b2637] text-[#56d6ff] ring-1 ring-[#56d6ff]/30"
                                            : "bg-red-950/50 text-red-400 ring-1 ring-red-500/20"
                                        }`}
                                        title={f === "win" ? "Victoria" : f === "draw" ? "Empate" : "Derrota"}
                                    >
                                        {f === "win" ? "V" : f === "draw" ? "E" : "D"}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Attack / Defense stats with progress bars */}
                <section className="overflow-hidden rounded-2xl border border-[#1b3442] bg-[#071b28] shadow-xl shadow-black/30">
                    <div className="border-b border-[#1b3442] px-6 py-5">
                        <h2 className="text-sm font-black uppercase tracking-widest text-[#dbe8ef]">Estadísticas de Juego</h2>
                    </div>
                    <div className="space-y-5 px-6 py-6">
                        {attackStats.map((s) => (
                            <div key={s.label}>
                                <div className="mb-1.5 flex items-center justify-between">
                                    <span className="text-xs font-bold text-[#a6b8c4]">{s.label}</span>
                                    <span className="text-sm font-black text-white">{s.value}</span>
                                </div>
                                <div className="h-2.5 overflow-hidden rounded-full bg-[#0a1118]">
                                    <div
                                        className="h-full rounded-full transition-all duration-700"
                                        style={{ width: `${pct(s.value, s.max)}%`, backgroundColor: s.color }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Match-by-match history bar chart */}
                <section className="overflow-hidden rounded-2xl border border-[#1b3442] bg-[#071b28] shadow-xl shadow-black/30">
                    <div className="border-b border-[#1b3442] px-6 py-5">
                        <h2 className="text-sm font-black uppercase tracking-widest text-[#dbe8ef]">Historial por Fecha</h2>
                    </div>
                    <div className="px-6 py-6">
                        {/* Bar chart */}
                        <div className="mb-6 flex items-end gap-2">
                            {matchHistory.map((m) => {
                                const maxGoals = 5;
                                const scoredH  = Math.round((m.scored   / maxGoals) * 80);
                                const concH    = Math.round((m.conceded / maxGoals) * 80);
                                return (
                                    <div key={m.round} className="group flex flex-1 flex-col items-center gap-1.5">
                                        <div className="flex w-full items-end justify-center gap-0.5" style={{ height: 80 }}>
                                            <div
                                                className="w-[45%] rounded-t-sm bg-[#1cff87] transition-all duration-500 group-hover:opacity-80"
                                                style={{ height: `${scoredH}px` }}
                                                title={`Goles: ${m.scored}`}
                                            />
                                            <div
                                                className="w-[45%] rounded-t-sm bg-red-400/60 transition-all duration-500 group-hover:opacity-80"
                                                style={{ height: `${concH}px` }}
                                                title={`Goles en contra: ${m.conceded}`}
                                            />
                                        </div>
                                        <span className={`text-[9px] font-black ${
                                            m.status === "win" ? "text-[#1cff87]"
                                            : m.status === "draw" ? "text-[#56d6ff]"
                                            : "text-red-400"
                                        }`}>{m.round}</span>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex items-center gap-6 text-xs text-[#577080]">
                            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[#1cff87]" />Goles a favor</span>
                            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-red-400/60" />Goles en contra</span>
                        </div>
                    </div>

                    {/* Row detail */}
                    <div className="border-t border-[#1b3442]">
                        {matchHistory.slice(0, 4).map((m) => (
                            <div key={m.round} className={`flex items-center gap-4 border-b border-[#1b3442] px-6 py-3.5 transition last:border-0 hover:bg-[#0b2637]`}>
                                <span className="w-8 text-[10px] font-black uppercase text-[#577080]">{m.round}</span>
                                <span className="min-w-0 flex-1 truncate text-sm text-[#a6b8c4]">{m.rival}</span>
                                <span className={`rounded-lg px-2.5 py-1 text-sm font-black ${
                                    m.status === "win" ? "bg-[#0b2637] text-[#1cff87]"
                                    : m.status === "draw" ? "bg-[#0b2637] text-[#56d6ff]"
                                    : "bg-red-950/50 text-red-400"
                                }`}>{m.result}</span>
                                {m.status === "win"  && <TrendingUp   className="h-4 w-4 shrink-0 text-[#1cff87]" strokeWidth={2} />}
                                {m.status === "draw" && <Minus         className="h-4 w-4 shrink-0 text-[#56d6ff]" strokeWidth={2} />}
                                {m.status === "loss" && <TrendingDown  className="h-4 w-4 shrink-0 text-red-400"   strokeWidth={2} />}
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* ── Right column ──────────────────────────────────────────── */}
            <div className="space-y-6">
                {/* Top scorers */}
                <section className="overflow-hidden rounded-2xl border border-[#1b3442] bg-[#071b28] shadow-xl shadow-black/30">
                    <div className="border-b border-[#1b3442] px-6 py-5">
                        <h3 className="text-sm font-black uppercase tracking-widest text-[#dbe8ef]">Goleadores</h3>
                    </div>
                    <div className="divide-y divide-[#1b3442]">
                        {topScorers.map((p, i) => (
                            <div key={p.name} className="flex items-center gap-4 px-6 py-4 transition hover:bg-[#0b2637]">
                                <span
                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-black"
                                    style={{ backgroundColor: `${p.color}20`, color: p.color }}
                                >
                                    {i + 1}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-black text-white">{p.name}</p>
                                    <p className="text-[10px] text-[#577080]">{p.assists} asistencias</p>
                                </div>
                                <div className="flex items-center gap-1" style={{ color: p.color }}>
                                    <Target className="h-3.5 w-3.5" strokeWidth={2} />
                                    <span className="text-lg font-black">{p.goals}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Key numbers */}
                <section className="rounded-2xl border border-[#1b3442] bg-[#071b28] p-6 shadow-xl shadow-black/30">
                    <h3 className="mb-4 text-sm font-black uppercase tracking-widest text-[#dbe8ef]">Números Clave</h3>
                    <div className="space-y-4">
                        {[
                            { label: "Promedio goles/partido", value: "2.25", icon: Zap,         color: "#1cff87" },
                            { label: "Valla invicta (partidos)",value: "3",    icon: ShieldIcon,  color: "#56d6ff" },
                            { label: "Racha ganadora actual",  value: "2",    icon: TrendingUp,  color: "#facc15" },
                        ].map(({ label, value, icon: Icon, color }) => (
                            <div key={label} className="flex items-center gap-4 rounded-xl border border-[#1b3442] bg-[#0b2637]/60 p-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}15` }}>
                                    <Icon className="h-5 w-5" style={{ color }} strokeWidth={1.8} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#577080]">{label}</p>
                                    <p className="text-2xl font-black text-white">{value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <StandingsPanel />
            </div>
        </div>
    );
}
