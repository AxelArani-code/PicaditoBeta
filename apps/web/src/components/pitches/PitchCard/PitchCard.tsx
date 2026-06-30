import { MapPin, Star, Layers, Leaf } from "lucide-react";
import Link from "next/link";
import type { PitchWithVenue, PitchSize, TurfType } from "@/types/pitches";

// ── Helpers ───────────────────────────────────────────────────────────────

/** Format an ARS price as integer currency without decimals. */
function formatPrice(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(amount);
}

/** Human-readable label for each pitch size. */
const SIZE_LABELS: Record<PitchSize, string> = {
  f5: "Fútbol 5",
  f7: "Fútbol 7",
  f9: "Fútbol 9",
  f11: "Fútbol 11",
};

/** Human-readable label for each turf type. */
const TURF_LABELS: Record<TurfType, string> = {
  natural: "Césped Natural",
  sintetico: "Césped Sintético",
  cemento: "Cemento",
};

/** Tailwind badge classes per turf type — subtle semantic colour coding. */
const TURF_BADGE: Record<TurfType, string> = {
  natural: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  sintetico: "bg-lime-500/10 text-lime-400 border-lime-500/20",
  cemento: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

// ── Rating stars helper ───────────────────────────────────────────────────

function RatingBadge({ rating }: { rating: number | null }) {
  if (rating === null) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200">
      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
      {rating.toFixed(1)}
    </span>
  );
}

// ── Component ─────────────────────────────────────────────────────────────

interface PitchCardProps {
  pitch: PitchWithVenue;
}

/**
 * Dark-mode card that displays a single pitch and its parent venue.
 * Designed to be used inside {@link PitchList}.
 */
export function PitchCard({ pitch }: PitchCardProps) {
  const { venues: venue } = pitch;
  const sizeLabel = SIZE_LABELS[pitch.size] ?? pitch.size;
  const turfLabel = TURF_LABELS[pitch.turf_type] ?? pitch.turf_type;
  const turfClass = TURF_BADGE[pitch.turf_type] ?? TURF_BADGE.cemento;

  return (
    <article
      className={[
        // Base card
        "group relative flex flex-col overflow-hidden",
        "rounded-3xl border border-white/[0.07] bg-[#0a1209]",
        // Shadow & transitions
        "shadow-[0_20px_60px_-20px_rgba(0,255,120,0.12)]",
        "transition-all duration-300",
        "hover:-translate-y-1 hover:border-[#4be176]/30",
        "hover:shadow-[0_28px_80px_-20px_rgba(0,255,120,0.22)]",
      ].join(" ")}
    >
      {/* Top accent bar */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#4be176]/40 to-transparent" />

      <div className="flex flex-1 flex-col gap-5 p-6">
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.22em] text-[#4be176]">
              Cancha
            </p>
            <h3 className="truncate text-lg font-bold leading-tight text-white">
              {venue.name}
            </h3>
          </div>

          <RatingBadge rating={venue.rating} />
        </div>

        {/* ── Location ────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-[#4be176]" />
          <span className="truncate">{venue.zone}</span>
        </div>

        {/* ── Badges ──────────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-2">
          {/* Size badge — always green accent */}
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#4be176]/25 bg-[#4be176]/10 px-3 py-1 text-xs font-semibold text-[#7fffb5]">
            <Layers className="h-3 w-3" />
            {sizeLabel}
          </span>

          {/* Turf badge — colour-coded by type */}
          <span
            className={[
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
              turfClass,
            ].join(" ")}
          >
            <Leaf className="h-3 w-3" />
            {turfLabel}
          </span>
        </div>

        {/* ── Features ────────────────────────────────────────────────── */}
        {pitch.features && pitch.features.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {pitch.features.map((feature) => (
              <span
                key={feature}
                className="rounded-full border border-white/[0.07] bg-white/[0.04] px-2.5 py-0.5 text-[11px] text-slate-400"
              >
                {feature}
              </span>
            ))}
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* ── Footer ──────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-4 border-t border-white/[0.06] pt-4">
          <div>
            <p className="mb-0.5 text-[11px] uppercase tracking-[0.18em] text-slate-500">
              Tarifa / hora
            </p>
            <p className="text-xl font-black text-white">
              {formatPrice(pitch.price_per_hour)}
            </p>
          </div>

          <Link
            href={`/canchas/${pitch.id}`}
            className={[
              "inline-flex shrink-0 items-center justify-center",
              "rounded-2xl bg-[#4be176]/15 px-5 py-2.5",
              "text-sm font-semibold text-[#7fffb5]",
              "border border-[#4be176]/20",
              "transition-all duration-200",
              "hover:bg-[#4be176]/25 hover:border-[#4be176]/40 hover:text-white",
            ].join(" ")}
          >
            Ver turnos
          </Link>
        </div>
      </div>
    </article>
  );
}
