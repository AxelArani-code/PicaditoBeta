"use client";

// ─────────────────────────────────────────────────────────────────────────────
// mi-complejo/page.tsx
// Muestra los datos reales del primer venue del admin desde /api/admin/venues.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import {
  Building2,
  Grid3x3,
  Mail,
  MapPin,
  MessageCircle,
  Pencil,
  Phone,
  RefreshCw,
} from "lucide-react";
import type { AdminVenue, AdminPitch } from "@/types/admin";

// ── Helpers ───────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  FiveV5:    "Fútbol 5",
  SevenV7:   "Fútbol 7",
  NineV9:    "Fútbol 9",
  ElevenV11: "Fútbol 11",
  Padel:     "Pádel",
};

const SURFACE_LABELS: Record<string, string> = {
  natural:   "Pasto Natural",
  sintetico: "Césped Sintético",
  cemento:   "Cemento",
};

function formatPrice(n: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(n);
}

// ── Sub-components ────────────────────────────────────────────────────────────

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | null;
}) {
  return (
    <div className="flex items-start gap-4 px-6 py-5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#67a6d8]" />
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-[#7890a3]">{label}</p>
        <p className="mt-1 text-[13px] font-medium text-white">{value ?? "—"}</p>
      </div>
    </div>
  );
}

function PitchCard({ pitch }: { pitch: AdminPitch }) {
  return (
    <div className="rounded-xl border border-[#1d3b52] bg-[#071521] p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-black text-white">{pitch.name}</p>
          <p className="mt-0.5 text-[11px] text-[#7890a3]">
            {TYPE_LABELS[pitch.type] ?? pitch.type} · {SURFACE_LABELS[pitch.surface ?? ""] ?? pitch.surface ?? "—"}
          </p>
        </div>
        <span
          className={[
            "shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-bold",
            pitch.isActive
              ? "border-[#4be176]/50 bg-[#4be176]/10 text-[#4be176]"
              : "border-[#ff6b6b]/40 bg-[#ff6b6b]/10 text-[#ff6b6b]",
          ].join(" ")}
        >
          {pitch.isActive ? "Activa" : "Inactiva"}
        </span>
      </div>
      <p className="mt-3 text-[13px] font-bold text-[#4be176]">
        {formatPrice(pitch.pricePerHour)} / hora
      </p>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-xl border border-[#1d3b52] bg-[#102a40]/90 p-8">
        <div className="mb-4 h-12 w-12 animate-pulse rounded-xl bg-[#1d3b52]" />
        <div className="h-6 w-48 animate-pulse rounded bg-[#1d3b52]" />
        <div className="mt-2 h-4 w-32 animate-pulse rounded bg-[#1d3b52]/70" />
      </div>
      <div className="overflow-hidden rounded-xl border border-[#1d3b52] bg-[#102a40]/90">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex gap-4 border-b border-[#1d3b52] px-6 py-5 last:border-0"
          >
            <div className="mt-0.5 h-4 w-4 animate-pulse rounded bg-[#1d3b52]" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-16 animate-pulse rounded bg-[#1d3b52]/70" />
              <div className="h-4 w-40 animate-pulse rounded bg-[#1d3b52]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MiComplejoPage() {
  const [venue,     setVenue]     = useState<AdminVenue | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  async function fetchVenue() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/venues", {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? `HTTP ${res.status}`);
      }

      const data = await res.json();
      const first: AdminVenue | undefined = data?.items?.[0];
      setVenue(first ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar los datos del complejo");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { fetchVenue(); }, []);

  return (
    <div className="min-h-full bg-[#07111d] px-4 py-8 sm:px-6 lg:px-8 text-[#d7e8f2]">
      <div className="mx-auto max-w-3xl">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">Mi complejo</h1>
            <p className="mt-2 text-sm text-[#9fb3c5]">Los datos que ven tus clientes.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchVenue}
              disabled={isLoading}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[#1d3b52] px-4 text-sm font-semibold text-[#7890a3] transition hover:border-[#2d5a73] hover:text-white disabled:opacity-40"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
            <button
              type="button"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#4be176] px-6 text-sm font-bold text-[#003915] transition hover:bg-[#6bfe8f]"
            >
              <Pencil className="h-4 w-4" />
              Editar datos
            </button>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <Skeleton />
        ) : error ? (
          <div className="rounded-xl border border-[#ff6b6b]/30 bg-[#ff6b6b]/10 px-5 py-4">
            <p className="text-sm font-bold text-[#ff6b6b]">{error}</p>
            <button
              type="button"
              onClick={fetchVenue}
              className="mt-2 text-sm text-[#ff9999] underline"
            >
              Reintentar
            </button>
          </div>
        ) : !venue ? (
          <div className="rounded-xl border border-[#1d3b52] bg-[#102a40]/90 py-16 text-center">
            <Building2 className="mx-auto mb-3 h-10 w-10 text-[#2d5a73]" strokeWidth={1.4} />
            <p className="text-sm font-bold text-white">Sin complejo registrado</p>
            <p className="mt-1 text-[12px] text-[#4a6a82]">
              No se encontraron complejos asociados a tu cuenta.
            </p>
          </div>
        ) : (
          <div className="space-y-6">

            {/* Header card */}
            <div className="overflow-hidden rounded-xl border border-[#1d3b52] bg-[#102a40]/90 p-8 text-center sm:text-left">
              <div className="mb-6 flex justify-center sm:justify-start">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0b1b28]/50 text-[#67a6d8]">
                  <Building2 className="h-6 w-6" />
                </div>
              </div>
              <h2 className="text-xl font-black text-white">{venue.name}</h2>
              <p className="mt-1 text-sm text-[#7890a3]">
                {[venue.address, venue.city].filter(Boolean).join(", ")}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-[#4be176]/40 bg-[#4be176]/10 px-3 py-1 text-[11px] font-bold text-[#4be176]">
                  {venue.pitchCount} {venue.pitchCount === 1 ? "cancha" : "canchas"}
                </span>
              </div>
            </div>

            {/* Details card */}
            <div className="overflow-hidden rounded-xl border border-[#1d3b52] bg-[#102a40]/90">
              <div className="divide-y divide-[#1d3b52]">
                <InfoRow icon={Building2} label="Nombre"     value={venue.name} />
                <InfoRow icon={MapPin}    label="Dirección"  value={[venue.address, venue.city].filter(Boolean).join(", ")} />
                <InfoRow icon={Phone}     label="Teléfono"   value={venue.phone} />
                <InfoRow icon={Mail}      label="Email"      value={venue.email} />
                {venue.whatsapp && (
                  <InfoRow icon={MessageCircle} label="WhatsApp" value={venue.whatsapp} />
                )}
                <InfoRow
                  icon={Grid3x3}
                  label="Canchas"
                  value={`${venue.pitchCount} ${venue.pitchCount === 1 ? "cancha" : "canchas"} registradas`}
                />
              </div>
            </div>

            {/* Pitches grid */}
            {venue.pitches.length > 0 && (
              <div>
                <h3 className="mb-3 text-[11px] font-black uppercase tracking-widest text-[#4a6a82]">
                  Canchas del complejo
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {venue.pitches.map((p) => (
                    <PitchCard key={p.id} pitch={p} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
