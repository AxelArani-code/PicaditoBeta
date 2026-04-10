"use client";

// ─────────────────────────────────────────────────────────────────────────────
// TurnosClient.tsx
// Section 3 (part B) — Main React Component: Booking View
// ─────────────────────────────────────────────────────────────────────────────

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  CircleDollarSign,
  Clock3,
  Droplets,
  MapPin,
  Trophy,
  Users,
} from "lucide-react";
import { buildNextDays, groupSlotsByPeriod } from "./booking.helpers";
import { useAvailableSlots } from "./useAvailableSlots";
import type { BookingPitch, BookingTimeSlot, DayOption } from "./booking.types";

// ─────────────────────────────────────────────────────────────────────────────
// 1. Static label maps
// ─────────────────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  FiveV5:    "Fútbol 5",
  SevenV7:   "Fútbol 7",
  NineV9:    "Fútbol 9",
  ElevenV11: "Fútbol 11",
};

const SURFACE_LABELS: Record<string, string> = {
  natural:   "Pasto Natural",
  sintetico: "Césped Sintético",
  cemento:   "Cemento",
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. Sub-components
// ─────────────────────────────────────────────────────────────────────────────

// ── Date carousel button ──────────────────────────────────────────────────────

function DateButton({
  day,
  isSelected,
  onClick,
}: {
  day: DayOption;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      id={`date-btn-${day.isoDate}`}
      type="button"
      aria-label={`Seleccionar fecha ${day.fullLabel}`}
      aria-pressed={isSelected}
      onClick={onClick}
      className={[
        "relative flex flex-col items-center rounded-2xl border px-3 py-4 text-center",
        "transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4be176]/60",
        isSelected
          ? "border-[#4be176] bg-[#0b2637] text-[#4be176] shadow-[0_0_24px_rgba(75,225,118,0.18)]"
          : "border-[#1b3442] bg-[#071b28] text-[#8ca3b2] hover:border-[#2c5368] hover:text-white hover:bg-[#0b1e2a]",
      ].join(" ")}
    >
      <span className="block text-[10px] font-black uppercase tracking-widest">
        {day.dayLabel}
      </span>
      <span className="mt-1.5 block text-2xl font-black leading-none">
        {day.dateNum}
      </span>
      <span className="mt-1 block text-[10px] font-semibold opacity-70">
        {day.month}
      </span>
      {/* Active indicator dot */}
      {isSelected && (
        <span className="absolute bottom-1.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[#4be176]" />
      )}
    </button>
  );
}

// ── Loading skeleton for time slots ──────────────────────────────────────────

function SlotsSkeleton() {
  return (
    <div className="space-y-5" aria-label="Cargando turnos…" aria-busy>
      {["Mañana", "Tarde"].map((period) => (
        <div key={period}>
          <div className="mb-2 h-3 w-16 animate-pulse rounded bg-[#1b3442]" />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-xl border border-[#1b3442] bg-[#050d13]/60"
                style={{ animationDelay: `${i * 60}ms` }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptySlots() {
  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center rounded-2xl border border-[#1b3442] bg-[#050d13] py-16 text-center px-6"
    >
      {/* Calendar icon */}
      <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-[#1b3442] bg-[#071b28]">
        <CalendarDays className="h-8 w-8 text-[#2c5368]" strokeWidth={1.4} />
      </span>
      <p className="text-base font-black text-white">Sin turnos disponibles</p>
      <p className="mt-3 max-w-xs text-sm leading-relaxed text-[#577080]">
        No slots available. The facility has not yet published schedules for
        this court. You can contact them directly.
      </p>
    </div>
  );
}

// ── Individual time slot button ───────────────────────────────────────────────

function SlotButton({
  slot,
  isSelected,
  onClick,
}: {
  slot: BookingTimeSlot;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      id={`slot-btn-${slot.id}`}
      type="button"
      aria-label={`Turno de ${slot.startTime} a ${slot.endTime}, ${slot.priceFormatted}`}
      aria-pressed={isSelected}
      onClick={onClick}
      className={[
        "group relative min-h-[6rem] rounded-xl border p-4 text-left",
        "transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4be176]/60",
        isSelected
          ? "border-[#4be176]/70 bg-[#0b2637] shadow-[0_0_24px_rgba(75,225,118,0.15)]"
          : "border-[#1b3442] bg-[#050d13] hover:border-[#2c5368] hover:bg-[#0b1e2a]",
      ].join(" ")}
    >
      {/* Selected checkmark */}
      {isSelected && (
        <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#4be176] text-[#071b28]">
          <svg
            className="h-3 w-3"
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </span>
      )}

      <span
        className={[
          "block text-xl font-black leading-none",
          isSelected ? "text-[#4be176]" : "text-white",
        ].join(" ")}
      >
        {slot.startTime}
      </span>
      <span className="mt-1 block text-xs text-[#577080]">
        hasta {slot.endTime}
      </span>
      <span
        className={[
          "mt-2.5 block text-xs font-bold",
          isSelected ? "text-[#4be176]" : "text-[#4be176]/80",
        ].join(" ")}
      >
        {slot.priceFormatted}
      </span>
    </button>
  );
}

// ── Summary row ───────────────────────────────────────────────────────────────

function SummaryRow({
  icon: Icon,
  label,
  value,
  highlight = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[#1b3442] py-3.5 last:border-0">
      <div className="flex items-center gap-3 text-sm text-[#8ca3b2]">
        <Icon className="h-4 w-4 shrink-0 text-[#4be176]" strokeWidth={1.8} />
        <span>{label}</span>
      </div>
      <span
        className={[
          "min-w-0 text-right text-sm font-bold",
          highlight ? "text-lg text-[#4be176]" : "text-white",
        ].join(" ")}
      >
        {value}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Main component
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  pitch: BookingPitch;
  pitchImageSrc: string;
}

export default function TurnosClient({ pitch, pitchImageSrc }: Props) {
  // ── Day options (memoised — never changes during the component lifetime) ─────
  const dayOptions = useMemo(() => buildNextDays(7), []);

  // ── State ─────────────────────────────────────────────────────────────────────
  const [selectedDate, setSelectedDate] = useState<string>(
    dayOptions[0].isoDate
  );
  const [selectedSlot, setSelectedSlot] = useState<BookingTimeSlot | null>(null);

  // ── Derived values ────────────────────────────────────────────────────────────
  const selectedDayObj = dayOptions.find((d) => d.isoDate === selectedDate) ?? dayOptions[0];

  // ── Data fetching ─────────────────────────────────────────────────────────────
  const { slots, isLoading, error } = useAvailableSlots(
    pitch.id,
    selectedDate
  );

  // Group available slots by period for rendering
  const groupedSlots = useMemo(
    () => groupSlotsByPeriod(slots),
    [slots]
  );

  const hasSlots = slots.length > 0;

  // ── Label helpers ─────────────────────────────────────────────────────────────
  const typeLabel    = TYPE_LABELS[pitch.type]        ?? pitch.type;
  const surfaceLabel = SURFACE_LABELS[pitch.surface ?? ""] ?? pitch.surface ?? "—";

  // ── Handlers ──────────────────────────────────────────────────────────────────
  function handleDateSelect(isoDate: string) {
    if (isoDate === selectedDate) return;
    setSelectedDate(isoDate);
    setSelectedSlot(null); // Reset slot when date changes
  }

  function handleSlotToggle(slot: BookingTimeSlot) {
    setSelectedSlot((prev) => (prev?.id === slot.id ? null : slot));
  }

  // ── Booking CTA URL ───────────────────────────────────────────────────────────
  // Encode ALL info needed by the confirmation page into query params so it
  // doesn't need an extra fetch.
  const confirmUrl = useMemo(() => {
    if (!selectedSlot) return "#";
    const p = new URLSearchParams({
      slot_id:     selectedSlot.id,
      date:        selectedDate,
      start_time:  selectedSlot.startTime,
      end_time:    selectedSlot.endTime,
      price:       String(selectedSlot.price),
      price_fmt:   selectedSlot.priceFormatted,
      // Pitch / venue info
      pitch_name:  pitch.name,
      venue_name:  pitch.venueName,
      venue_city:  pitch.venueCity,
      venue_addr:  pitch.venueAddress,
      pitch_type:  typeLabel,
      surface:     surfaceLabel,
      img:         pitchImageSrc,
    });
    return `/inicio/cancha/${pitch.id}/confirmacion?${p.toString()}`;
  }, [selectedSlot, selectedDate, pitch, typeLabel, surfaceLabel, pitchImageSrc]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* LEFT COLUMN — Header + Date Carousel + Time Slots                 */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <div className="space-y-6">

          {/* ── Page Header ───────────────────────────────────────────────── */}
          <header>
            <h1 className="text-3xl font-black text-white sm:text-4xl">
              Elegí tu turno
            </h1>
            <p className="mt-1.5 text-sm font-semibold text-[#8ca3b2]">
              {pitch.name}&nbsp;·&nbsp;{pitch.venueName}
            </p>
            <div className="mt-2 flex items-center gap-2 text-sm text-[#577080]">
              <MapPin className="h-4 w-4 shrink-0 text-[#4be176]" strokeWidth={1.7} />
              <span>
                {pitch.venueAddress}
                {pitch.venueCity && `, ${pitch.venueCity}`}
              </span>
            </div>
          </header>

          {/* ── Date Carousel ─────────────────────────────────────────────── */}
          <section
            aria-label="Seleccionar fecha"
            className="rounded-2xl border border-[#1b3442] bg-[#071b28] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.3)]"
          >
            <h2 className="mb-4 flex items-center gap-2 text-base font-black text-white">
              <CalendarDays className="h-5 w-5 text-[#4be176]" strokeWidth={1.8} />
              Fecha
            </h2>

            {/* 7-day carousel grid */}
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
              {dayOptions.map((day) => (
                <DateButton
                  key={day.isoDate}
                  day={day}
                  isSelected={day.isoDate === selectedDate}
                  onClick={() => handleDateSelect(day.isoDate)}
                />
              ))}
            </div>
          </section>

          {/* ── Time Slots ────────────────────────────────────────────────── */}
          <section
            aria-label="Horarios disponibles"
            className="rounded-2xl border border-[#1b3442] bg-[#071b28] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.3)]"
          >
            {/* Section header */}
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="flex items-center gap-2 text-base font-black text-white">
                <Clock3 className="h-5 w-5 text-[#4be176]" strokeWidth={1.8} />
                Horarios disponibles
                <span className="ml-1 text-sm font-semibold text-[#577080]">
                  — {selectedDayObj.fullLabel}
                </span>
              </h2>

              {/* Legend */}
              {!isLoading && hasSlots && (
                <div className="flex items-center gap-4 text-xs font-semibold text-[#577080]">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#4be176]" />
                    Disponible
                  </span>
                </div>
              )}
            </div>

            {/* ── Content: Loading / Empty / Slots ──────────────────────── */}
            {isLoading ? (
              <SlotsSkeleton />
            ) : error ? (
              /* Network/DB error — show a minimal error state */
              <div className="flex flex-col items-center justify-center rounded-xl border border-red-500/20 bg-red-500/5 py-12 text-center">
                <p className="text-sm font-bold text-red-400">{error}</p>
              </div>
            ) : !hasSlots ? (
              <EmptySlots />
            ) : (
              /* Time slot grid grouped by period */
              <div className="space-y-6">
                {(["Mañana", "Tarde", "Noche"] as const).map((period) => {
                  const periodSlots = groupedSlots[period];
                  if (periodSlots.length === 0) return null;

                  return (
                    <div key={period}>
                      {/* Period label */}
                      <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#577080]">
                        {period}
                      </p>

                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                        {periodSlots.map((slot) => (
                          <SlotButton
                            key={slot.id}
                            slot={slot}
                            isSelected={selectedSlot?.id === slot.id}
                            onClick={() => handleSlotToggle(slot)}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* RIGHT COLUMN — Booking Summary Card                               */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <aside className="space-y-4 xl:pt-[72px]">
          <div
            className="sticky top-6 overflow-hidden rounded-2xl border border-[#1b3442] bg-[#071b28] shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
            aria-label="Resumen de reserva"
          >
            {/* Pitch thumbnail with gradient overlay */}
            <div className="relative h-44">
              <img
                src={pitchImageSrc}
                alt={pitch.venueName}
                className="h-full w-full object-cover"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#071b28] via-[#071b28]/30 to-transparent" />

              {/* Type badge */}
              <span className="absolute bottom-3 left-4 rounded-full bg-[#4be176] px-3 py-1 text-xs font-black text-[#071b28]">
                {typeLabel}
              </span>

              {/* Surface badge */}
              <span className="absolute bottom-3 right-4 rounded-full border border-white/10 bg-black/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                {surfaceLabel}
              </span>
            </div>

            {/* Summary rows */}
            <div className="px-5 pt-4 pb-1">
              <div className="mb-1 flex items-start justify-between gap-2">
                <h2 className="text-xl font-black text-white">Resumen</h2>
                {selectedSlot && (
                  <span className="rounded-full bg-[#4be176]/15 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-[#4be176]">
                    Turno seleccionado
                  </span>
                )}
              </div>

              <div className="mt-3">
                <SummaryRow
                  icon={CalendarDays}
                  label="Fecha"
                  value={selectedDayObj.fullLabel}
                />
                <SummaryRow
                  icon={Clock3}
                  label="Horario"
                  value={
                    selectedSlot
                      ? `${selectedSlot.startTime} – ${selectedSlot.endTime}`
                      : "—"
                  }
                />
                <SummaryRow
                  icon={Trophy}
                  label="Cancha"
                  value={pitch.name}
                />
                <SummaryRow
                  icon={Users}
                  label="Modalidad"
                  value={typeLabel}
                />
                <SummaryRow
                  icon={Droplets}
                  label="Superficie"
                  value={surfaceLabel}
                />
                <SummaryRow
                  icon={CircleDollarSign}
                  label="Total"
                  value={selectedSlot ? selectedSlot.priceFormatted : "—"}
                  highlight
                />
              </div>
            </div>

            {/* CTA button */}
            <div className="px-5 pb-5 pt-2">
              <Link
                id="booking-cta-btn"
                href={confirmUrl}
                aria-disabled={!selectedSlot}
                tabIndex={selectedSlot ? 0 : -1}
                className={[
                  "mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-black",
                  "transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4be176]/60",
                  selectedSlot
                    ? "bg-[#4be176] text-[#071b28] shadow-[0_8px_28px_rgba(75,225,118,0.3)] hover:bg-[#3dd168] active:scale-95"
                    : "cursor-not-allowed bg-[#1b3442] text-[#577080]",
                ].join(" ")}
                onClick={(e) => { if (!selectedSlot) e.preventDefault(); }}
              >
                {selectedSlot ? (
                  <>
                    <BadgeCheck className="h-4 w-4" strokeWidth={2} />
                    Book Time Slot
                  </>
                ) : (
                  "Select a time slot"
                )}
              </Link>

              <p className="mt-3 text-center text-xs text-[#577080]">
                Cancelación gratuita hasta 24&nbsp;hs antes
              </p>
            </div>
          </div>

          {/* Quick venue meta strip */}
          <div className="flex items-center gap-3 rounded-xl border border-[#1b3442] bg-[#071b28] px-4 py-3">
            <MapPin className="h-4 w-4 shrink-0 text-[#4be176]" strokeWidth={1.8} />
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-white">
                {pitch.venueName}
              </p>
              <p className="truncate text-[11px] text-[#577080]">
                {pitch.venueAddress}
                {pitch.venueCity && `, ${pitch.venueCity}`}
              </p>
            </div>
            {pitch.venueWhatsapp && (
              <a
                href={`https://wa.me/${pitch.venueWhatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Contactar por WhatsApp"
                className="ml-auto shrink-0 rounded-lg border border-[#1b3442] px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#4be176] transition hover:border-[#4be176]/50 hover:bg-[#4be176]/5"
              >
                WA
              </a>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
