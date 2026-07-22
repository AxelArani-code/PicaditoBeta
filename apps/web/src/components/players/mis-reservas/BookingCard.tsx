"use client";

// ─────────────────────────────────────────────────────────────────────────────
// components/players/mis-reservas/BookingCard.tsx
// Fully responsive booking card: stacked on mobile, horizontal on md+
// ─────────────────────────────────────────────────────────────────────────────

import { CalendarDays, Clock, Timer, QrCode, PhoneCall, Copy, Loader2, ChevronRight } from "lucide-react";
import type { PlayerBooking } from "@/types/player-bookings";
import { SURFACE_LABELS, FORMAT_LABELS } from "@/types/player-bookings";

interface BookingCardProps {
  booking: PlayerBooking;
  onDetails: (booking: PlayerBooking) => void;
  onCancel: (bookingId: string) => void;
  onDuplicate?: (booking: PlayerBooking) => void;
  cancelLoading?: string | null;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("es-AR", { weekday: "short", day: "numeric", month: "short" });
}

// ── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: PlayerBooking["status"] }) {
  const cfg = {
    confirmed: { label: "CONFIRMADA", dot: "bg-[#4be176]", className: "text-[#4be176] border-[#4be176]/30 bg-[#4be176]/10" },
    pending:   { label: "PENDIENTE",  dot: "bg-[#fbbf24]", className: "text-[#fbbf24] border-[#fbbf24]/30 bg-[#fbbf24]/10" },
    cancelled: { label: "CANCELADA",  dot: "bg-[#ef4444]", className: "text-[#ef4444] border-[#ef4444]/30 bg-[#ef4444]/10" },
    rejected:  { label: "RECHAZADA",  dot: "bg-[#ef4444]", className: "text-[#ef4444] border-[#ef4444]/30 bg-[#ef4444]/10" },
  } as const;
  const { label, dot, className } = cfg[status] ?? cfg.cancelled;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wider ${className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

// ── Static pitch images ───────────────────────────────────────────────────────
const PITCH_IMAGES = ["/pitches/pitch-1.png", "/pitches/pitch-2.png", "/pitches/pitch-3.png"];
function getPitchImage(bookingId: string): string {
  const hash = bookingId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return PITCH_IMAGES[hash % PITCH_IMAGES.length];
}

// ── Info chip (mobile horizontal layout) ─────────────────────────────────────
function InfoChip({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <div className="flex items-center gap-1 text-[12px] text-[#9fb3c5]">
      {icon}
      <span>{value}</span>
    </div>
  );
}

// ── Desktop info item ─────────────────────────────────────────────────────────
function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[9px] font-bold uppercase tracking-widest text-[#4a6a82]">{label}</span>
      <div className="flex items-center gap-1 text-[12px] font-semibold text-[#d7e8f2]">{icon}{value}</div>
    </div>
  );
}

