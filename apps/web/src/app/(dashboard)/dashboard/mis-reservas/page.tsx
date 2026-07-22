"use client";

// ─────────────────────────────────────────────────────────────────────────────
// app/(dashboard)/dashboard/mis-reservas/page.tsx
// NOTE: The canonical player-facing route is /inicio/mis-reservas (PublicShell).
// This page kept for convenience but players should use the public route.
// Components are shared from @/components/players/mis-reservas/
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useMemo } from "react";
import { CalendarDays, RefreshCw } from "lucide-react";
import { usePlayerBookings } from "@/hooks/usePlayerBookings";
import { StatsCards }           from "@/components/players/mis-reservas/StatsCards";
import { FilterBar }            from "@/components/players/mis-reservas/FilterBar";
import { BookingCard }          from "@/components/players/mis-reservas/BookingCard";
import { BookingDetailSidebar } from "@/components/players/mis-reservas/BookingDetailSidebar";
import type { PlayerBooking, PlayerBookingsFilters } from "@/types/player-bookings";

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-[#1a2e3a] bg-[#0d1f2d] text-[#4a6a82]">
        <CalendarDays className="h-7 w-7" />
      </div>
      <h3 className="text-base font-bold text-white">
        {hasFilters ? "Sin resultados" : "Sin reservas aún"}
      </h3>
      <p className="mt-1 max-w-xs text-sm text-[#4a6a82]">
        {hasFilters
          ? "No hay reservas para los filtros seleccionados. Probá con otros criterios."
          : "Cuando reserves una cancha, aparecerá aquí con todos los detalles."}
      </p>
    </div>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────────
function BookingCardSkeleton() {
  return (
    <>
      {/* Mobile skeleton */}
      <div className="block md:hidden overflow-hidden rounded-2xl border border-[#1a2e3a] bg-[#0b1a25] animate-pulse">
        <div className="h-32 w-full bg-[#0d2217]" />
        <div className="p-4 space-y-3">
          <div className="h-4 w-40 rounded-lg bg-[#1a2e3a]" />
          <div className="h-3 w-24 rounded-lg bg-[#1a2e3a]" />
          <div className="flex gap-3">
            <div className="h-3 w-20 rounded-lg bg-[#1a2e3a]" />
            <div className="h-3 w-20 rounded-lg bg-[#1a2e3a]" />
          </div>
          <div className="flex justify-between items-center pt-1">
            <div className="h-6 w-16 rounded-lg bg-[#1a2e3a]" />
            <div className="h-9 w-24 rounded-xl bg-[#1a2e3a]" />
          </div>
        </div>
      </div>
      {/* Desktop skeleton */}
      <div className="hidden md:flex h-40 animate-pulse overflow-hidden rounded-2xl border border-[#1a2e3a] bg-[#0b1a25]">
        <div className="w-44 shrink-0 bg-[#0d2217]" />
        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="h-5 w-48 rounded-lg bg-[#1a2e3a]" />
          <div className="h-3.5 w-32 rounded-lg bg-[#1a2e3a]" />
          <div className="mt-auto flex gap-4">
            <div className="h-3 w-20 rounded-lg bg-[#1a2e3a]" />
            <div className="h-3 w-20 rounded-lg bg-[#1a2e3a]" />
            <div className="h-3 w-16 rounded-lg bg-[#1a2e3a]" />
          </div>
        </div>
        <div className="w-40 shrink-0 border-l border-[#1a2e3a] p-4 space-y-2">
          <div className="h-4 w-24 rounded-lg bg-[#1a2e3a]" />
          <div className="h-10 rounded-xl bg-[#1a2e3a]" />
          <div className="h-10 rounded-xl bg-[#1a2e3a]" />
        </div>
      </div>
    </>
  );
}

// ── Error Banner ──────────────────────────────────────────────────────────────
function ErrorBanner({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#ef4444]/30 bg-[#ef4444]/10 px-5 py-4">
      <p className="text-sm text-[#fca5a5]">{message}</p>
      <button
        onClick={onRetry}
        className="flex items-center gap-1.5 text-[12px] font-bold text-[#ef4444] transition hover:text-red-300"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        Reintentar
      </button>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function MisReservasPage() {
  const {
    bookings,
    stats,
    totalCount,
    totalPages,
    loading,
    error,
    filters,
    setFilters,
    refetch,
    cancelBooking,
    cancelLoading,
    cancelError,
  } = usePlayerBookings();

  const [selectedBooking, setSelectedBooking] = useState<PlayerBooking | null>(null);
  const [isSidebarOpen,   setIsSidebarOpen]   = useState(false);

  // Derive venue options from loaded bookings for the filter dropdown
  const venueOptions = useMemo(() => {
    const seen = new Map<string, string>();
    bookings.forEach((b) => {
      if (!seen.has(b.venue.id)) seen.set(b.venue.id, b.venue.name);
    });
    return Array.from(seen.entries()).map(([id, name]) => ({ id, name }));
  }, [bookings]);

  const hasFilters = !!(filters.search || filters.status || filters.date || filters.venueId);

  const handleApplyFilters = (partial: Partial<PlayerBookingsFilters>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  };

  const handleOpenDetail = (booking: PlayerBooking) => {
    setSelectedBooking(booking);
    setIsSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
    // Slight delay to allow the close animation to finish
    setTimeout(() => setSelectedBooking(null), 300);
  };

  const handleCancel = async (bookingId: string) => {
    const ok = await cancelBooking(bookingId);
    if (!ok) return; // error shown via cancelError
  };

  const handleDuplicate = (booking: PlayerBooking) => {
    // Redirect to the booking flow for the same pitch
    window.location.href = `/inicio/cancha/${booking.pitch.id}`;
  };

  return (
    <>
      <div className="min-h-full bg-[#071521] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-6">

          {/* ── Page header ── */}
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
              Mis Reservas
            </h1>
            <p className="mt-1.5 text-sm text-[#6b7f8c]">
              Gestioná todas tus reservas y seguí el estado de cada solicitud.
            </p>
          </div>

          {/* ── Stats Cards ── */}
          <StatsCards stats={stats} loading={loading} />

          {/* ── Filter Bar ── */}
          <FilterBar
            filters={filters}
            venueOptions={venueOptions}
            onApply={handleApplyFilters}
          />

          {/* ── Error states ── */}
          {error && <ErrorBanner message={error} onRetry={refetch} />}
          {cancelError && (
            <div className="rounded-2xl border border-[#f97316]/30 bg-[#f97316]/10 px-5 py-3 text-sm text-[#fdba74]">
              {cancelError}
            </div>
          )}

          {/* ── Booking list ── */}
          <div className="space-y-3">
            {loading ? (
              <>
                <BookingCardSkeleton />
                <BookingCardSkeleton />
                <BookingCardSkeleton />
              </>
            ) : bookings.length === 0 ? (
              <EmptyState hasFilters={hasFilters} />
            ) : (
              bookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onDetails={handleOpenDetail}
                  onCancel={handleCancel}
                  onDuplicate={handleDuplicate}
                  cancelLoading={cancelLoading}
                />
              ))
            )}
          </div>

          {/* ── Pagination ── */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between pt-2 text-sm text-[#6b7f8c]">
              <span>
                Página {filters.pageNumber} de {totalPages} · {totalCount} reservas
              </span>
              <div className="flex gap-2">
                <button
                  id="player-bookings-prev"
                  disabled={filters.pageNumber <= 1}
                  onClick={() =>
                    setFilters((f) => ({ ...f, pageNumber: Math.max(1, f.pageNumber - 1) }))
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#1d3b52] transition hover:border-[#2d5a73] disabled:opacity-30"
                >
                  ‹
                </button>
                <button
                  id="player-bookings-next"
                  disabled={filters.pageNumber >= totalPages}
                  onClick={() =>
                    setFilters((f) => ({ ...f, pageNumber: Math.min(totalPages, f.pageNumber + 1) }))
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#1d3b52] transition hover:border-[#2d5a73] disabled:opacity-30"
                >
                  ›
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Detail Sidebar (portal-like, outside main container) ── */}
      <BookingDetailSidebar
        booking={selectedBooking}
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
      />
    </>
  );
}
