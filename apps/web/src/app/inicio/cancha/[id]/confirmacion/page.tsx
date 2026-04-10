"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import type { ComponentType } from "react";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { getAccessToken, buildAuthHeaders } from "@/lib/auth/session";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
  MapPin,
  PartyPopper,
  RotateCcw,
  ShieldCheck,
  Store,
  Users,
  X,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ToastState = {
  visible: boolean;
  type: "success" | "error";
  message: string;
};

type BookingInfo = {
  id: string;
  venueName: string;
  dateLabel: string;
  timeLabel: string;
  priceFmt: string;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Converts an ISO date "YYYY-MM-DD" + startTime/endTime "HH:MM" into
 * the display strings used in the UI.
 *
 * date label  → "Viernes, 02 Jul"
 * time label  → "20:00 – 21:00"
 */
function formatDateLabel(isoDate: string): string {
  if (!isoDate) return "—";
  try {
    const [year, month, day] = isoDate.split("-").map(Number);
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString("es-AR", {
      weekday: "long",
      day: "2-digit",
      month: "short",
    });
  } catch {
    return isoDate;
  }
}

// ─── Success Modal ───────────────────────────────────────────────────────────

function SuccessModal({
  booking,
  onClose,
}: {
  booking: BookingInfo;
  onClose: () => void;
}) {
  // Trap focus & close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[#4be176]/30 bg-[#0d1117] shadow-[0_30px_80px_rgba(75,225,118,0.20)]">
        {/* Glow accent top */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#4be176] to-transparent" />

        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-4 top-4 rounded-full p-1.5 text-white/40 transition hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-8">
          {/* Icon */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#4be176]/15 ring-4 ring-[#4be176]/20">
            <PartyPopper className="h-8 w-8 text-[#4be176]" />
          </div>

          {/* Title */}
          <h2
            id="modal-title"
            className="mt-5 text-center text-2xl font-black text-white"
          >
            ¡Turno solicitado!
          </h2>
          <p className="mt-2 text-center text-sm leading-relaxed text-[#8b949e]">
            Tu solicitud fue enviada con éxito. El complejo la confirmará a la brevedad.
          </p>

          {/* Booking details */}
          <div className="mt-6 space-y-3 rounded-xl border border-[#1e3a5f] bg-[#161b22] p-4">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-[#8b949e]">Cancha</span>
              <span className="font-bold text-white">{booking.venueName}</span>
            </div>
            <div className="h-px bg-[#1e3a5f]" />
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-[#8b949e]">Fecha</span>
              <span className="font-bold capitalize text-white">{booking.dateLabel}</span>
            </div>
            <div className="h-px bg-[#1e3a5f]" />
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-[#8b949e]">Horario</span>
              <span className="font-bold text-white">{booking.timeLabel}</span>
            </div>
            <div className="h-px bg-[#1e3a5f]" />
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-[#8b949e]">Total a pagar</span>
              <span className="font-black text-[#4be176]">{booking.priceFmt}</span>
            </div>
            <div className="h-px bg-[#1e3a5f]" />
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-[#8b949e]">N° reserva</span>
              <span className="font-mono text-xs text-white/50">{booking.id.slice(0, 8).toUpperCase()}</span>
            </div>
          </div>

          {/* Notice */}
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-[#4be176]/20 bg-[#4be176]/5 p-3">
            <Store className="mt-0.5 h-4 w-4 shrink-0 text-[#4be176]" />
            <p className="text-xs leading-snug text-[#8b949e]">
              <span className="font-bold text-[#4be176]">Pago presencial.</span>{" "}
              Abonás en el complejo el día del encuentro.
            </p>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/mis-partidos"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#4be176] py-3 text-sm font-black text-[#0d1117] shadow-[0_8px_28px_rgba(75,225,118,0.25)] transition hover:brightness-110"
            >
              Ver mis partidos
            </Link>
            <button
              onClick={onClose}
              className="rounded-xl border border-[#1e3a5f] py-3 text-sm font-semibold text-[#8b949e] transition hover:border-[#4be176]/40 hover:text-white"
            >
              Quedarme en esta página
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Toast Component ──────────────────────────────────────────────────────────

function Toast({ toast }: { toast: ToastState }) {
  if (!toast.visible) return null;
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-xl border px-5 py-3.5 text-sm font-bold shadow-2xl transition-all duration-300 ${
        toast.type === "success"
          ? "border-[#4be176]/40 bg-[#0e2a1a] text-[#4be176]"
          : "border-red-500/40 bg-[#2a0e0e] text-red-400"
      }`}
    >
      {toast.type === "success" ? (
        <CheckCircle2 className="h-5 w-5 shrink-0" />
      ) : (
        <span className="h-5 w-5 shrink-0 text-center leading-5">✕</span>
      )}
      {toast.message}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BookingConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const pitchId = params.id as string;

  // ── Read ALL data from query params (set by TurnosClient) ─────────────────
  const slotId     = searchParams.get("slot_id")    ?? "";
  const isoDate    = searchParams.get("date")        ?? "";
  const startTime  = searchParams.get("start_time")  ?? "—";
  const endTime    = searchParams.get("end_time")    ?? "—";
  const priceFmt   = searchParams.get("price_fmt")   ?? "—";
  const pitchName  = searchParams.get("pitch_name")  ?? "—";
  const venueName  = searchParams.get("venue_name")  ?? "—";
  const venueCity  = searchParams.get("venue_city")  ?? "";
  const venueAddr  = searchParams.get("venue_addr")  ?? "";
  const pitchType  = searchParams.get("pitch_type")  ?? "—";
  const surfaceStr = searchParams.get("surface")     ?? "—";
  const imgSrc     = searchParams.get("img")         ?? "";

  // Derived display values
  const dateLabel = formatDateLabel(isoDate);
  const timeLabel = startTime !== "—" ? `${startTime} – ${endTime}` : "—";
  const cityLabel = [venueAddr, venueCity].filter(Boolean).join(", ") || "—";

  // ── State ─────────────────────────────────────────────────────────────────
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successBooking, setSuccessBooking] = useState<BookingInfo | null>(null);
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    type: "success",
    message: "",
  });

  const showToast = useCallback(
    (type: "success" | "error", message: string) => {
      setToast({ visible: true, type, message });
    },
    []
  );

  // Auto-hide toast after 4 s
  useEffect(() => {
    if (!toast.visible) return;
    const id = setTimeout(
      () => setToast((t) => ({ ...t, visible: false })),
      4000
    );
    return () => clearTimeout(id);
  }, [toast.visible]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  async function handleConfirm() {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const payload = {
      slot_id: slotId,
    };

    console.group("🟡 [Confirmar Reserva] Click");
    console.log("📦 Payload enviado:", payload);
    console.log("🍪 Cookies visibles en browser:", document.cookie || "(vacías — probablemente todas httpOnly)");

    // ── Pre-flight: verificar sesión desde el cliente antes de llamar a la API ─
    const supabase = createClient();
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    const { data: userData,    error: userError    } = await supabase.auth.getUser();
    const localToken = getAccessToken();

    console.group("🔐 Pre-flight — Estado de sesión (Supabase SDK client)");
    console.log("getSession() →", {
      accessToken:  sessionData?.session?.access_token
        ? sessionData.session.access_token.slice(0, 40) + "…"
        : null,
      refreshToken: sessionData?.session?.refresh_token ? "[presente]" : null,
      expiresAt:    sessionData?.session?.expires_at
        ? new Date(sessionData.session.expires_at * 1000).toISOString()
        : null,
      error:        sessionError?.message ?? null,
    });
    console.log("getUser()    →", {
      userId: userData?.user?.id    ?? null,
      email:  userData?.user?.email ?? null,
      error:  userError?.message    ?? null,
    });
    console.log("localStorage token →", localToken ? localToken.slice(0, 40) + "…" : null);
    console.groupEnd();

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: buildAuthHeaders(),   // ✅ envía Authorization: Bearer <token>
        body: JSON.stringify(payload),
      });

      console.log("📡 HTTP Status:", res.status, res.statusText);

      const responseData = await res.json().catch(() => ({ _parseError: true }));
      console.log("📨 Respuesta JSON:", responseData);

      if (!res.ok) {
        console.error("❌ Error de la API:", responseData);
        console.groupEnd();
        throw new Error(
          (responseData as { error?: string }).error ?? "Error al confirmar"
        );
      }

      console.log("✅ Reserva creada:", responseData);
      console.groupEnd();

      // ✅ Mostrar el modal de éxito — sin redirigir
      const bookingData = (responseData as { booking?: { id?: string } }).booking;
      setSuccessBooking({
        id:        bookingData?.id ?? "—",
        venueName: venueName,
        dateLabel: dateLabel,
        timeLabel: timeLabel,
        priceFmt:  priceFmt,
      });
      setIsSubmitting(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Ocurrió un error inesperado";
      console.error("💥 Catch error:", err);
      console.groupEnd();
      showToast("error", message);
      setIsSubmitting(false);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <main className="relative overflow-hidden">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute right-0 top-12 h-80 w-80 rounded-full bg-[#4be176]/10 blur-[90px] md:h-[460px] md:w-[460px]" />
        <div className="pointer-events-none absolute bottom-24 left-0 h-64 w-64 rounded-full bg-[#3b82f6]/10 blur-[90px]" />

        <section className="mx-auto max-w-7xl px-4 pb-10 pt-5 sm:px-6 sm:pb-12 sm:pt-7 lg:px-8">

          {/* ── Header ────────────────────────────────────────────────────── */}
          <header className="mb-7 flex items-center justify-between gap-4 sm:mb-9">
            <div className="flex min-w-0 items-center gap-3 sm:gap-5">
              <Link
                href={`/inicio/cancha/${pitchId}/turnos`}
                aria-label="Volver a selección de turnos"
                className="shrink-0 rounded-full p-2 text-white/90 transition hover:bg-[#4be176]/10 hover:text-[#4be176]"
              >
                <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" />
              </Link>
              <Link
                href="/inicio"
                className="truncate text-2xl font-black italic tracking-tight text-white sm:text-3xl"
              >
                Picadito
              </Link>
            </div>

            <div className="flex shrink-0 items-center gap-2 rounded-full border border-[#22d3ee]/30 bg-[#4be176]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[#4be176] sm:px-4 sm:text-xs">
              <span className="h-2.5 w-2.5 rounded-full bg-[#4be176]" />
              <span className="hidden min-[380px]:inline">Reserva activa</span>
              <span className="min-[380px]:hidden">Activa</span>
            </div>
          </header>

          {/* ── Two-column grid ───────────────────────────────────────────── */}
          <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(350px,0.48fr)] xl:gap-9">

            {/* ── LEFT: Venue details ───────────────────────────────────── */}
            <section>
              <div className="mb-6 sm:mb-7">
                <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-[42px]">
                  Finalizar Reserva
                </h1>
                <p className="mt-3 max-w-3xl text-base leading-relaxed text-[#8b949e] sm:text-lg">
                  Revisá los detalles de tu próximo encuentro antes de confirmar.
                </p>
              </div>

              {/* Venue Card */}
              <article className="overflow-hidden rounded-xl border border-[#1e3a5f] bg-[#161b22] shadow-2xl shadow-black/20">
                {/* Image */}
                <div className="relative h-[190px] overflow-hidden sm:h-[230px] lg:h-[260px]">
                  {imgSrc ? (
                    <img
                      src={imgSrc}
                      alt={venueName}
                      className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                  ) : (
                    /* Fallback gradient when no image is available */
                    <div className="h-full w-full bg-gradient-to-br from-[#0e2a3a] via-[#0d1117] to-[#071b28]" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#161b22] via-black/30 to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5 sm:bottom-7 sm:left-7">
                    <span className="rounded-md bg-[#4be176] px-3 py-1 text-xs font-black uppercase tracking-wide text-[#0d1117]">
                      {pitchType}
                    </span>
                    <h2 className="mt-3 max-w-2xl text-2xl font-black leading-tight text-white sm:text-3xl">
                      {venueName}
                    </h2>
                    {pitchName && pitchName !== venueName && (
                      <p className="mt-1 text-sm font-semibold text-white/60">
                        {pitchName}
                      </p>
                    )}
                  </div>
                </div>

                {/* Detail grid */}
                <div className="grid gap-5 px-5 py-5 sm:grid-cols-2 sm:px-7 lg:grid-cols-4">
                  <DetailItem
                    icon={CalendarDays}
                    label="Fecha"
                    value={dateLabel}
                  />
                  <DetailItem
                    icon={Clock3}
                    label="Horario"
                    value={timeLabel}
                  />
                  <DetailItem
                    icon={Users}
                    label="Modalidad"
                    value={pitchType}
                  />
                  <DetailItem
                    icon={MapPin}
                    label="Ciudad"
                    value={cityLabel}
                  />
                </div>
              </article>

              {/* Surface badge (extra info) */}
              {surfaceStr && surfaceStr !== "—" && (
                <div className="mt-4 flex items-center gap-2">
                  <span className="rounded-full border border-[#1e3a5f] bg-[#161b22] px-3 py-1 text-xs font-semibold text-[#8b949e]">
                    Superficie: <span className="text-white">{surfaceStr}</span>
                  </span>
                </div>
              )}

              {/* In-person payment notice — mobile */}
              <div className="mt-6 flex items-start gap-3 rounded-xl border border-[#4be176]/20 bg-[#4be176]/5 p-4 lg:hidden">
                <Store className="mt-0.5 h-5 w-5 shrink-0 text-[#4be176]" />
                <p className="text-sm font-semibold leading-snug text-[#8b949e]">
                  <span className="font-black text-[#4be176]">
                    Pago presencial.
                  </span>{" "}
                  Abonás en el complejo el día del encuentro. No se requiere
                  pago anticipado.
                </p>
              </div>
            </section>

            {/* ── RIGHT: Summary & CTA ─────────────────────────────────── */}
            <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
              <section className="rounded-xl border-2 border-[#22d3ee]/50 bg-[#0e1f30] p-5 shadow-2xl shadow-[#22d3ee]/10 sm:p-7">
                <h2 className="text-2xl font-black sm:text-3xl">
                  Desglose del Pago
                </h2>

                {/* Line items */}
                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between gap-4 text-base text-[#8b949e] sm:text-lg">
                    <span>Alquiler de cancha (60 min)</span>
                    <span className="shrink-0 font-semibold text-white">
                      {priceFmt}
                    </span>
                  </div>
                </div>

                <div className="my-6 h-px bg-[#1e3a5f]" />

                {/* Total */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.24em] text-[#4be176] sm:text-sm">
                      Total a Pagar
                    </p>
                    <p className="mt-2 text-5xl font-black tracking-tight text-white sm:text-6xl">
                      {priceFmt}
                    </p>
                  </div>
                </div>

                {/* In-person notice — desktop */}
                <div className="mt-6 hidden items-start gap-3 rounded-xl border border-[#4be176]/20 bg-[#4be176]/5 p-4 lg:flex">
                  <Store className="mt-0.5 h-5 w-5 shrink-0 text-[#4be176]" />
                  <p className="text-sm font-semibold leading-snug text-[#8b949e]">
                    <span className="font-black text-[#4be176]">
                      Pago presencial.
                    </span>{" "}
                    Abonás en el complejo el día del encuentro. No se requiere
                    pago anticipado.
                  </p>
                </div>

                {/* CTA */}
                <button
                  id="btn-confirmar-reserva"
                  onClick={handleConfirm}
                  disabled={isSubmitting}
                  className="mt-7 flex w-full items-center justify-center gap-3 rounded-xl bg-[#4be176] px-5 py-4 text-base font-black text-[#0d1117] shadow-[0_18px_40px_rgba(75,225,118,0.30)] transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:text-lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Confirmando…
                    </>
                  ) : (
                    "Confirmar Reserva"
                  )}
                </button>

                <p className="mx-auto mt-5 max-w-lg text-center text-sm font-semibold leading-tight text-[#8b949e]">
                  Al confirmar, aceptás nuestras{" "}
                  <Link href="#" className="text-[#4be176] hover:underline">
                    Políticas de Cancelación
                  </Link>{" "}
                  y Términos de Servicio.
                </p>
              </section>

              {/* Trust tiles */}
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoTile icon={ShieldCheck} title="Reserva Segura" />
                <InfoTile icon={RotateCcw} title="Cancelación 24h" />
              </div>
            </aside>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1e3a5f] bg-[#161b22] px-5 py-10 text-white sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xl font-black sm:text-2xl">Picadito</p>
            <p className="mt-4 text-xs uppercase tracking-[0.2em] text-[#4be176] sm:text-sm">
              © 2024 Picadito by Triasoft. All rights reserved.
            </p>
          </div>
          <div className="flex flex-wrap gap-5 text-xs font-semibold uppercase tracking-[0.2em] text-[#4be176] sm:gap-8 sm:text-sm">
            <Link href="#" className="transition-colors hover:text-white">Privacy</Link>
            <Link href="#" className="transition-colors hover:text-white">Terms</Link>
            <Link href="#" className="transition-colors hover:text-white">Support</Link>
          </div>
        </div>
      </footer>

      <Toast toast={toast} />

      {/* ── Success modal ── */}
      {successBooking && (
        <SuccessModal
          booking={successBooking}
          onClose={() => setSuccessBooking(null)}
        />
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 text-xs font-black uppercase text-[#4be176] sm:text-sm">
        <Icon className="h-4 w-4 text-[#4be176]" />
        {label}
      </div>
      <p className="mt-2 text-base font-semibold text-white sm:text-lg">
        {value}
      </p>
    </div>
  );
}

function InfoTile({
  icon: Icon,
  title,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
}) {
  return (
    <div className="flex h-24 flex-col items-center justify-center gap-2 rounded-lg border border-[#1e3a5f] bg-[#161b22] text-center sm:h-28">
      <Icon className="h-6 w-6 text-[#4be176]" />
      <p className="text-sm font-black text-white sm:text-base">{title}</p>
    </div>
  );
}
