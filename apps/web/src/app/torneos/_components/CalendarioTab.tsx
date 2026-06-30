"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, MapPin, Clock } from "lucide-react";

// ── Types & data ──────────────────────────────────────────────────────────────

interface MatchEvent {
    day: number;
    month: number; // 0-indexed
    year: number;
    rival: string;
    venue: string;
    time: string;
    status: "upcoming" | "played" | "today";
    result?: string;
    resultStatus?: "win" | "draw" | "loss";
}

const MATCH_EVENTS: MatchEvent[] = [
    { day: 10, month: 5, year: 2025, rival: "Leones FC",     venue: "Cancha 2",       time: "20:00 hs", status: "played",   result: "3-1", resultStatus: "win"  },
    { day: 17, month: 5, year: 2025, rival: "Inter Palermo", venue: "Cancha Central", time: "21:30 hs", status: "played",   result: "2-2", resultStatus: "draw" },
    { day: 24, month: 5, year: 2025, rival: "Fenix Dorado",  venue: "Cancha 1",       time: "22:00 hs", status: "played",   result: "0-1", resultStatus: "loss" },
    { day: 28, month: 5, year: 2025, rival: "Real Sportivo", venue: "Cancha 4",       time: "20:00 hs", status: "upcoming"                                      },
    { day: 4,  month: 6, year: 2025, rival: "Titan FC",      venue: "Cancha Central", time: "22:30 hs", status: "upcoming"                                      },
    { day: 11, month: 6, year: 2025, rival: "Trueno FC",     venue: "Cancha 3",       time: "21:00 hs", status: "upcoming"                                      },
];

const MONTH_NAMES = [
    "Enero","Febrero","Marzo","Abril","Mayo","Junio",
    "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
];
const DOW_LABELS = ["Lu","Ma","Mi","Ju","Vi","Sa","Do"];

// ── Calendar helpers ──────────────────────────────────────────────────────────

function buildCalendarGrid(year: number, month: number) {
    const firstDow = new Date(year, month, 1).getDay(); // 0=Sun
    const offset   = firstDow === 0 ? 6 : firstDow - 1; // shift to Mon=0
    const daysInMonth  = new Date(year, month + 1, 0).getDate();
    const daysInPrev   = new Date(year, month, 0).getDate();
    const cells: { date: Date; current: boolean }[] = [];

    for (let i = 0; i < offset; i++) {
        cells.push({ date: new Date(year, month - 1, daysInPrev - offset + i + 1), current: false });
    }
    for (let d = 1; d <= daysInMonth; d++) {
        cells.push({ date: new Date(year, month, d), current: true });
    }
    while (cells.length % 7 !== 0) {
        cells.push({ date: new Date(year, month + 1, cells.length - daysInMonth - offset + 1), current: false });
    }
    return cells;
}

