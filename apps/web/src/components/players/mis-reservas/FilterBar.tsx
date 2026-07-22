"use client";

// ─────────────────────────────────────────────────────────────────────────────
// components/players/mis-reservas/FilterBar.tsx
// Minimal search bar with collapsible advanced filters
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useEffect, useCallback } from "react";
import { Search, CalendarDays, SlidersHorizontal, X } from "lucide-react";
import type { PlayerBookingStatus, PlayerBookingsFilters } from "@/types/player-bookings";

interface VenueOption { id: string; name: string; }
interface FilterBarProps {
  filters: PlayerBookingsFilters;
  venueOptions?: VenueOption[];
  onApply: (partial: Partial<PlayerBookingsFilters>) => void;
}

const STATUS_OPTIONS: { value: PlayerBookingStatus | ""; label: string }[] = [
  { value: "",          label: "Todos los estados" },
  { value: "confirmed", label: "Confirmada" },
  { value: "pending",   label: "Pendiente" },
  { value: "cancelled", label: "Cancelada" },
  { value: "rejected",  label: "Rechazada" },
];

const CHEVRON_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%234a6a82' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`;

export function FilterBar({ filters, venueOptions = [], onApply }: FilterBarProps) {
  const [search,       setSearch]       = useState(filters.search  ?? "");
  const [status,       setStatus]       = useState(filters.status  ?? "");
  const [date,         setDate]         = useState(filters.date     ?? "");
  const [venueId,      setVenueId]      = useState(filters.venueId ?? "");
  const [filtersOpen,  setFiltersOpen]  = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const hasActiveFilters = !!(status || date || venueId);

  const apply = useCallback(
    (overrides?: Partial<{ search: string; status: string; date: string; venueId: string }>) => {
      const s  = overrides?.search  ?? search;
      const st = overrides?.status  ?? status;
      const d  = overrides?.date    ?? date;
      const v  = overrides?.venueId ?? venueId;
      onApply({
        search:     s.trim() || undefined,
        status:     (st as PlayerBookingStatus) || undefined,
        date:       d  || undefined,
        venueId:    v  || undefined,
        pageNumber: 1,
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [search, status, date, venueId, onApply]
  );

  // Debounce search input — fires 400ms after the user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      onApply({
        search:     search.trim() || undefined,
        status:     (status as PlayerBookingStatus) || undefined,
        date:       date   || undefined,
        venueId:    venueId || undefined,
        pageNumber: 1,
      });
    }, 400);
    return () => clearTimeout(timer);
    // Only re-run when search text changes; other filters apply immediately
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const clearAll = () => {
    setSearch(""); setStatus(""); setDate(""); setVenueId("");
    onApply({ search: undefined, status: undefined, date: undefined, venueId: undefined, pageNumber: 1 });
  };

  return (
    <div className="space-y-2">
      {/* ── Main search bar ── */}
      <div className="flex items-center gap-2 rounded-2xl border border-[#1a2e3a] bg-[#0a1c2a] px-4 py-0 h-12 transition focus-within:border-[#4be176]/40 focus-within:shadow-[0_0_0_1px_rgba(75,225,118,0.1)]">
        {/* Search icon */}
        <Search className="h-4 w-4 shrink-0 text-[#4a6a82]" />

        {/* Text input */}
        <input
          id="player-bookings-search"
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); }}
          onKeyDown={(e) => e.key === "Enter" && apply()}
          placeholder="Buscar por complejo o cancha..."
          className="flex-1 bg-transparent text-sm text-white placeholder-[#3a5a72] outline-none"
        />

        {/* Clear search */}
        {search && (
          <button
            onClick={() => { setSearch(""); apply({ search: "" }); }}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[#4a6a82] transition hover:bg-[#1a2e3a] hover:text-white"
            aria-label="Limpiar búsqueda"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Divider */}
        <div className="mx-1 h-5 w-px shrink-0 bg-[#1a2e3a]" />

        {/* Date icon button */}
        <button
          onClick={() => dateInputRef.current?.showPicker?.()}
          className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition ${
            date
              ? "bg-[#4be176]/15 text-[#4be176]"
              : "text-[#4a6a82] hover:bg-[#1a2e3a] hover:text-white"
          }`}
          aria-label="Filtrar por fecha"
        >
          <CalendarDays className="h-4 w-4" />
          {/* Hidden native date picker */}
          <input
            ref={dateInputRef}
            id="player-bookings-date"
            type="date"
            value={date}
            onChange={(e) => { setDate(e.target.value); apply({ date: e.target.value }); }}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full [color-scheme:dark]"
            tabIndex={-1}
          />
        </button>

        {/* Divider */}
        <div className="mx-1 h-5 w-px shrink-0 bg-[#1a2e3a]" />

        {/* Filters toggle */}
        <button
          id="player-bookings-toggle-filters"
          onClick={() => setFiltersOpen((o) => !o)}
          aria-expanded={filtersOpen}
          className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition ${
            filtersOpen || hasActiveFilters
              ? "bg-[#4be176]/15 text-[#4be176]"
              : "text-[#4a6a82] hover:bg-[#1a2e3a] hover:text-white"
          }`}
          aria-label="Filtros avanzados"
        >
          <SlidersHorizontal className="h-4 w-4" />
          {hasActiveFilters && (
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[#4be176]" />
          )}
        </button>
      </div>

      {/* ── Expanded advanced filters ── */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          filtersOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="rounded-2xl border border-[#1a2e3a] bg-[#0a1c2a] p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* Status */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="player-bookings-status" className="text-[10px] font-bold uppercase tracking-widest text-[#4a6a82]">
                Estado
              </label>
              <select
                id="player-bookings-status"
                value={status}
                onChange={(e) => { setStatus(e.target.value); apply({ status: e.target.value }); }}
                className="w-full rounded-xl border border-[#1d3b52] bg-[#071521] py-2.5 pl-3 pr-8 text-sm text-white outline-none transition focus:border-[#4be176]/50 focus:ring-1 focus:ring-[#4be176]/20 appearance-none cursor-pointer"
                style={{ backgroundImage: CHEVRON_SVG, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Venue */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="player-bookings-venue" className="text-[10px] font-bold uppercase tracking-widest text-[#4a6a82]">
                Complejo
              </label>
              <select
                id="player-bookings-venue"
                value={venueId}
                onChange={(e) => { setVenueId(e.target.value); apply({ venueId: e.target.value }); }}
                className="w-full rounded-xl border border-[#1d3b52] bg-[#071521] py-2.5 pl-3 pr-8 text-sm text-white outline-none transition focus:border-[#4be176]/50 focus:ring-1 focus:ring-[#4be176]/20 appearance-none cursor-pointer"
                style={{ backgroundImage: CHEVRON_SVG, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
              >
                <option value="">Todos los complejos</option>
                {venueOptions.map((v) => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Clear filters */}
          {hasActiveFilters && (
            <div className="mt-3 flex justify-end">
              <button
                id="player-bookings-clear-filters"
                onClick={clearAll}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold text-[#ef4444] transition hover:bg-[#ef4444]/10"
              >
                <X className="h-3 w-3" />
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
