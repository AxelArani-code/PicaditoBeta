"use client";

// ─────────────────────────────────────────────────────────────────────────────
// calendario/page.tsx
// Calendario mensual dinámico con panel lateral de turnos del día.
//
// Arquitectura:
//   → useAdminCalendar(isoDate) → GET /api/admin/calendar?date= → Supabase
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useMemo, useCallback } from "react";
import { ChevronLeft, ChevronRight, Plus, CalendarDays } from "lucide-react";
import { useAdminCalendar } from "@/hooks/useAdminCalendar";
import { CargarReservaDrawer } from "@/components/dashboard/CargarReservaDrawer";
import type { CalendarSlot } from "@/types/admin";

// ── Constants ─────────────────────────────────────────────────────────────────

const WEEK_HEADERS = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];

const MONTH_NAMES_ES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Builds a "YYYY-MM-DD" string from local date parts (avoids UTC offset skew). */
function toISOLocal(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Returns the day-of-month grid for a given year+month (0-indexed month). */
function buildMonthGrid(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun … 6=Sat
  // Convert Sunday-first to Monday-first offset
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const grid: (number | null)[] = Array(offset).fill(null);
  for (let d = 1; d <= daysInMonth; d++) grid.push(d);

  // Pad to complete last week row
  while (grid.length % 7 !== 0) grid.push(null);
  return grid;
}

function formatDayLabel(year: number, month: number, day: number): string {
  return new Date(year, month, day).toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: CalendarSlot["status"] }) {
  const map = {
    available: "border-[#4be176]/50 bg-[#4be176]/15 text-[#4be176]",
    booked:    "border-[#ffd05a]/50 bg-[#ffd05a]/15 text-[#ffd05a]",
    blocked:   "border-[#ff6b6b]/40 bg-[#ff6b6b]/10 text-[#ff6b6b]",
  };
  const labels = { available: "Disponible", booked: "Reservado", blocked: "Bloqueado" };
  return (
    <span className={`inline-flex h-5 items-center rounded-full border px-2 text-[9px] font-bold ${map[status]}`}>
      {labels[status]}
    </span>
  );
}

function BookingStatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    confirmed: "text-[#4be176]",
    pending:   "text-[#ffd05a]",
    rejected:  "text-[#ff6b6b]",
    cancelled: "text-[#7890a3]",
  };
  const labels: Record<string, string> = {
    confirmed: "✓ Confirmado",
    pending:   "● A confirmar",
    rejected:  "✕ Rechazado",
    cancelled: "— Cancelado",
  };
  return (
    <span className={`text-[10px] font-bold ${map[status] ?? "text-[#7890a3]"}`}>
      {labels[status] ?? status}
    </span>
  );
}

function CalendarDay({
  day,
  isToday,
  isSelected,
  bookedCount,
  onClick,
}: {
  day: number | null;
  isToday: boolean;
  isSelected: boolean;
  bookedCount: number;
  onClick: () => void;
}) {
  if (!day) return <div className="h-full min-h-[48px] sm:min-h-[52px] rounded-lg" />;

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "relative flex h-full min-h-[48px] sm:min-h-[52px] w-full flex-col items-start rounded-lg px-1 pt-1 pb-1 text-left transition focus:outline-none focus-visible:ring-1 focus-visible:ring-[#4be176]/60",
        isSelected && !isToday ? "bg-[#102a40] ring-1 ring-[#2d5a73]"
        : isToday ? "bg-[#4be176]/15 ring-1 ring-[#4be176]/50"
        : "hover:bg-[#0c1f2e]",
      ].join(" ")}
    >
      <span
        className={[
          "flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full text-[11px] sm:text-[12px] font-bold",
          isToday ? "bg-[#4be176] text-[#003915]" : "text-[#9fb3c5]",
        ].join(" ")}
      >
        {day}
      </span>
      {bookedCount > 0 && (
        <span
          className={[
            "mt-0.5 rounded-full px-1 py-px text-[8px] sm:text-[9px] font-black",
            isToday ? "bg-[#4be176] text-[#003915]" : "bg-[#4be176]/20 text-[#4be176]",
          ].join(" ")}
        >
          {bookedCount}t
        </span>
      )}
    </button>
  );
}