function sameDay(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

// ── Component ─────────────────────────────────────────────────────────────────

export function CalendarioTab() {
    const today = new Date();
    const [viewYear,  setViewYear]  = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());
    const [selected,  setSelected]  = useState<Date | null>(null);

    const cells = buildCalendarGrid(viewYear, viewMonth);

    const prevMonth = () => {
        if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11); }
        else setViewMonth((m) => m - 1);
    };
    const nextMonth = () => {
        if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0); }
        else setViewMonth((m) => m + 1);
    };

    const matchOnDay = (date: Date) =>
        MATCH_EVENTS.find((e) => sameDay(new Date(e.year, e.month, e.day), date));

    const selectedMatch = selected ? matchOnDay(selected) : null;

    // Upcoming matches for the list view
    const upcoming = MATCH_EVENTS
        .filter((e) => e.status === "upcoming")
        .sort((a, b) => new Date(a.year, a.month, a.day).getTime() - new Date(b.year, b.month, b.day).getTime());

    const played = MATCH_EVENTS
        .filter((e) => e.status === "played")
        .sort((a, b) => new Date(b.year, b.month, b.day).getTime() - new Date(a.year, a.month, a.day).getTime());

    return (
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
            {/* ── Left: calendar widget ───────────────────────────────── */}
            <div className="space-y-8">
                {/* Calendar */}
                <section className="overflow-hidden rounded-2xl border border-[#1b3442] bg-[#071b28] shadow-xl shadow-black/30">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-[#1b3442] px-6 py-5">
                        <h2 className="text-sm font-black uppercase tracking-widest text-[#dbe8ef]">
                            {MONTH_NAMES[viewMonth]} {viewYear}
                        </h2>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={prevMonth}
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#1b3442] bg-[#0b2637] text-[#70889a] transition hover:border-[#2c5368] hover:text-white"
                            >
                                <ChevronLeft className="h-4 w-4" strokeWidth={2} />
                            </button>
                            <button
                                onClick={nextMonth}
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#1b3442] bg-[#0b2637] text-[#70889a] transition hover:border-[#2c5368] hover:text-white"
                            >
                                <ChevronRight className="h-4 w-4" strokeWidth={2} />
                            </button>
                        </div>
                    </div>

                    {/* Day-of-week headers */}
                    <div className="grid grid-cols-7 border-b border-[#1b3442] bg-[#0b2230]/60 px-4 py-2">
                        {DOW_LABELS.map((d) => (
                            <span key={d} className="text-center text-[10px] font-black uppercase tracking-widest text-[#577080]">
                                {d}
                            </span>
                        ))}
                    </div>

                    {/* Day cells */}
                    <div className="grid grid-cols-7 gap-px bg-[#0d1b22] p-px">
                        {cells.map(({ date, current }, idx) => {
                            const match = matchOnDay(date);
                            const isToday = sameDay(date, today);
                            const isSelected = selected ? sameDay(date, selected) : false;

                            let dotColor = "";
                            if (match) {
                                if (match.resultStatus === "win")  dotColor = "bg-[#1cff87]";
                                else if (match.resultStatus === "draw") dotColor = "bg-[#56d6ff]";
                                else if (match.resultStatus === "loss") dotColor = "bg-red-400";
                                else dotColor = "bg-amber-400"; // upcoming
                            }

                            return (
                                <button
                                    key={idx}
                                    onClick={() => setSelected(current ? date : null)}
                                    className={`relative flex flex-col items-center justify-center py-2.5 text-sm font-bold transition ${
                                        !current ? "opacity-25" : ""
                                    } ${
                                        isSelected
                                            ? "bg-[#1cff87]/15 text-[#1cff87]"
                                            : isToday
                                            ? "bg-[#0b2637] text-white"
                                            : "bg-[#071b28] text-[#a6b8c4] hover:bg-[#0b2637] hover:text-white"
                                    }`}
                                >
                                    <span className={`flex h-7 w-7 items-center justify-center rounded-full ${
                                        isToday && !isSelected ? "ring-1 ring-[#1cff87]/40" : ""
                                    }`}>
                                        {date.getDate()}
                                    </span>
                                    {match && current && (
                                        <span className={`mt-0.5 h-1.5 w-1.5 rounded-full ${dotColor}`} />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Selected day detail */}
                    {selectedMatch && (
                        <div className="border-t border-[#1b3442] bg-[#0b2637] px-6 py-4">
                            <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-[#577080]">
                                {selected?.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })}
                            </p>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-black text-white">{selectedMatch.rival}</p>
                                    <div className="mt-1 flex items-center gap-3 text-xs text-[#70889a]">
                                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{selectedMatch.venue}</span>
                                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{selectedMatch.time}</span>
                                    </div>
                                </div>
                                {selectedMatch.result ? (
                                    <span className={`rounded-lg px-3 py-1.5 text-lg font-black ${
                                        selectedMatch.resultStatus === "win"  ? "bg-[#1cff87]/15 text-[#1cff87]"
                                        : selectedMatch.resultStatus === "loss" ? "bg-red-950/60 text-red-400"
                                        : "bg-[#0a1118] text-[#56d6ff]"
                                    }`}>
                                        {selectedMatch.result}
                                    </span>
                                ) : (
                                    <span className="rounded-lg border border-amber-500/30 bg-amber-950/40 px-3 py-1.5 text-xs font-black uppercase text-amber-400">
                                        Pendiente
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </section>

                {/* Played matches */}
                <section>
                    <h3 className="mb-4 text-sm font-black uppercase tracking-widest text-[#dbe8ef]">Partidos Jugados</h3>
                    <div className="space-y-3">
                        {played.map((m) => (
                            <article key={`${m.day}-${m.month}`} className={`flex items-center gap-4 rounded-xl border p-4 transition ${
                                m.resultStatus === "win"  ? "border-[#1cff87]/30 bg-[#071b28] hover:border-[#1cff87]/50"
                                : m.resultStatus === "loss" ? "border-red-500/20 bg-[#071b28] hover:border-red-500/40"
                                : "border-[#1b3442] bg-[#071b28] hover:border-[#2c5368]"
                            }`}>
                                <div className="shrink-0 border-r border-[#1b3442] pr-4 text-center">
                                    <p className="text-[10px] font-bold uppercase text-[#577080]">{MONTH_NAMES[m.month].slice(0,3).toUpperCase()}</p>
                                    <p className="text-2xl font-black text-white">{String(m.day).padStart(2, "0")}</p>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h4 className="truncate text-sm font-black text-white">{m.rival}</h4>
                                    <p className="mt-0.5 text-[10px] uppercase tracking-wide text-[#577080]">{m.venue} · {m.time}</p>
                                </div>
                                <span className={`shrink-0 rounded-lg px-3 py-1.5 text-base font-black ${
                                    m.resultStatus === "win"  ? "bg-[#0b2637] text-[#1cff87]"
                                    : m.resultStatus === "loss" ? "bg-red-950/60 text-red-400"
                                    : "bg-[#0b2637] text-[#56d6ff]"
                                }`}>
                                    {m.result}
                                </span>
                            </article>
                        ))}
                    </div>
                </section>
            </div>

            {/* ── Right: upcoming list ─────────────────────────────────── */}
            <div className="space-y-6">
                <section className="overflow-hidden rounded-2xl border border-[#1b3442] bg-[#071b28] shadow-xl shadow-black/30">
                    <div className="border-b border-[#1b3442] px-6 py-5">
                        <h3 className="text-sm font-black uppercase tracking-widest text-[#dbe8ef]">Próximos Partidos</h3>
                    </div>
                    <div className="divide-y divide-[#1b3442]">
                        {upcoming.map((m) => (
                            <div key={`${m.day}-${m.month}`} className="px-6 py-5 transition hover:bg-[#0b2637]">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-black text-white">{m.rival}</p>
                                        <div className="mt-1.5 flex flex-col gap-1 text-xs text-[#70889a]">
                                            <span className="flex items-center gap-1.5">
                                                <MapPin className="h-3 w-3 text-[#1cff87]" strokeWidth={1.8} />
                                                {m.venue}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <Clock className="h-3 w-3 text-[#1cff87]" strokeWidth={1.8} />
                                                {MONTH_NAMES[m.month].slice(0, 3)} {m.day} · {m.time}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="shrink-0 rounded-full border border-amber-500/30 bg-amber-950/30 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-400">
                                        Pendiente
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Legend */}
                <section className="rounded-2xl border border-[#1b3442] bg-[#071b28] p-5 shadow-xl shadow-black/30">
                    <h3 className="mb-3 text-xs font-black uppercase tracking-widest text-[#577080]">Leyenda</h3>
                    <div className="space-y-2">
                        {[
                            { dot: "bg-[#1cff87]",  label: "Victoria" },
                            { dot: "bg-[#56d6ff]",  label: "Empate"   },
                            { dot: "bg-red-400",     label: "Derrota"  },
                            { dot: "bg-amber-400",   label: "Pendiente" },
                        ].map(({ dot, label }) => (
                            <div key={label} className="flex items-center gap-2.5">
                                <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
                                <span className="text-xs text-[#a6b8c4]">{label}</span>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
