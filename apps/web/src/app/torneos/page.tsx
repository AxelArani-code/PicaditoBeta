"use client";

import { useState } from "react";
import { BarChart3, CalendarDays, Grid2X2, Trophy, Users } from "lucide-react";
import { PublicShell } from "@/app/inicio/_components/PublicShell";
import { OverviewTab }      from "./_components/OverviewTab";
import { EquiposTab }       from "./_components/EquiposTab";
import { CalendarioTab }    from "./_components/CalendarioTab";
import { EstadisticasTab }  from "./_components/EstadisticasTab";
import { TorneosTab }       from "./_components/TorneosTab";

// ── Tab config ────────────────────────────────────────────────────────────────

type TabId = "overview" | "equipos" | "calendario" | "estadisticas" | "torneos";

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: "overview",      label: "Overview",      icon: Grid2X2     },
    { id: "equipos",       label: "Equipos",       icon: Users       },
    { id: "calendario",    label: "Calendario",    icon: CalendarDays },
    { id: "estadisticas",  label: "Estadisticas",  icon: BarChart3   },
    { id: "torneos",       label: "Torneos",       icon: Trophy      },
];

// ── Quick-stat strip (always visible in hero) ─────────────────────────────────

const HERO_STATS = [
    { label: "Posicion",  value: "3°",  meta: "+1"    },
    { label: "Puntos",    value: "18"               },
    { label: "Jugados",   value: "8",   meta: "/ 14" },
    { label: "Dif. gol",  value: "+12"              },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TorneosPage() {
    const [activeTab, setActiveTab] = useState<TabId>("overview");

    return (
        <PublicShell>
            <div className="min-h-full bg-[#0a1118] text-[#dbe8ef]">

                {/* ── Hero Banner ───────────────────────────────────────── */}
                <div className="relative overflow-hidden border-b border-[#1b3442] bg-[#071b28] px-4 py-8 sm:px-8 lg:px-14 lg:py-12">
                    <div className="pointer-events-none absolute -top-24 left-1/3 h-72 w-72 rounded-full bg-[#1cff87]/10 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-12 right-1/4 h-56 w-56 rounded-full bg-[#22d3ee]/8 blur-3xl" />

                    <div className="relative mx-auto max-w-5xl">
                        <div className="mb-4 flex flex-wrap items-center gap-3">
                            <span className="rounded-full bg-[#1cff87] px-4 py-1 text-xs font-black uppercase tracking-widest text-[#071b28]">
                                En curso
                            </span>
                            <span className="text-sm text-[#70889a]">Liga Apertura 2025</span>
                        </div>

                        <h1 className="font-heading text-4xl font-black leading-none text-white sm:text-5xl lg:text-6xl">
                            Mis Torneos
                        </h1>

                        <div className="my-6 h-px bg-[#1b3442]" />

                        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
                            {HERO_STATS.map((stat) => (
                                <div key={stat.label} className="rounded-xl border border-[#1b3442] bg-[#0b2637]/60 p-4">
                                    <dt className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#577080]">
                                        {stat.label}
                                    </dt>
                                    <dd className="text-3xl font-black text-white">
                                        {stat.value}
                                        {stat.meta && (
                                            <span className="ml-1.5 text-sm font-semibold text-[#1cff87]">
                                                {stat.meta}
                                            </span>
                                        )}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                </div>

                {/* ── Main content ──────────────────────────────────────── */}
                <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8 lg:px-14">

                    {/* Tab bar */}
                    <div className="mb-8 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Secciones de torneos">
                        {TABS.map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                role="tab"
                                id={`tab-${id}`}
                                aria-selected={activeTab === id}
                                aria-controls={`panel-${id}`}
                                onClick={() => setActiveTab(id)}
                                className={`flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold uppercase tracking-wide transition-all ${
                                    activeTab === id
                                        ? "border-[#1cff87]/30 bg-[#0b2637] text-[#1cff87] shadow-sm shadow-[#1cff87]/10"
                                        : "border-[#1b3442] bg-[#071b28] text-[#70889a] hover:border-[#2c5368] hover:text-[#dbe8ef]"
                                }`}
                            >
                                <Icon className="h-4 w-4" strokeWidth={1.7} />
                                <span>{label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Tab panels */}
                    <div
                        id={`panel-${activeTab}`}
                        role="tabpanel"
                        aria-labelledby={`tab-${activeTab}`}
                    >
                        {activeTab === "overview"     && <OverviewTab />}
                        {activeTab === "equipos"      && <EquiposTab />}
                        {activeTab === "calendario"   && <CalendarioTab />}
                        {activeTab === "estadisticas" && <EstadisticasTab />}
                        {activeTab === "torneos"      && <TorneosTab />}
                    </div>
                </div>

                {/* ── Footer ─────────────────────────────────────────────── */}
                <footer className="mt-4 border-t border-[#1b3442] bg-[#071b28] px-8 py-8">
                    <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 md:flex-row">
                        <div className="flex flex-col items-center gap-1 md:items-start">
                            <span className="text-sm font-black text-white">Picadito</span>
                            <p className="text-xs uppercase tracking-widest text-[#1cff87]">
                                © 2024 Picadito by TriaSoft. All rights reserved.
                            </p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-6">
                            {["Privacy", "Terms", "Support"].map((link) => (
                                <a
                                    key={link}
                                    href="#"
                                    className="text-xs font-black uppercase tracking-wider text-[#1cff87] transition hover:text-[#22d3ee]"
                                >
                                    {link}
                                </a>
                            ))}
                        </div>
                    </div>
                </footer>
            </div>
        </PublicShell>
    );
}