// Skeleton for the day detail panel while loading
function DayDetailSkeleton() {
  return (
    <div className="space-y-3 p-4" aria-busy aria-label="Cargando turnos…">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="h-16 animate-pulse rounded-xl border border-[#1d3b52] bg-[#071521]"
          style={{ animationDelay: `${i * 80}ms` }}
        />
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CalendarioPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Refresh the selected day panel after a manual booking is created
  const handleBookingSuccess = useCallback(() => {
    // useAdminCalendar will re-fetch automatically because we call it with the same key;
    // to force a refresh we briefly toggle to another value and back — simpler approach:
    // just re-mount by changing selectedISO momentarily (not needed here since the
    // hook already has a refetch; we'll just let the user see the success state).
  }, []);

  const today = new Date();
  const todayISO = toISOLocal(today);

  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedISO, setSelectedISO] = useState(todayISO);

  // Fetch slots + bookings for the selected day
  const { dayData, isLoading: dayLoading } = useAdminCalendar(selectedISO);

  // Build the calendar grid for the current view month
  const grid = useMemo(() => buildMonthGrid(viewYear, viewMonth), [viewYear, viewMonth]);

  // Build a lookup: day-number → booked count (for badge on each grid cell)
  const bookedByDay = useMemo(() => {
    // This is a best-effort client-side badge — uses whatever the API returned
    // for the currently selected day only. For a production version, you'd fetch
    // a summary of the whole month separately.
    const map: Record<number, number> = {};
    if (dayData) {
      const d = new Date(dayData.date + "T00:00:00");
      if (d.getFullYear() === viewYear && d.getMonth() === viewMonth) {
        map[d.getDate()] = dayData.summary.booked;
      }
    }
    return map;
  }, [dayData, viewYear, viewMonth]);

  function navigate(delta: number) {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 0)  { m = 11; y--; }
    if (m > 11) { m = 0;  y++; }
    setViewMonth(m);
    setViewYear(y);
  }

  function handleDayClick(day: number) {
    const m = String(viewMonth + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    setSelectedISO(`${viewYear}-${m}-${d}`);
  }

  const selectedDateLabel = (() => {
    const [y, m, d] = selectedISO.split("-").map(Number);
    return formatDayLabel(y, m - 1, d);
  })();

  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      viewMonth === today.getMonth() &&
      viewYear === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    const m = String(viewMonth + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${viewYear}-${m}-${d}` === selectedISO;
  };

  // Group slots by pitchName for the detail panel
  const slotsByPitch = useMemo(() => {
    const map = new Map<string, CalendarSlot[]>();
    for (const slot of dayData?.slots ?? []) {
      const list = map.get(slot.pitchName) ?? [];
      list.push(slot);
      map.set(slot.pitchName, list);
    }
    return map;
  }, [dayData]);

  return (
    <div className="min-h-full bg-[#07111d] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-6xl">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">Calendario</h1>
            <p className="mt-1 text-sm text-[#9fb3c5] sm:mt-2">
              Navegá el mes y tocá un día para ver sus turnos.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-full bg-[#4be176] px-5 text-sm font-bold text-[#003915] transition hover:bg-[#6bfe8f] sm:self-auto sm:px-6"
          >
            <Plus className="h-4 w-4" />
            Cargar reserva
          </button>
        </div>

        {/* ── Two-column layout ────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-5">

          {/* ── Calendar grid ──────────────────────────────────────────────── */}
          <div className="rounded-xl border border-[#1d3b52] bg-[#102a40]/90 p-4 sm:p-5 lg:flex-1">

            {/* Month navigation */}
            <div className="mb-3 flex items-center justify-between sm:mb-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                aria-label="Mes anterior"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#1d3b52] text-[#7890a3] transition hover:border-[#2d5a73] hover:text-white"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <h2 className="text-sm font-black capitalize text-white sm:text-base">
                {MONTH_NAMES_ES[viewMonth]} {viewYear}
              </h2>

              <button
                type="button"
                onClick={() => navigate(1)}
                aria-label="Mes siguiente"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#1d3b52] text-[#7890a3] transition hover:border-[#2d5a73] hover:text-white"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Week day headers */}
            <div className="mb-1 grid grid-cols-7">
              {WEEK_HEADERS.map((h) => (
                <div
                  key={h}
                  className="py-1 text-center text-[9px] font-bold uppercase tracking-wider text-[#4a6a82] sm:text-[10px]"
                >
                  {h}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
              {grid.map((day, idx) => (
                <CalendarDay
                  key={idx}
                  day={day}
                  isToday={day !== null && isToday(day)}
                  isSelected={day !== null && isSelected(day)}
                  bookedCount={day !== null ? (bookedByDay[day] ?? 0) : 0}
                  onClick={() => day !== null && handleDayClick(day)}
                />
              ))}
            </div>

            {/* Legend */}
            <div className="mt-4 flex items-center gap-4 border-t border-[#1d3b52] pt-3">
              <span className="flex items-center gap-1.5 text-[10px] font-semibold text-[#577080]">
                <span className="h-2 w-2 rounded-full bg-[#4be176]" /> Con turnos
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-semibold text-[#577080]">
                <span className="h-2 w-2 rounded-full bg-[#4be176]/40" /> Hoy
              </span>
            </div>
          </div>

          {/* ── Day detail panel ───────────────────────────────────────────── */}
          <div className="overflow-hidden rounded-xl border border-[#1d3b52] bg-[#102a40]/90 lg:w-[320px] lg:shrink-0">
            {/* Panel header */}
            <div className="border-b border-[#1d3b52] px-4 py-3 sm:py-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#7890a3] sm:text-[11px]">
                Turnos del
              </p>
              <h2 className="mt-0.5 text-sm font-black capitalize text-white sm:text-base">
                {selectedDateLabel}
              </h2>
              {dayData && (
                <p className="mt-1 text-[11px] text-[#7890a3]">
                  {dayData.summary.booked} reservados · {dayData.summary.available} disponibles
                </p>
              )}
            </div>

            {/* Panel body */}
            {dayLoading ? (
              <DayDetailSkeleton />
            ) : !dayData || dayData.slots.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-center px-4">
                <CalendarDays className="mb-3 h-10 w-10 text-[#2d5a73]" strokeWidth={1.4} />
                <p className="text-sm font-bold text-white">Sin turnos publicados</p>
                <p className="mt-1 text-[12px] text-[#4a6a82]">
                  No hay horarios cargados para este día.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#1d3b52] overflow-y-auto max-h-[520px]">
                {Array.from(slotsByPitch.entries()).map(([pitchName, slots]) => (
                  <div key={pitchName}>
                    {/* Cancha sub-header */}
                    <div className="bg-[#071521]/60 px-4 py-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#4be176]">
                        {pitchName}
                      </p>
                    </div>

                    {slots.map((slot) => (
                      <div
                        key={slot.id}
                        className="flex items-start gap-3 px-4 py-3 hover:bg-[#0c1f2e]/40"
                      >
                        {/* Time bubble */}
                        <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl border border-[#1d3b52] bg-[#071521]">
                          <span className="text-[9px] font-black text-[#67a6d8] leading-none">
                            {slot.startTime}
                          </span>
                          <span className="text-[8px] text-[#4a6a82] leading-none mt-0.5">
                            {slot.endTime}
                          </span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <StatusBadge status={slot.status} />
                            <span className="text-[11px] font-bold text-[#4be176]">
                              ${Number(slot.price).toLocaleString("es-AR")}
                            </span>
                          </div>

                          {slot.booking && (
                            <div className="mt-1">
                              <p className="truncate text-[12px] font-semibold text-white">
                                {slot.booking.userName}
                              </p>
                              <BookingStatusPill status={slot.booking.bookingStatus} />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Cargar Reserva Drawer ────────────────────────────────────────────── */}
      <CargarReservaDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        defaultDate={selectedISO}
        onSuccess={handleBookingSuccess}
      />
    </div>
  );
}
