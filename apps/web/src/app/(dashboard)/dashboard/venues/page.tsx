"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  DollarSign,
  ExternalLink,
  Loader2,
  Plus,
  Settings,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { ScheduleModal } from "@/components/dashboard/ScheduleModal";
import { getAccessToken } from "@/lib/auth/session";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Pitch {
  id:           string;
  venueId:      string;
  name:         string;
  type:         string | null;   // "f5" | "f7" | etc.
  surface:      string | null;
  pricePerHour: number;
  isActive:     boolean;
}

interface Venue {
  id:         string;
  name:       string;
  city:       string;
  address:    string;
  pitchCount: number;
  pitches:    Pitch[];
  slug?:      string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PITCH_TYPE_LABELS: Record<string, string> = {
  f5:  "Fútbol 5",
  f7:  "Fútbol 7",
  f9:  "Fútbol 9",
  f11: "Fútbol 11",
};

function getPitchTypeLabel(type: string | null): string {
  return type ? (PITCH_TYPE_LABELS[type] ?? type.toUpperCase()) : "Fútbol";
}

// ─── Sub-componente: Tarjeta de Cancha ────────────────────────────────────────

interface PitchCardProps {
  pitch:    Pitch;
  venueName: string;
  onManageSchedule: (pitch: Pitch) => void;
}

function PitchCard({ pitch, venueName, onManageSchedule }: PitchCardProps) {
  return (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-200 ${
        pitch.isActive
          ? "border-[#1a2d3d] bg-[#0c1823] hover:border-[#1e4060]"
          : "border-[#252525] bg-[#0c0e10] opacity-60"
      }`}
    >
      {/* Accent top bar */}
      <div
        className={`h-0.5 w-full ${
          pitch.isActive ? "bg-gradient-to-r from-[#4be176] via-[#4be176]/40 to-transparent" : "bg-[#333]"
        }`}
      />

      <div className="flex flex-1 flex-col p-5">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                pitch.isActive ? "bg-[#4be176]/10 text-[#4be176]" : "bg-[#1a1a1a] text-[#555]"
              }`}
            >
              <Zap className="h-4 w-4" strokeWidth={1.8} />
            </div>
            <div className="min-w-0">
              <h3 className="text-[15px] font-bold text-white leading-tight truncate">
                {pitch.name}
              </h3>
              <p className="text-[11px] text-[#5a8099] font-medium">
                {venueName}
              </p>
            </div>
          </div>

          {pitch.isActive ? (
            <span className="flex items-center gap-1 rounded-full border border-[#4be176]/20 bg-[#4be176]/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#4be176]">
              <CheckCircle2 className="h-2.5 w-2.5" />
              Activa
            </span>
          ) : (
            <span className="rounded-full border border-[#444] bg-[#1a1a1a] px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#555]">
              Inactiva
            </span>
          )}
        </div>

        {/* Info pills */}
        <div className="mb-5 flex flex-wrap gap-2">
          <span className="flex items-center gap-1.5 rounded-lg bg-[#0f1e2c] px-2.5 py-1.5 text-[11px] font-semibold text-[#7aa8c7]">
            <Calendar className="h-3 w-3" />
            {getPitchTypeLabel(pitch.type)}
          </span>
          {pitch.surface && (
            <span className="flex items-center gap-1.5 rounded-lg bg-[#0f1e2c] px-2.5 py-1.5 text-[11px] font-semibold text-[#7aa8c7]">
              {pitch.surface}
            </span>
          )}
          {pitch.pricePerHour > 0 && (
            <span className="flex items-center gap-1.5 rounded-lg bg-[#0f1e2c] px-2.5 py-1.5 text-[11px] font-semibold text-[#7aa8c7]">
              <DollarSign className="h-3 w-3" />
              {pitch.pricePerHour.toLocaleString("es-AR")} / hr
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="mt-auto flex flex-col gap-2">
          {/* CTA principal: Configurar Horarios */}
          <button
            id={`pitch-schedule-btn-${pitch.id}`}
            type="button"
            onClick={() => onManageSchedule(pitch)}
            disabled={!pitch.isActive}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#4be176] px-4 py-2.5 text-[12px] font-black uppercase tracking-wider text-[#021308] shadow-lg shadow-[#4be176]/20 transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Clock className="h-3.5 w-3.5" />
            Configurar Horarios
            <ChevronRight className="h-3.5 w-3.5" />
          </button>

          {/* Acción secundaria */}
          <button
            type="button"
            disabled
            title="Próximamente"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#1a2d3d] px-4 py-2 text-[11px] font-semibold text-[#3a5a6a] transition hover:border-[#1e4060] hover:text-[#7aa8c7] disabled:cursor-not-allowed"
          >
            <Settings className="h-3 w-3" />
            Editar cancha
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-componente: Sección de Venue ─────────────────────────────────────────

interface VenueSectionProps {
  venue:            Venue;
  onManageSchedule: (pitch: Pitch) => void;
}

function VenueSection({ venue, onManageSchedule }: VenueSectionProps) {
  return (
    <section className="mb-10">
      {/* Venue header */}
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#1a2d3d] bg-[#0c1823] text-[#4be176]">
            <Building2 className="h-4 w-4" strokeWidth={1.7} />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">{venue.name}</h2>
            <p className="text-[12px] text-[#5a8099]">
              {venue.city}
              {venue.address ? ` · ${venue.address}` : ""}
            </p>
          </div>
        </div>

        {venue.slug && (
          <Link
            href={`/canchas/${venue.slug}`}
            target="_blank"
            className="flex items-center gap-1.5 self-start rounded-full border border-[#1a2d3d] px-3 py-1.5 text-[11px] font-semibold text-[#5a8099] transition hover:border-[#4be176]/30 hover:text-[#4be176] sm:self-auto"
          >
            <ExternalLink className="h-3 w-3" />
            Ver página pública
          </Link>
        )}
      </div>

      {/* Pitch grid */}
      {venue.pitches.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#1a2d3d] py-10 text-center">
          <Zap className="mx-auto mb-3 h-7 w-7 text-[#2d4a5d]" />
          <p className="text-sm font-semibold text-[#4a6a7a]">No hay canchas en este complejo</p>
          <p className="mt-1 text-[12px] text-[#3a5a6a]">Agregá una cancha para empezar</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {venue.pitches.map((pitch) => (
            <PitchCard
              key={pitch.id}
              pitch={pitch}
              venueName={venue.name}
              onManageSchedule={onManageSchedule}
            />
          ))}
        </div>
      )}
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MisCanchasPage() {
  const [venues,       setVenues]       = useState<Venue[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);

  // Pitch seleccionado para el modal de horarios
  const [selectedPitch, setSelectedPitch] = useState<Pitch | null>(null);
  const [isModalOpen,   setIsModalOpen]   = useState(false);

  const fetchVenues = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getAccessToken();
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const res = await fetch("/api/owner/pitches", { headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      // Construir la estructura de venues con pitches agrupados
      const venueMap = new Map<string, Venue>();
      for (const v of data.venues ?? []) {
        venueMap.set(v.id, {
          id:         v.id,
          name:       v.name,
          city:       v.city ?? "",
          address:    v.address ?? "",
          pitchCount: 0,
          pitches:    [],
          slug:       v.slug ?? undefined,
        });
      }
      for (const p of data.pitches ?? []) {
        const venue = venueMap.get(p.venue_id);
        if (venue) {
          venue.pitches.push({
            id:           p.id,
            venueId:      p.venue_id,
            name:         p.name,
            type:         p.type ?? null,
            surface:      p.surface ?? null,
            pricePerHour: p.price_per_hour ?? 0,
            isActive:     p.is_active !== false,
          });
          venue.pitchCount = venue.pitches.length;
        }
      }

      setVenues(Array.from(venueMap.values()));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar las canchas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchVenues(); }, [fetchVenues]);

  const handleOpenSchedule = (pitch: Pitch) => {
    setSelectedPitch(pitch);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPitch(null);
  };

  return (
    <div className="min-h-full bg-[#07111d] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-5xl">

        {/* ── Page header ───────────────────────────────────────────────── */}
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              Mis Canchas
            </h1>
            <p className="mt-1.5 text-sm text-[#5a8099]">
              Seleccioná una cancha para configurar sus horarios y disponibilidad.
            </p>
          </div>

          <button
            type="button"
            disabled
            title="Próximamente"
            className="inline-flex h-10 cursor-not-allowed items-center gap-2 self-start rounded-full border border-[#1a2d3d] px-5 text-sm font-bold text-[#3a5a6a] opacity-50 sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            Nueva cancha
          </button>
        </div>

        {/* ── Content ───────────────────────────────────────────────────── */}
        {loading ? (
          <div className="flex items-center justify-center gap-3 py-24 text-[#4a6a4a]">
            <Loader2 className="h-5 w-5 animate-spin text-[#4be176]" />
            <span className="text-sm">Cargando canchas...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-red-900/30 bg-red-950/20 py-16 text-center">
            <p className="text-sm font-semibold text-red-400">{error}</p>
            <button
              type="button"
              onClick={fetchVenues}
              className="mt-4 rounded-xl border border-red-900/30 px-4 py-2 text-xs font-bold text-red-400 transition hover:bg-red-950/30"
            >
              Reintentar
            </button>
          </div>
        ) : venues.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#1a2d3d] py-24 text-center">
            <Building2 className="mb-4 h-12 w-12 text-[#2d4a5d]" />
            <h2 className="text-lg font-bold text-white">No tenés complejos aún</h2>
            <p className="mt-2 max-w-xs text-sm text-[#5a8099]">
              Creá tu primer complejo para empezar a gestionar horarios y recibir reservas.
            </p>
          </div>
        ) : (
          venues.map((venue) => (
            <VenueSection
              key={venue.id}
              venue={venue}
              onManageSchedule={handleOpenSchedule}
            />
          ))
        )}
      </div>

      {/* ── ScheduleModal (se abre con el pitch seleccionado) ─────────── */}
      {selectedPitch && (
        <ScheduleModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          pitchId={selectedPitch.id}
          pitchName={selectedPitch.name}
          pitchType={getPitchTypeLabel(selectedPitch.type)}
          accessToken={getAccessToken()}
        />
      )}
    </div>
  );
}
