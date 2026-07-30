"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BanIcon,
  CalendarX2,
  ChevronRight,
  Loader2,
  MapPin,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ShieldAlert,
  Wrench,
  Palmtree,
  Clock,
} from "lucide-react";
import { getVenueClosures, createVenueClosure } from "@/services/venueClosures.service";
import { getAccessToken } from "@/lib/auth/session";
import type { VenueClosure, PitchOption } from "@/types/venueClosures";

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-");
  const months = [
    "ene", "feb", "mar", "abr", "may", "jun",
    "jul", "ago", "sep", "oct", "nov", "dic",
  ];
  return `${day} ${months[Number(month) - 1]} ${year}`;
}

function getReasonIcon(reason: string) {
  const lower = reason.toLowerCase();
  if (lower.includes("manteni")) return Wrench;
  if (lower.includes("feria") || lower.includes("holiday")) return Palmtree;
  return ShieldAlert;
}

function getReasonColor(reason: string): string {
  const lower = reason.toLowerCase();
  if (lower.includes("manteni")) return "#f59e0b"; // amber
  if (lower.includes("feria") || lower.includes("holiday")) return "#60a5fa"; // blue
  return "#a78bfa"; // purple default
}

// ── Toast ──────────────────────────────────────────────────────────────────────

type ToastType = "success" | "error";

interface ToastState {
  type: ToastType;
  message: string;
  id: number;
}

function Toast({ toast, onDismiss }: { toast: ToastState; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss, toast.id]);

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 rounded-2xl px-5 py-3.5 shadow-2xl shadow-black/50 transition-all animate-in slide-in-from-bottom-4 duration-300 ${
        toast.type === "success"
          ? "border border-[#4be176]/30 bg-[#0a2515]"
          : "border border-red-500/30 bg-[#1a0505]"
      }`}
    >
      {toast.type === "success" ? (
        <CheckCircle2 className="h-4 w-4 shrink-0 text-[#4be176]" />
      ) : (
        <XCircle className="h-4 w-4 shrink-0 text-red-400" />
      )}
      <span
        className={`text-sm font-semibold ${
          toast.type === "success" ? "text-[#a7f3c4]" : "text-red-300"
        }`}
      >
        {toast.message}
      </span>
      <button
        onClick={onDismiss}
        aria-label="Cerrar notificación"
        className="ml-1 text-[#4a5a6a] transition hover:text-white"
      >
        ×
      </button>
    </div>
  );
}

// ── Closure Card ───────────────────────────────────────────────────────────────

function ClosureCard({
  closure,
  pitches,
}: {
  closure: VenueClosure;
  pitches: PitchOption[];
}) {
  const pitch = pitches.find((p) => p.id === closure.pitchId);
  const pitchName = closure.pitchName ?? pitch?.name ?? "Cancha";
  const ReasonIcon = getReasonIcon(closure.reason);
  const accentColor = getReasonColor(closure.reason);

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[#1a2d3d] bg-[#0c1823] transition-all hover:border-[#1d3b52] hover:bg-[#0e1f30]">
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-0 h-full w-1 rounded-l-2xl"
        style={{ backgroundColor: accentColor }}
      />

      <div className="flex items-center gap-4 px-5 py-4 pl-6">
        {/* Icon */}
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${accentColor}18` }}
        >
          <ReasonIcon className="h-4 w-4" style={{ color: accentColor }} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-bold text-white">{closure.reason}</p>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#5a8099]">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3 shrink-0" />
              {pitchName}
            </span>
            <span className="flex items-center gap-1">
              <CalendarX2 className="h-3 w-3 shrink-0" />
              {formatDate(closure.closureDate)}
            </span>
            {closure.startTime === null ? (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3 shrink-0" />
                Todo el día
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3 shrink-0" />
                {closure.startTime} – {closure.endTime}
              </span>
            )}
          </div>
        </div>

        {/* Badge */}
        <span
          className="shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider"
          style={{ backgroundColor: `${accentColor}18`, color: accentColor }}
        >
          Bloqueado
        </span>
      </div>
    </div>
  );
}

