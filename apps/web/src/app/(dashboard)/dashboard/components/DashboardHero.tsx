"use client";

import { useRouter } from "next/navigation";
import { CalendarDays, CirclePlus, Clock4, Loader2, Plus } from "lucide-react";

interface DashboardHeroProps {
  /** Callback para abrir el drawer/modal "Cargar reserva" desde el padre. */
  onNewBooking?: () => void;
  /** Callback para abrir el modal de configuración de horarios. */
  onManageSchedule?: () => void;
  /** true mientras se resuelve el pitchId del dueño desde la API */
  isPitchLoading?: boolean;
  /** Mensaje de error si no se pudo cargar la cancha */
  pitchLoadError?: string | null;
}

export function DashboardHero({ onNewBooking, onManageSchedule, isPitchLoading = false, pitchLoadError }: DashboardHeroProps) {
  const router = useRouter();



  const handleNewPitch = () => {
    router.push("/admin/pitches/new");
  };

  const handleCalendar = () => {
    router.push("/admin/calendar");
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
          Hola, Complejo Las Cañas
        </h1>
        <p className="mt-2 text-sm text-[#9fb3c5]">
          Este es el resumen de tus reservas y la actividad de hoy.
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
       

        <button
          id="dashboard-hero-new-pitch"
          onClick={handleNewPitch}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[#244257] bg-[#102a40] px-5 text-sm font-bold text-[#d7e8f2] transition hover:bg-[#15364f] active:scale-95"
        >
          <CirclePlus className="h-4 w-4" />
          Agregar una cancha
        </button>

        <button
          id="dashboard-hero-calendar"
          onClick={handleCalendar}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[#244257] bg-[#102a40] px-5 text-sm font-bold text-[#d7e8f2] transition hover:bg-[#15364f] active:scale-95"
        >
          <CalendarDays className="h-4 w-4" />
          Ver el calendario
        </button>

        <button
          id="dashboard-hero-manage-schedule"
          onClick={!isPitchLoading && !pitchLoadError ? onManageSchedule : undefined}
          disabled={isPitchLoading || Boolean(pitchLoadError)}
          title={pitchLoadError ?? (isPitchLoading ? "Cargando cancha..." : "Configurar horarios")}
          className={`inline-flex h-10 items-center justify-center gap-2 rounded-full border px-5 text-sm font-bold transition active:scale-95 ${
            pitchLoadError
              ? "cursor-not-allowed border-red-900/40 bg-red-950/30 text-red-400"
              : isPitchLoading
              ? "cursor-not-allowed border-[#4be176]/10 bg-[#0e2415]/50 text-[#4be176]/40"
              : "border-[#4be176]/30 bg-[#0e2415] text-[#4be176] hover:bg-[#142e1a]"
          }`}
        >
          {isPitchLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Clock4 className="h-4 w-4" />
          )}
          {isPitchLoading ? "Cargando..." : pitchLoadError ? "Sin cancha" : "Gestionar Horarios"}
        </button>
      </div>
    </div>
  );
}
