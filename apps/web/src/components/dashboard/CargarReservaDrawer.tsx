"use client";

// ─────────────────────────────────────────────────────────────────────────────
// CargarReservaDrawer.tsx
// Slide-in drawer para crear una reserva manual desde el panel admin.
//
// Flujo:
//   1. El admin elige una cancha (de /api/admin/venues)
//   2. Elige una fecha
//   3. El drawer carga los time_slots disponibles para esa cancha+fecha
//      (directamente de /api/admin/calendar)
//   4. Selecciona un slot → rellena datos del cliente → confirma
//   5. POST a /api/admin/bookings/manual
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import { X, ChevronRight, CalendarDays, Clock, User, Phone, Mail, CheckCircle, Loader2 } from "lucide-react";
import type { AdminVenue, AdminPitch, CalendarSlot } from "@/types/admin";

// ── Types ─────────────────────────────────────────────────────────────────────

type Step = "pitch" | "date-slot" | "client" | "confirm";

interface ClientData {
  name: string;
  email: string;
  phone: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function toISOLocal(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatPrice(n: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(n);
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={[
            "h-1.5 rounded-full transition-all",
            i < current ? "w-6 bg-[#4be176]" : i === current ? "w-4 bg-[#4be176]/60" : "w-2 bg-[#1d3b52]",
          ].join(" ")}
        />
      ))}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-[#4a6a82]">
      {children}
    </p>
  );
}

function SlotButton({
  slot,
  isSelected,
  onClick,
}: {
  slot: CalendarSlot;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "relative flex flex-col rounded-xl border p-3 text-left transition focus:outline-none",
        isSelected
          ? "border-[#4be176]/70 bg-[#0b2637] shadow-[0_0_20px_rgba(75,225,118,0.12)]"
          : "border-[#1d3b52] bg-[#071521] hover:border-[#2d5a73] hover:bg-[#0c1f2e]",
      ].join(" ")}
    >
      {isSelected && (
        <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#4be176] text-[#071b28]">
          <svg className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </span>
      )}
      <span className={`text-base font-black ${isSelected ? "text-[#4be176]" : "text-white"}`}>
        {slot.startTime}
      </span>
      <span className="mt-0.5 text-[11px] text-[#577080]">hasta {slot.endTime}</span>
      <span className={`mt-2 text-[11px] font-bold ${isSelected ? "text-[#4be176]" : "text-[#4be176]/80"}`}>
        {formatPrice(slot.price)}
      </span>
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface CargarReservaDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  /** Optional: pre-select this date on open */
  defaultDate?: string;
  onSuccess?: () => void;
}

