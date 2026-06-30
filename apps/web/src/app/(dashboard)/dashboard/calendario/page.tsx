"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useDashboardBookings } from "@/hooks/useDashboardBookings";
import { LoadingSpinner } from "@/components/dashboard/LoadingSpinner";
import { ErrorBanner } from "@/components/dashboard/ErrorBanner";

// ─── Types ────────────────────────────────────────────────────────────────────

type BookingStatus = "ok" | "a-confirmar";
type CalendarBooking = {
  time: string;
  venue: string;
  client: string;
  status: BookingStatus;
  id: string;
};
type ByDay = Record<number, CalendarBooking[]>;

const WEEK_HEADERS = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];
const TODAY = new Date().getDate();
const CURRENT_MONTH = new Date().toLocaleDateString("es-AR", { month: "long", year: "numeric" });

// Build June 2026 grid (starts on Monday)
const JUNE_DAYS: (number | null)[] = [
  1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,
  21,22,23,24,25,26,27,28,29,30,null,null,null,null,null,
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function groupBookingsByDay(bookings: any[]): ByDay {
  return bookings.reduce((acc: ByDay, b: any) => {
    const d = new Date(b.date || b.createdAt);
    if (isNaN(d.getTime())) return acc;
    const day = d.getDate();
    if (!acc[day]) acc[day] = [];
    acc[day].push({
      id: b.id,
      time: d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }),
      venue: b.pitchName || "Cancha",
      client: b.userName || "—",
      status: b.status === "confirmed" ? "ok" : "a-confirmar",
    });
    return acc;
  }, {});
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusPill({ status }: { status: BookingStatus }) {
  return status === "ok" ? (
    <span className="inline-flex h-5 items-center rounded-full border border-[#4be176]/60 bg-[#4be176]/15 px-2 text-[10px] font-bold text-[#4be176]">● OK</span>
  ) : (
    <span className="inline-flex h-5 items-center rounded-full border border-[#ffd05a]/60 bg-[#ffd05a]/15 px-2 text-[10px] font-bold text-[#ffd05a]">● A confirmar</span>
  );
}

function CalendarDay({ day, isToday, isSelected, count, onClick }: {
  day: number | null; isToday: boolean; isSelected: boolean; count: number; onClick: () => void;
}) {
  if (!day) return <div className="h-full min-h-[48px] sm:min-h-[52px] rounded-lg" />;
  return (
    <button onClick={onClick} className={`relative flex h-full min-h-[48px] sm:min-h-[52px] w-full flex-col items-start rounded-lg px-1 pt-1 pb-1 text-left transition ${
      isSelected && !isToday ? "bg-[#102a40] ring-1 ring-[#2d5a73]"
      : isToday ? "bg-[#4be176]/15 ring-1 ring-[#4be176]/50"
      : "hover:bg-[#0c1f2e]"
    }`}>
      <span className={`flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full text-[11px] sm:text-[12px] font-bold ${isToday ? "bg-[#4be176] text-[#003915]" : "text-[#9fb3c5]"}`}>
        {day}
      </span>
      {count > 0 && (
        <span className={`mt-0.5 rounded-full px-1 py-px text-[8px] sm:text-[9px] font-black ${isToday ? "bg-[#4be176] text-[#003915]" : "bg-[#4be176]/20 text-[#4be176]"}`}>
          {count}t
        </span>
      )}
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CalendarioPage() {
  const [selectedDay, setSelectedDay] = useState(TODAY);
  const { bookings, loading, error, refetch } = useDashboardBookings();


  const byDay = groupBookingsByDay(bookings);
  const selectedBookings = byDay[selectedDay] ?? [];

  return (
    <div className="min-h-full bg-[#07111d] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">Calendario</h1>
            <p className="mt-1 text-sm text-[#9fb3c5] sm:mt-2">Tocá un día para ver sus turnos.</p>
          </div>
          <button className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-full bg-[#4be176] px-5 text-sm font-bold text-[#003915] transition hover:bg-[#6bfe8f] sm:self-auto sm:px-6">
            <Plus className="h-4 w-4" />
            Cargar reserva
          </button>
        </div>

        {loading ? (
          <LoadingSpinner message="Cargando turnos..." />
        ) : error ? (
          <ErrorBanner message={error} onRetry={refetch} />
        ) : (
          /* Two-column layout — stacked on mobile, side-by-side on lg */
          <div className="flex flex-col gap-4 lg:flex-row lg:gap-5 lg:items-start">
            {/* Calendar grid */}
            <div className="rounded-xl border border-[#1d3b52] bg-[#102a40]/90 p-4 sm:p-5 lg:flex-1">
              <div className="mb-3 flex items-center justify-between sm:mb-4">
                <h2 className="text-sm font-black text-white capitalize sm:text-base">{CURRENT_MONTH}</h2>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#4be176]/40 bg-[#4be176]/10 px-2.5 py-1 text-[9px] sm:text-[10px] font-bold text-[#4be176]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#4be176]" />
                  Con turnos
                </span>
              </div>

              <div className="mb-1 grid grid-cols-7">
                {WEEK_HEADERS.map((h) => (
                  <div key={h} className="py-1 text-center text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#4a6a82]">{h}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
                {JUNE_DAYS.map((day, idx) => (
                  <CalendarDay
                    key={idx}
                    day={day}
                    isToday={day === TODAY}
                    isSelected={day === selectedDay}
                    count={day !== null ? (byDay[day]?.length ?? 0) : 0}
                    onClick={() => day !== null && setSelectedDay(day)}
                  />
                ))}
              </div>
            </div>

            {/* Day detail */}
            <div className="overflow-hidden rounded-xl border border-[#1d3b52] bg-[#102a40]/90 lg:w-[300px] lg:shrink-0">
              <div className="border-b border-[#1d3b52] px-4 py-3 sm:py-4">
                <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#7890a3]">Turnos del</p>
                <h2 className="mt-0.5 text-sm font-black text-white sm:text-base">{selectedDay} de Junio</h2>
              </div>

              {selectedBookings.length === 0 ? (
                <p className="py-10 text-center text-sm text-[#4a6a82]">Sin turnos.</p>
              ) : (
                <div>
                  {selectedBookings.map((b, idx) => (
                    <div key={idx} className="flex items-center gap-3 border-t border-[#1d3b52] px-4 py-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#1d3b52] bg-[#071521]">
                        <span className="text-[9px] font-bold text-[#67a6d8]">{b.time}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-[13px] font-bold text-white">{b.venue}</p>
                        <p className="truncate text-[11px] text-[#7890a3]">{b.client}</p>
                      </div>
                      <StatusPill status={b.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
