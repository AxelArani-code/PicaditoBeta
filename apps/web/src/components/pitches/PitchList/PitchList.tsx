import { LayoutGrid } from "lucide-react";
import type { PitchWithVenue } from "@/types/pitches";
import { PitchCard } from "@/components/pitches/PitchCard/PitchCard";

// ── Empty state ───────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-8 py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#4be176]/10">
        <LayoutGrid className="h-6 w-6 text-[#4be176]" />
      </div>
      <div>
        <p className="text-base font-semibold text-white">Sin resultados</p>
        <p className="mt-1 text-sm text-slate-500">
          No se encontraron canchas para los filtros seleccionados.
        </p>
      </div>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────

interface PitchListProps {
  /** Array of pitches joined with venue data, as returned by getPitchesWithVenues. */
  pitches: PitchWithVenue[];
}

/**
 * Responsive grid list of {@link PitchCard} items.
 *
 * Intended to be used inside a **Server Component** that fetches data via
 * `getPitchesWithVenues` and passes the result as the `pitches` prop.
 *
 * @example
 * ```tsx
 * // app/(public)/canchas/page.tsx
 * import { getPitchesWithVenues } from "@/lib/queries/searchPitches";
 * import { PitchList } from "@/components/pitches/PitchList/PitchList";
 *
 * export default async function CanchasPage() {
 *   const pitches = await getPitchesWithVenues();
 *   return <PitchList pitches={pitches} />;
 * }
 * ```
 */
export function PitchList({ pitches }: PitchListProps) {
  if (pitches.length === 0) {
    return <EmptyState />;
  }

  return (
    <section aria-label="Listado de canchas">
      {/* Result count */}
      <p className="mb-6 text-sm text-slate-500">
        <span className="font-semibold text-slate-300">{pitches.length}</span>{" "}
        {pitches.length === 1 ? "cancha encontrada" : "canchas encontradas"}
      </p>

      {/* Responsive grid */}
      <ul
        role="list"
        className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {pitches.map((pitch) => (
          <li key={pitch.id}>
            <PitchCard pitch={pitch} />
          </li>
        ))}
      </ul>
    </section>
  );
}