export function CargarReservaDrawer({
  isOpen,
  onClose,
  defaultDate,
  onSuccess,
}: CargarReservaDrawerProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Steps: pitch → date-slot → client → confirm
  const [step, setStep]               = useState<Step>("pitch");
  const [venues, setVenues]           = useState<AdminVenue[]>([]);
  const [venuesLoading, setVenuesLoading] = useState(true);

  // Selection state
  const [selectedVenue, setSelectedVenue] = useState<AdminVenue | null>(null);
  const [selectedPitch, setSelectedPitch] = useState<AdminPitch | null>(null);
  const [selectedDate,  setSelectedDate]  = useState(defaultDate ?? toISOLocal(new Date()));
  const [slots,         setSlots]         = useState<CalendarSlot[]>([]);
  const [slotsLoading,  setSlotsLoading]  = useState(false);
  const [selectedSlot,  setSelectedSlot]  = useState<CalendarSlot | null>(null);

  // Client info
  const [client, setClient] = useState<ClientData>({ name: "", email: "", phone: "" });

  // Submit
  const [submitting, setSubmitting]   = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success,     setSuccess]     = useState(false);

  // ── Reset when opened ───────────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      setStep("pitch");
      setSelectedVenue(null);
      setSelectedPitch(null);
      setSelectedDate(defaultDate ?? toISOLocal(new Date()));
      setSlots([]);
      setSelectedSlot(null);
      setClient({ name: "", email: "", phone: "" });
      setSubmitError(null);
      setSuccess(false);
      fetchVenues();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // ── Fetch venues ────────────────────────────────────────────────────────────
  async function fetchVenues() {
    setVenuesLoading(true);
    try {
      const res = await fetch("/api/admin/venues", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setVenues(data.items ?? []);
      }
    } catch (e) {
      console.error("[CargarReservaDrawer] fetchVenues error:", e);
    } finally {
      setVenuesLoading(false);
    }
  }

  // ── Fetch available slots when pitch+date change ────────────────────────────
  async function fetchSlots(pitchId: string, date: string) {
    setSlotsLoading(true);
    setSlots([]);
    setSelectedSlot(null);
    try {
      const res = await fetch(
        `/api/admin/calendar?date=${encodeURIComponent(date)}`,
        { cache: "no-store" }
      );
      if (res.ok) {
        const data = await res.json();
        // Filter only slots for this pitch that are available
        const filtered = (data.slots ?? []).filter(
          (s: CalendarSlot) => s.pitchId === pitchId && s.status === "available"
        );
        setSlots(filtered);
      }
    } catch (e) {
      console.error("[CargarReservaDrawer] fetchSlots error:", e);
    } finally {
      setSlotsLoading(false);
    }
  }

  // ── Handlers ────────────────────────────────────────────────────────────────

  function handlePitchSelect(venue: AdminVenue, pitch: AdminPitch) {
    setSelectedVenue(venue);
    setSelectedPitch(pitch);
    setStep("date-slot");
    fetchSlots(pitch.id, selectedDate);
  }

  function handleDateChange(newDate: string) {
    setSelectedDate(newDate);
    if (selectedPitch) {
      fetchSlots(selectedPitch.id, newDate);
    }
  }

  async function handleSubmit() {
    if (!selectedPitch || !selectedSlot || !client.name) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/admin/bookings/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pitchId:    selectedPitch.id,
          date:       selectedDate,
          startTime:  selectedSlot.startTime,
          endTime:    selectedSlot.endTime,
          totalPrice: selectedSlot.price,
          clientName:  client.name,
          clientEmail: client.email,
          clientPhone: client.phone,
          slotId:      selectedSlot.id,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? `HTTP ${res.status}`);
      }

      setSuccess(true);
      onSuccess?.();
      setTimeout(onClose, 2000);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Error al crear la reserva");
    } finally {
      setSubmitting(false);
    }
  }

  // Close on overlay click
  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) onClose();
  }

  // ── Step index for indicator ────────────────────────────────────────────────
  const stepIndex = { pitch: 0, "date-slot": 1, client: 2, confirm: 3 }[step];

  // ── Render ──────────────────────────────────────────────────────────────────

  if (!isOpen) return null;

  return (
    /* Overlay */
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
      aria-modal="true"
      role="dialog"
      aria-label="Cargar reserva"
    >
      {/* Drawer panel */}
      <div className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-[#071b28] shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1d3b52] px-5 py-4">
          <div>
            <h2 className="text-base font-black text-white">Cargar reserva</h2>
            <div className="mt-2">
              <StepIndicator current={stepIndex} total={4} />
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[#1d3b52] text-[#7890a3] transition hover:border-[#2d5a73] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5">

          {/* ── SUCCESS ─────────────────────────────────────────────────── */}
          {success && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <CheckCircle className="mb-4 h-16 w-16 text-[#4be176]" strokeWidth={1.4} />
              <p className="text-xl font-black text-white">¡Reserva creada!</p>
              <p className="mt-2 text-sm text-[#7890a3]">El turno fue registrado correctamente.</p>
            </div>
          )}

          {/* ── STEP: PITCH ─────────────────────────────────────────────── */}
          {!success && step === "pitch" && (
            <div>
              <SectionLabel>1 · Elegí una cancha</SectionLabel>

              {venuesLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-16 animate-pulse rounded-xl border border-[#1d3b52] bg-[#071521]" />
                  ))}
                </div>
              ) : venues.length === 0 ? (
                <p className="py-8 text-center text-sm text-[#4a6a82]">
                  No hay complejos registrados.
                </p>
              ) : (
                <div className="space-y-4">
                  {venues.map((venue) => (
                    <div key={venue.id}>
                      <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#4be176]">
                        {venue.name}
                      </p>
                      <div className="space-y-2">
                        {venue.pitches.filter((p) => p.isActive).map((pitch) => (
                          <button
                            key={pitch.id}
                            type="button"
                            onClick={() => handlePitchSelect(venue, pitch)}
                            className="flex w-full items-center justify-between rounded-xl border border-[#1d3b52] bg-[#071521] px-4 py-3 text-left transition hover:border-[#2d5a73] hover:bg-[#0c1f2e]"
                          >
                            <div>
                              <p className="text-sm font-bold text-white">{pitch.name}</p>
                              <p className="text-[11px] text-[#7890a3]">
                                {formatPrice(pitch.pricePerHour)} / hora
                              </p>
                            </div>
                            <ChevronRight className="h-4 w-4 shrink-0 text-[#4a6a82]" />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── STEP: DATE + SLOT ───────────────────────────────────────── */}
          {!success && step === "date-slot" && (
            <div>
              {/* Back */}
              <button
                type="button"
                onClick={() => setStep("pitch")}
                className="mb-4 text-[12px] font-semibold text-[#7890a3] transition hover:text-white"
              >
                ← {selectedVenue?.name} · {selectedPitch?.name}
              </button>

              <SectionLabel>2 · Elegí fecha y horario</SectionLabel>

              {/* Date picker */}
              <div className="mb-5">
                <label className="mb-1.5 block text-[11px] font-bold text-[#7890a3]">
                  <CalendarDays className="mb-0.5 mr-1 inline h-3 w-3" />
                  Fecha
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  min={toISOLocal(new Date())}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="w-full rounded-xl border border-[#1d3b52] bg-[#071521] px-4 py-2.5 text-sm font-semibold text-white focus:border-[#4be176]/60 focus:outline-none"
                />
              </div>

              {/* Slots grid */}
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[11px] font-bold text-[#7890a3]">
                  <Clock className="mb-0.5 mr-1 inline h-3 w-3" />
                  Horarios disponibles
                </p>
                {slotsLoading && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-[#4be176]" />
                )}
              </div>

              {slotsLoading ? (
                <div className="grid grid-cols-2 gap-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-20 animate-pulse rounded-xl border border-[#1d3b52] bg-[#071521]" />
                  ))}
                </div>
              ) : slots.length === 0 ? (
                <div className="rounded-xl border border-[#1d3b52] bg-[#071521] py-10 text-center">
                  <p className="text-sm font-bold text-white">Sin horarios disponibles</p>
                  <p className="mt-1 text-[12px] text-[#4a6a82]">Probá con otra fecha.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {slots.map((slot) => (
                    <SlotButton
                      key={slot.id}
                      slot={slot}
                      isSelected={selectedSlot?.id === slot.id}
                      onClick={() => setSelectedSlot(s => s?.id === slot.id ? null : slot)}
                    />
                  ))}
                </div>
              )}

              {selectedSlot && (
                <button
                  type="button"
                  onClick={() => setStep("client")}
                  className="mt-5 w-full rounded-xl bg-[#4be176] py-3 text-sm font-black text-[#003915] transition hover:bg-[#6bfe8f]"
                >
                  Continuar →
                </button>
              )}
            </div>
          )}

          {/* ── STEP: CLIENT INFO ───────────────────────────────────────── */}
          {!success && step === "client" && (
            <div>
              <button
                type="button"
                onClick={() => setStep("date-slot")}
                className="mb-4 text-[12px] font-semibold text-[#7890a3] transition hover:text-white"
              >
                ← {selectedSlot?.startTime} – {selectedSlot?.endTime}
              </button>

              <SectionLabel>3 · Datos del cliente</SectionLabel>

              <div className="space-y-3">
                {/* Name */}
                <div>
                  <label className="mb-1 block text-[11px] font-bold text-[#7890a3]">
                    <User className="mb-0.5 mr-1 inline h-3 w-3" />
                    Nombre *
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Juan Pérez"
                    value={client.name}
                    onChange={(e) => setClient((c) => ({ ...c, name: e.target.value }))}
                    className="w-full rounded-xl border border-[#1d3b52] bg-[#071521] px-4 py-2.5 text-sm text-white placeholder:text-[#4a6a82] focus:border-[#4be176]/60 focus:outline-none"
                  />
                </div>
                {/* Email */}
                <div>
                  <label className="mb-1 block text-[11px] font-bold text-[#7890a3]">
                    <Mail className="mb-0.5 mr-1 inline h-3 w-3" />
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="juan@email.com"
                    value={client.email}
                    onChange={(e) => setClient((c) => ({ ...c, email: e.target.value }))}
                    className="w-full rounded-xl border border-[#1d3b52] bg-[#071521] px-4 py-2.5 text-sm text-white placeholder:text-[#4a6a82] focus:border-[#4be176]/60 focus:outline-none"
                  />
                </div>
                {/* Phone */}
                <div>
                  <label className="mb-1 block text-[11px] font-bold text-[#7890a3]">
                    <Phone className="mb-0.5 mr-1 inline h-3 w-3" />
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    placeholder="Ej: 2604 11-2233"
                    value={client.phone}
                    onChange={(e) => setClient((c) => ({ ...c, phone: e.target.value }))}
                    className="w-full rounded-xl border border-[#1d3b52] bg-[#071521] px-4 py-2.5 text-sm text-white placeholder:text-[#4a6a82] focus:border-[#4be176]/60 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="button"
                disabled={!client.name.trim()}
                onClick={() => setStep("confirm")}
                className="mt-5 w-full rounded-xl bg-[#4be176] py-3 text-sm font-black text-[#003915] transition hover:bg-[#6bfe8f] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Revisar reserva →
              </button>
            </div>
          )}

          {/* ── STEP: CONFIRM ───────────────────────────────────────────── */}
          {!success && step === "confirm" && (
            <div>
              <button
                type="button"
                onClick={() => setStep("client")}
                className="mb-4 text-[12px] font-semibold text-[#7890a3] transition hover:text-white"
              >
                ← Editar datos
              </button>

              <SectionLabel>4 · Confirmá la reserva</SectionLabel>

              {/* Summary card */}
              <div className="overflow-hidden rounded-xl border border-[#1d3b52] bg-[#071521]">
                {[
                  { label: "Complejo",  value: selectedVenue?.name ?? "—" },
                  { label: "Cancha",    value: selectedPitch?.name ?? "—" },
                  { label: "Fecha",     value: selectedDate },
                  { label: "Horario",   value: selectedSlot ? `${selectedSlot.startTime} – ${selectedSlot.endTime}` : "—" },
                  { label: "Cliente",   value: client.name },
                  { label: "Email",     value: client.email || "—" },
                  { label: "Teléfono", value: client.phone || "—" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between border-b border-[#1d3b52] px-4 py-3 last:border-0">
                    <span className="text-[12px] text-[#7890a3]">{label}</span>
                    <span className="text-[13px] font-bold text-white">{value}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between border-t border-[#4be176]/20 bg-[#4be176]/5 px-4 py-3">
                  <span className="text-[12px] font-bold text-[#4be176]">Total</span>
                  <span className="text-base font-black text-[#4be176]">
                    {formatPrice(selectedSlot?.price ?? 0)}
                  </span>
                </div>
              </div>

              {/* Error */}
              {submitError && (
                <p className="mt-3 text-center text-[12px] font-bold text-[#ff6b6b]">
                  {submitError}
                </p>
              )}

              {/* Submit */}
              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmit}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#4be176] py-3.5 text-sm font-black text-[#003915] transition hover:bg-[#6bfe8f] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creando reserva…
                  </>
                ) : (
                  "✓ Confirmar reserva"
                )}
              </button>

              <p className="mt-3 text-center text-[11px] text-[#4a6a82]">
                Se creará como reserva confirmada manualmente.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