// ── Empty state ────────────────────────────────────────────────────────────────

function ClosuresEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[#1a2d3d] bg-[#0c1823]/60 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#1a2d3d] bg-[#07111d]">
        <CalendarX2 className="h-5 w-5 text-[#3a5a6a]" />
      </div>
      <div>
        <p className="text-sm font-bold text-[#4a6a7a]">Sin cierres activos</p>
        <p className="mt-0.5 text-xs text-[#2a4a5a]">
          Las fechas que bloquees aparecerán aquí.
        </p>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function VenueClosuresManager() {
  // ── Pitches ────────────────────────────────────────────────────────────────
  const [pitches, setPitches] = useState<PitchOption[]>([]);
  const [isPitchLoading, setIsPitchLoading] = useState(true);
  const [pitchError, setPitchError] = useState<string | null>(null);

  // ── Form state ─────────────────────────────────────────────────────────────
  const [pitchId, setPitchId] = useState("");
  const [closureDate, setClosureDate] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // ── Closures list ──────────────────────────────────────────────────────────
  const [closures, setClosures] = useState<VenueClosure[]>([]);
  const [isListLoading, setIsListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  // ── Toast ──────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState<ToastState | null>(null);

  // ── Load pitches ───────────────────────────────────────────────────────────
  useEffect(() => {
    setIsPitchLoading(true);
    setPitchError(null);

    const token = getAccessToken();
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    fetch("/api/owner/pitches", { headers })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: {
        venues?: Array<{ id: string; name: string; city: string }>;
        pitches?: Array<{ id: string; name?: string; type?: string; venue_id?: string }>;
        error?: string;
      }) => {
        if (data.error) throw new Error(data.error);

        const venueMap = new Map<string, { name: string; city: string }>();
        for (const v of data.venues ?? []) {
          venueMap.set(v.id, { name: v.name, city: v.city });
        }

        const options: PitchOption[] = (data.pitches ?? []).map((p) => {
          const venue = venueMap.get(p.venue_id ?? "") ?? { name: "", city: "" };
          return {
            id: p.id,
            name: p.name ?? "Cancha",
            type: p.type ?? null,
            venueName: venue.name,
            city: venue.city,
          };
        });

        setPitches(options);

        // Pre-select first pitch
        if (options.length > 0) {
          setPitchId(options[0].id);
        }
      })
      .catch((err: Error) => {
        console.error("[VenueClosures] Error cargando pitches:", err.message);
        setPitchError("No se pudo cargar tus canchas.");
      })
      .finally(() => setIsPitchLoading(false));
  }, []);

  // ── Load closures ──────────────────────────────────────────────────────────
  const loadClosures = useCallback(async () => {
    setIsListLoading(true);
    setListError(null);
    try {
      const result = await getVenueClosures();
      if (result.ok) {
        setClosures(result.data);
      } else {
        setListError(result.error ?? "No se pudieron cargar los cierres.");
        // Keep existing closures visible if we already had data
      }
    } catch (err) {
      // Defensive catch — getVenueClosures should never throw, but just in case
      const msg =
        err instanceof Error ? err.message : "Error inesperado al cargar cierres.";
      console.error("[VenueClosuresManager] Error inesperado en loadClosures:", msg);
      setListError(msg);
    } finally {
      setIsListLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadClosures();
  }, [loadClosures]);

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);

    if (!pitchId) {
      setFormError("Seleccioná una cancha.");
      return;
    }
    if (!closureDate) {
      setFormError("Seleccioná una fecha.");
      return;
    }
    if (!reason.trim()) {
      setFormError("Ingresá un motivo para el cierre.");
      return;
    }

    setIsSubmitting(true);

    const result = await createVenueClosure(
      {
        pitchId,
        closureDate,
        startTime: null,
        endTime: null,
        reason: reason.trim(),
      },
      getAccessToken()
    );

    setIsSubmitting(false);

    if (result.ok) {
      // Reset form
      setClosureDate("");
      setReason("");
      // Show toast
      setToast({ type: "success", message: "Fecha bloqueada correctamente", id: Date.now() });
      // Refresh list
      void loadClosures();
    } else {
      setFormError(result.error);
      setToast({ type: "error", message: result.error, id: Date.now() });
    }
  };

  // ── Today for min date ─────────────────────────────────────────────────────
  const today = new Date().toISOString().split("T")[0];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-full bg-[#07111d] px-4 py-8 text-[#d7e8f2] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-8">

        {/* ── Page header ── */}
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <BanIcon className="h-3.5 w-3.5 text-[#4be176]" />
            <span className="text-[10px] font-black uppercase tracking-[0.22em] text-[#4be176]">
              Gestión de canchas
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            Cierres de Cancha
          </h1>
          <p className="mt-2 text-sm text-[#9fb3c5]">
            Bloqueá fechas completas para mantenimiento, feriados o cualquier evento que
            impida reservas en esos días.
          </p>
        </div>

        {/* ── Creation form ── */}
        <div className="overflow-hidden rounded-2xl border border-[#1a2d3d] bg-[#0c1823]">
          {/* Card header */}
          <div className="flex items-center gap-3 border-b border-[#1a2d3d] bg-[#0a1520]/60 px-6 py-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#4be176]/10">
              <CalendarX2 className="h-4 w-4 text-[#4be176]" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Bloquear fecha</p>
              <p className="text-[11px] text-[#5a8099]">
                El sistema cancelará los turnos disponibles en esa fecha automáticamente.
              </p>
            </div>
          </div>

          {/* Form body */}
          <form onSubmit={handleSubmit} className="space-y-5 p-6">

            {/* Cancha selector */}
            <div className="space-y-1.5">
              <label
                htmlFor="venue-closure-pitch-select"
                className="block text-xs font-bold uppercase tracking-wider text-[#5a8099]"
              >
                Cancha
              </label>
              {isPitchLoading ? (
                <div className="flex items-center gap-2 rounded-xl border border-[#1a2d3d] bg-[#07111d] px-4 py-3">
                  <Loader2 className="h-4 w-4 animate-spin text-[#4be176]" />
                  <span className="text-sm text-[#4a5a4a]">Cargando canchas…</span>
                </div>
              ) : pitchError ? (
                <div className="flex items-center gap-2 rounded-xl border border-red-900/40 bg-red-950/30 px-4 py-3">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                  <span className="text-xs text-red-300">{pitchError}</span>
                </div>
              ) : (
                <div className="relative">
                  <select
                    id="venue-closure-pitch-select"
                    value={pitchId}
                    onChange={(e) => setPitchId(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full appearance-none rounded-xl border border-[#1a2d3d] bg-[#07111d] px-4 py-3 pr-10 text-sm text-white transition focus:border-[#4be176]/40 focus:outline-none focus:ring-2 focus:ring-[#4be176]/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {pitches.length === 0 && (
                      <option value="" disabled>
                        Sin canchas registradas
                      </option>
                    )}
                    {pitches.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}{p.venueName ? ` — ${p.venueName}` : ""}
                      </option>
                    ))}
                  </select>
                  <ChevronRight className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-[#3a5a6a]" />
                </div>
              )}
            </div>

            {/* Date picker */}
            <div className="space-y-1.5">
              <label
                htmlFor="venue-closure-date"
                className="block text-xs font-bold uppercase tracking-wider text-[#5a8099]"
              >
                Fecha de cierre
              </label>
              <input
                id="venue-closure-date"
                type="date"
                value={closureDate}
                min={today}
                onChange={(e) => setClosureDate(e.target.value)}
                disabled={isSubmitting}
                className="w-full rounded-xl border border-[#1a2d3d] bg-[#07111d] px-4 py-3 text-sm text-white [color-scheme:dark] transition focus:border-[#4be176]/40 focus:outline-none focus:ring-2 focus:ring-[#4be176]/10 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* Reason */}
            <div className="space-y-1.5">
              <label
                htmlFor="venue-closure-reason"
                className="block text-xs font-bold uppercase tracking-wider text-[#5a8099]"
              >
                Motivo
              </label>
              <div className="flex gap-2 flex-wrap">
                {["Mantenimiento", "Feriado", "Evento privado", "Otro"].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setReason(preset)}
                    disabled={isSubmitting}
                    className={`rounded-full border px-3 py-1 text-[11px] font-bold transition active:scale-95 disabled:opacity-50 ${
                      reason === preset
                        ? "border-[#4be176]/40 bg-[#4be176]/10 text-[#4be176]"
                        : "border-[#1a2d3d] bg-[#07111d] text-[#5a8099] hover:border-[#1d3b52] hover:text-[#d7e8f2]"
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
              <input
                id="venue-closure-reason"
                type="text"
                value={reason}
                placeholder="Ej: Mantenimiento de césped, Feriado nacional…"
                maxLength={120}
                onChange={(e) => setReason(e.target.value)}
                disabled={isSubmitting}
                className="w-full rounded-xl border border-[#1a2d3d] bg-[#07111d] px-4 py-3 text-sm text-white placeholder:text-[#2a4a5a] transition focus:border-[#4be176]/40 focus:outline-none focus:ring-2 focus:ring-[#4be176]/10 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <p className="text-right text-[10px] text-[#3a5a6a]">
                {reason.length}/120
              </p>
            </div>

            {/* Inline error */}
            {formError && (
              <div className="flex items-center gap-2 rounded-xl border border-red-900/40 bg-red-950/30 px-4 py-3">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                <span className="text-xs text-red-300">{formError}</span>
              </div>
            )}

            {/* Submit */}
            <button
              id="venue-closure-submit"
              type="submit"
              disabled={isSubmitting || isPitchLoading || pitches.length === 0}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#4be176] px-6 py-3 text-sm font-black text-[#021208] shadow-lg shadow-[#4be176]/10 transition hover:bg-[#5cf085] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Bloqueando…
                </>
              ) : (
                <>
                  <BanIcon className="h-4 w-4" />
                  Bloquear Fecha
                </>
              )}
            </button>
          </form>
        </div>

        {/* ── Active closures list ── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-white">Cierres activos</h2>
              <p className="text-xs text-[#5a8099]">
                {closures.length === 0
                  ? "No hay fechas bloqueadas"
                  : `${closures.length} fecha${closures.length !== 1 ? "s" : ""} bloqueada${closures.length !== 1 ? "s" : ""}`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void loadClosures()}
              disabled={isListLoading}
              aria-label="Refrescar lista"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#1a2d3d] bg-[#0c1823] text-[#5a8099] transition hover:border-[#1d3b52] hover:text-[#d7e8f2] disabled:opacity-50 active:scale-95"
            >
              <RefreshCw
                className={`h-4 w-4 ${isListLoading ? "animate-spin" : ""}`}
              />
            </button>
          </div>

          {isListLoading ? (
            <div className="flex items-center justify-center gap-3 rounded-2xl border border-[#1a2d3d] bg-[#0c1823] py-10">
              <Loader2 className="h-5 w-5 animate-spin text-[#4be176]" />
              <span className="text-sm text-[#4a5a4a]">Cargando cierres…</span>
            </div>
          ) : listError ? (
            <div className="flex items-center gap-3 rounded-2xl border border-red-900/40 bg-red-950/30 px-5 py-4">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <p className="text-xs text-red-300">{listError}</p>
            </div>
          ) : closures.length === 0 ? (
            <ClosuresEmptyState />
          ) : (
            <div className="space-y-2">
              {closures.map((c) => (
                <ClosureCard key={c.id} closure={c} pitches={pitches} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Toast ── */}
      {toast && (
        <Toast toast={toast} onDismiss={() => setToast(null)} />
      )}
    </div>
  );
}
