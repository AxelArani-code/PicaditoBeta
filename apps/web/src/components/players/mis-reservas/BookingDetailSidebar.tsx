"use client";

// ─────────────────────────────────────────────────────────────────────────────
// components/players/mis-reservas/BookingDetailSidebar.tsx
// Slide-over panel with vertical stepper & actions
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef } from "react";
import { X, MapPin, Download, PhoneCall, Share2, CheckCircle2, Circle, Clock } from "lucide-react";
import type { PlayerBooking } from "@/types/player-bookings";
import { SURFACE_LABELS, FORMAT_LABELS } from "@/types/player-bookings";

// ── Static pitch images (rotated by booking id hash) ──────────────────────────
const PITCH_IMAGES = ["/pitches/pitch-1.png", "/pitches/pitch-2.png", "/pitches/pitch-3.png"];
function getPitchImage(bookingId: string): string {
  const hash = bookingId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return PITCH_IMAGES[hash % PITCH_IMAGES.length];
}


interface BookingDetailSidebarProps {
  booking: PlayerBooking | null;
  isOpen: boolean;
  onClose: () => void;
}

interface StepConfig { label: string; detail: string; done: boolean; active: boolean; }

function buildSteps(booking: PlayerBooking): StepConfig[] {
  const created = new Date(booking.createdAt).toLocaleString("es-AR", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
  const isConfirmed = booking.status === "confirmed";
  const isCancelled = booking.status === "cancelled" || booking.status === "rejected";
  return [
    { label: "Reserva Creada",     detail: created,                                                                                                      done: true,        active: false },
    { label: "Enviada al Complejo",detail: "Tu solicitud fue recibida",                                                                                   done: true,        active: false },
    { label: "Reserva Aceptada",   detail: isConfirmed ? "El complejo confirmó tu reserva" : isCancelled ? "No fue aceptada" : "En revisión por el complejo", done: isConfirmed, active: booking.status === "pending" },
    { label: "Lista para Jugar",   detail: isConfirmed ? `${booking.date} · ${booking.startTime}` : "Esperando el horario del partido",                   done: isConfirmed, active: false },
  ];
}

function VerticalStepper({ booking }: { booking: PlayerBooking }) {
  const steps = buildSteps(booking);
  return (
    <div className="space-y-0">
      {steps.map((step, idx) => {
        const isLast = idx === steps.length - 1;
        return (
          <div key={idx} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors ${step.done ? "bg-[#4be176] text-[#003915]" : step.active ? "border-2 border-[#4be176] bg-transparent text-[#4be176]" : "border-2 border-[#1d3b52] bg-transparent text-[#4a6a82]"}`}>
                {step.done ? <CheckCircle2 className="h-4 w-4" /> : step.active ? <Clock className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
              </div>
              {!isLast && <div className={`my-1 w-0.5 flex-1 rounded-full ${step.done ? "bg-[#4be176]/50" : "bg-[#1d3b52]"}`} style={{ minHeight: "24px" }} />}
            </div>
            <div className="pb-5">
              <p className={`text-sm font-bold ${step.done ? "text-white" : step.active ? "text-[#f97316]" : "text-[#4a6a82]"}`}>{step.label}</p>
              <p className="text-[11px] text-[#6b7f8c]">{step.detail}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DetailRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[#1a2e3a] last:border-0">
      <span className="text-sm text-[#6b7f8c]">{label}</span>
      <span className={`text-sm font-semibold ${highlight ? "text-[#4be176] text-base font-black" : "text-white"}`}>{value}</span>
    </div>
  );
}

export function BookingDetailSidebar({ booking, isOpen, onClose }: BookingDetailSidebarProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape" && isOpen) onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!booking) return null;

  const surfaceLabel = SURFACE_LABELS[booking.pitch.surface] ?? booking.pitch.surface;
  const formatLabel  = FORMAT_LABELS[booking.pitch.type]     ?? booking.pitch.type;

  return (
    <>
      {/* Backdrop */}
      <div aria-hidden="true" onClick={onClose} className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"}`} />

      {/* Panel */}
      <div ref={panelRef} role="dialog" aria-modal="true" aria-label="Detalles de Reserva"
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col border-l border-[#1a2e3a] bg-[#0b1a25] shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#1a2e3a] px-5 py-4">
          <div>
            <h2 className="text-base font-black text-white">Detalles de Reserva</h2>
            <p className="text-[11px] font-mono text-[#4a6a82]">ID: {booking.code}</p>
          </div>
          <button id="booking-detail-close" onClick={onClose} aria-label="Cerrar panel" className="flex h-8 w-8 items-center justify-center rounded-xl text-[#4a6a82] transition hover:bg-[#1a2e3a] hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          <section><VerticalStepper booking={booking} /></section>

          {/* Venue card */}
          <section className="rounded-2xl border border-[#1a2e3a] bg-[#071521] overflow-hidden">
            <div className="flex items-start gap-3 p-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={getPitchImage(booking.id)} alt={booking.venue.name} className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0">
                <h3 className="font-black text-white leading-tight">{booking.venue.name}</h3>
                <p className="text-[12px] text-[#6b7f8c] mt-0.5">{booking.venue.address}{booking.venue.city ? `, ${booking.venue.city}` : ""}</p>
                <button id="booking-detail-map" className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-[#4be176] transition hover:text-[#6bfe8f]">
                  <MapPin className="h-3 w-3" /> Ver en Mapa
                </button>
              </div>
            </div>
          </section>

          {/* Detail rows */}
          <section className="rounded-2xl border border-[#1a2e3a] bg-[#071521] px-4 py-1">
            <DetailRow label="Cancha"      value={booking.pitch.name} />
            <DetailRow label="Tipo"        value={`${surfaceLabel} (${formatLabel})`} />
            <DetailRow label="Fecha"       value={booking.date} />
            <DetailRow label="Horario"     value={`${booking.startTime} – ${booking.endTime}`} />
            <DetailRow label="Duración"    value={`${booking.durationMinutes} min`} />
            <DetailRow label="Monto Total" value={`$${booking.totalAmount.toLocaleString("es-AR")}`} highlight />
          </section>

          {/* Venue notes */}
          {booking.venue.notes && (
            <section>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#4a6a82]">Notas del Complejo</p>
              <div className="rounded-xl border-l-2 border-[#4be176]/40 bg-[#071521] px-4 py-3">
                <p className="text-[13px] italic text-[#9fb3c5] leading-relaxed">"{booking.venue.notes}"</p>
              </div>
            </section>
          )}
        </div>

        {/* Sticky bottom */}
        <div className="border-t border-[#1a2e3a] bg-[#0b1a25] px-4 py-4 space-y-2">
          <button id="booking-detail-download-qr" className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#4be176] text-sm font-black text-[#003915] transition hover:bg-[#6bfe8f] active:scale-[0.98]">
            <Download className="h-4 w-4" /> DESCARGAR QR
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button id="booking-detail-contact" className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-[#1d3b52] bg-[#071521] text-[12px] font-bold text-[#d7e8f2] transition hover:bg-[#0d2217] active:scale-[0.97]">
              <PhoneCall className="h-3.5 w-3.5" /> CONTACTAR
            </button>
            <button id="booking-detail-share" className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-[#1d3b52] bg-[#071521] text-[12px] font-bold text-[#d7e8f2] transition hover:bg-[#0d2217] active:scale-[0.97]">
              <Share2 className="h-3.5 w-3.5" /> COMPARTIR
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
