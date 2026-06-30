"use client";

import { Building2, ExternalLink, Plus, Settings } from "lucide-react";
import Link from "next/link";
import { useDashboardVenues } from "@/hooks/useDashboardVenues";
import { LoadingSpinner } from "@/components/dashboard/LoadingSpinner";
import { ErrorBanner } from "@/components/dashboard/ErrorBanner";

// ─── Sub-components ───────────────────────────────────────────────────────────

function VenueCard({ venue }: { venue: any }) {
  const pitchCount = venue.pitchCount ?? venue.pitches?.length ?? 0;
  return (
    <div className="flex flex-col rounded-xl border border-[#1d3b52] bg-[#102a40]/90 p-4 sm:p-5 transition hover:border-[#2d5a73]">
      <div className="mb-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#071521] text-[#67a6d8]">
          <Building2 className="h-5 w-5" />
        </div>
      </div>
      <h2 className="mb-1 text-sm font-bold text-white sm:text-base">{venue.name}</h2>
      <p className="text-[12px] text-[#7890a3] sm:text-[13px]">
        {venue.city} · {venue.address}
      </p>
      <p className="mb-5 mt-1 text-[12px] text-[#7890a3] sm:text-[13px]">
        {pitchCount} {pitchCount === 1 ? "cancha" : "canchas"}
      </p>
      <div className="mt-auto flex flex-col gap-2 sm:flex-row">
        <Link
          href={`/dashboard/venues/${venue.id}`}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#4be176] px-3 py-2.5 text-[12px] font-bold text-[#003915] transition hover:bg-[#6bfe8f] sm:py-2"
        >
          <Settings className="h-3.5 w-3.5" />
          Gestionar
        </Link>
        {venue.slug && (
          <Link
            href={`/canchas/${venue.slug}`}
            target="_blank"
            className="flex items-center justify-center gap-1.5 rounded-full border border-[#1d3b52] px-3 py-2.5 text-[12px] font-bold text-[#9fb3c5] transition hover:border-[#2d5a73] hover:text-white sm:py-2"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Ver pública
          </Link>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#1d3b52] py-16 text-center px-4">
      <Building2 className="mb-4 h-10 w-10 text-[#4a6a82] sm:h-12 sm:w-12" />
      <h2 className="text-base font-bold text-white sm:text-lg">No tenés complejos aún</h2>
      <p className="mt-2 max-w-xs text-sm text-[#7890a3]">
        Creá tu primer complejo para empezar a recibir reservas.
      </p>
      <button className="mt-6 inline-flex h-10 items-center gap-2 rounded-full bg-[#4be176] px-6 text-sm font-bold text-[#003915] transition hover:bg-[#6bfe8f]">
        <Plus className="h-4 w-4" />
        Crear complejo
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MisCanchasPage() {
  const { venues, loading, error, refetch } = useDashboardVenues();

  return (
    <div className="min-h-full bg-[#07111d] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">Mis canchas</h1>
            <p className="mt-1 text-sm text-[#9fb3c5] sm:mt-2">Gestioná tus complejos y canchas.</p>
          </div>
          <button className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-full bg-[#4be176] px-5 text-sm font-bold text-[#003915] transition hover:bg-[#6bfe8f] sm:self-auto sm:px-6">
            <Plus className="h-4 w-4" />
            Nuevo complejo
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <LoadingSpinner message="Cargando complejos..." />
        ) : error ? (
          <ErrorBanner message={error} onRetry={refetch} />
        ) : venues.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
            {venues.map((venue: any) => (
              <VenueCard key={venue.id} venue={venue} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