// ── Mobile Card Layout ────────────────────────────────────────────────────────
function MobileCard({ booking, onDetails, onCancel, onDuplicate, cancelLoading }: BookingCardProps) {
  const isCancelling = cancelLoading === booking.id;
  const surfaceLabel = SURFACE_LABELS[booking.pitch.surface] ?? booking.pitch.surface;
  const formatLabel  = FORMAT_LABELS[booking.pitch.type]     ?? booking.pitch.type;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onDetails(booking)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onDetails(booking); }}
      className="overflow-hidden rounded-2xl border border-[#1a2e3a] bg-[#0b1a25] cursor-pointer transition active:scale-[0.99]"
      style={{ animation: "fade-in 0.25s ease forwards" }}
    >
      {/* Top: image banner */}
      <div className="relative h-32 w-full overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={getPitchImage(booking.id)} alt={booking.pitch.name} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b1a25] via-[#0b1a25]/40 to-transparent" />
        {/* Surface + format badges */}
        <div className="absolute left-3 top-3 flex gap-1.5">
          <span className="rounded-md bg-black/70 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">{surfaceLabel}</span>
          <span className="rounded-md bg-black/70 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">{formatLabel}</span>
        </div>
        {/* Status badge top-right */}
        <div className="absolute right-3 top-3">
          <StatusBadge status={booking.status} />
        </div>
        {/* Venue name bottom */}
        <div className="absolute bottom-2 left-3 right-3">
          <h3 className="truncate text-base font-black text-white leading-tight drop-shadow-lg">{booking.venue.name}</h3>
          <p className="truncate text-[11px] text-[#9fb3c5]">{booking.pitch.name}</p>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 pt-3 pb-3">
        {/* Code */}
        <p className="mb-2.5 text-[10px] font-mono text-[#4a6a82]">CÓDIGO: {booking.code}</p>

        {/* Info chips row */}
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-3">
          <InfoChip icon={<CalendarDays className="h-3 w-3 text-[#4be176]" />} value={formatDate(booking.date)} />
          <InfoChip icon={<Clock className="h-3 w-3 text-[#4be176]" />}        value={`${booking.startTime} – ${booking.endTime}`} />
          <InfoChip icon={<Timer className="h-3 w-3 text-[#4be176]" />}        value={`${booking.durationMinutes} min`} />
        </div>

        {/* Price + actions */}
        <div
          className="flex items-center justify-between gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-xl font-black text-white">
            ${booking.totalAmount.toLocaleString("es-AR")}
          </span>

          <div className="flex gap-2">
            {booking.status === "confirmed" && (
              <button
                id={`booking-qr-${booking.id}`}
                onClick={() => onDetails(booking)}
                className="flex h-9 items-center gap-1.5 rounded-xl border border-white/80 bg-white px-3 text-[11px] font-black text-[#0b1a25] transition hover:bg-white/90 active:scale-[0.97]"
              >
                <QrCode className="h-3.5 w-3.5" /> QR
              </button>
            )}
            {booking.status === "pending" && (
              <>
                <button
                  id={`booking-contact-${booking.id}`}
                  className="flex h-9 items-center gap-1.5 rounded-xl border border-[#1d3b52] bg-[#071521] px-3 text-[11px] font-black text-[#d7e8f2] transition hover:bg-[#122134] active:scale-[0.97]"
                >
                  <PhoneCall className="h-3.5 w-3.5" />
                </button>
                <button
                  id={`booking-cancel-${booking.id}`}
                  disabled={isCancelling}
                  onClick={() => onCancel(booking.id)}
                  className="flex h-9 items-center gap-1.5 rounded-xl border border-[#ef4444]/30 bg-[#ef4444]/5 px-3 text-[11px] font-black text-[#ef4444] transition hover:bg-[#ef4444]/10 disabled:opacity-50 active:scale-[0.97]"
                >
                  {isCancelling ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "CANCELAR"}
                </button>
              </>
            )}
            {(booking.status === "cancelled" || booking.status === "rejected") && (
              <button
                id={`booking-duplicate-${booking.id}`}
                onClick={() => onDuplicate?.(booking)}
                className="flex h-9 items-center gap-1.5 rounded-xl border border-[#4be176]/20 bg-[#4be176]/5 px-3 text-[11px] font-black text-[#4be176] transition hover:bg-[#4be176]/10 active:scale-[0.97]"
              >
                <Copy className="h-3.5 w-3.5" /> DUPLICAR
              </button>
            )}
            {/* Open detail chevron */}
            <button
              id={`booking-details-${booking.id}`}
              onClick={() => onDetails(booking)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#1d3b52] bg-[#0b1a25] text-[#4a6a82] transition hover:bg-[#122134] hover:text-white active:scale-[0.97]"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Desktop Card Layout ───────────────────────────────────────────────────────
function DesktopCard({ booking, onDetails, onCancel, onDuplicate, cancelLoading }: BookingCardProps) {
  const isCancelling = cancelLoading === booking.id;
  const surfaceLabel = SURFACE_LABELS[booking.pitch.surface] ?? booking.pitch.surface;
  const formatLabel  = FORMAT_LABELS[booking.pitch.type]     ?? booking.pitch.type;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onDetails(booking)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onDetails(booking); }}
      className="flex overflow-hidden rounded-2xl border border-[#1a2e3a] bg-[#0b1a25] cursor-pointer transition hover:border-[#4be176]/40 hover:shadow-[0_0_0_1px_rgba(75,225,118,0.15)] active:scale-[0.995]"
      style={{ animation: "fade-in 0.25s ease forwards" }}
    >
      {/* Left: image */}
      <div className="relative h-full w-36 shrink-0 overflow-hidden rounded-l-2xl lg:w-44">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={getPitchImage(booking.id)} alt={booking.pitch.name} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0b1a25]/60" />
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          <span className="rounded-md bg-black/70 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">{surfaceLabel}</span>
          <span className="rounded-md bg-black/70 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">{formatLabel}</span>
        </div>
      </div>

      {/* Center: info */}
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 px-4 py-4">
        <div>
          <h3 className="truncate text-xl font-black text-white leading-tight">{booking.venue.name}</h3>
          <p className="truncate text-sm text-[#9fb3c5]">{booking.pitch.name}</p>
          <p className="mt-0.5 text-[11px] font-mono text-[#4a6a82]">CÓDIGO: {booking.code}</p>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          <InfoItem icon={<CalendarDays className="h-3.5 w-3.5 text-[#4be176]" />} label="Fecha"    value={formatDate(booking.date)} />
          <InfoItem icon={<Clock        className="h-3.5 w-3.5 text-[#4be176]" />} label="Horario"  value={`${booking.startTime} - ${booking.endTime}`} />
          <InfoItem icon={<Timer        className="h-3.5 w-3.5 text-[#4be176]" />} label="Duración" value={`${booking.durationMinutes} min`} />
        </div>
      </div>

      {/* Right: actions — stop propagation */}
      <div
        className="flex shrink-0 flex-col border-l border-[#1a2e3a]"
        onClick={(e) => e.stopPropagation()}
      >
        {booking.status === "confirmed" && (
          <div className="flex shrink-0 flex-col items-stretch gap-2 p-4 w-40">
            <StatusBadge status="confirmed" />
            <p className="text-right text-lg font-black text-white">${booking.totalAmount.toLocaleString("es-AR")}</p>
            <button id={`booking-qr-${booking.id}`} className="flex h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-white/80 bg-white text-[11px] font-black text-[#0b1a25] transition hover:bg-white/90 active:scale-[0.97]">
              <QrCode className="h-4 w-4" /> QR CODE
            </button>
            <button id={`booking-details-${booking.id}`} onClick={() => onDetails(booking)} className="flex h-10 w-full items-center justify-center rounded-xl border border-[#1d3b52] bg-[#0b1a25] text-[11px] font-black text-[#d7e8f2] transition hover:bg-[#122134] hover:border-[#2d5a73] active:scale-[0.97]">
              DETALLES
            </button>
          </div>
        )}
        {booking.status === "pending" && (
          <div className="flex shrink-0 flex-col items-stretch gap-2 p-4 w-40">
            <StatusBadge status="pending" />
            <p className="text-right text-lg font-black text-white">${booking.totalAmount.toLocaleString("es-AR")}</p>
            <button id={`booking-contact-${booking.id}`} className="flex h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-[#1d3b52] bg-[#0b1a25] text-[11px] font-black text-[#d7e8f2] transition hover:bg-[#122134] active:scale-[0.97]">
              <PhoneCall className="h-3.5 w-3.5" /> CONTACTAR
            </button>
            <button id={`booking-cancel-${booking.id}`} disabled={isCancelling} onClick={() => onCancel(booking.id)} className="flex h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-[#ef4444]/30 bg-[#ef4444]/5 text-[11px] font-black text-[#ef4444] transition hover:bg-[#ef4444]/10 disabled:opacity-50 active:scale-[0.97]">
              {isCancelling ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "CANCELAR"}
            </button>
          </div>
        )}
        {(booking.status === "cancelled" || booking.status === "rejected") && (
          <div className="flex shrink-0 flex-col items-stretch gap-2 p-4 w-40">
            <StatusBadge status={booking.status} />
            <p className="text-right text-lg font-black text-white">${booking.totalAmount.toLocaleString("es-AR")}</p>
            <button id={`booking-duplicate-${booking.id}`} onClick={() => onDuplicate?.(booking)} className="mt-auto flex h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-[#4be176]/20 bg-[#4be176]/5 text-[11px] font-black text-[#4be176] transition hover:bg-[#4be176]/10 active:scale-[0.97]">
              <Copy className="h-3.5 w-3.5" /> DUPLICAR
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main export — switches layout per breakpoint ──────────────────────────────
export function BookingCard(props: BookingCardProps) {
  return (
    <>
      {/* Mobile (< md) */}
      <div className="block md:hidden">
        <MobileCard {...props} />
      </div>
      {/* Desktop (≥ md) */}
      <div className="hidden md:block">
        <DesktopCard {...props} />
      </div>
    </>
  );
}
