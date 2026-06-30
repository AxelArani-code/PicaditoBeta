import { CalendarDays, CirclePlus, Plus } from "lucide-react";

export function DashboardHero() {
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
        <button className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#4be176] px-5 text-sm font-bold text-[#003915] transition hover:bg-[#6bfe8f]">
          <Plus className="h-4 w-4" />
          Cargar una reserva
        </button>
        <button className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[#244257] bg-[#102a40] px-5 text-sm font-bold text-[#d7e8f2] transition hover:bg-[#15364f]">
          <CirclePlus className="h-4 w-4" />
          Agregar una cancha
        </button>
        <button className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[#244257] bg-[#102a40] px-5 text-sm font-bold text-[#d7e8f2] transition hover:bg-[#15364f]">
          <CalendarDays className="h-4 w-4" />
          Ver el calendario
        </button>
      </div>
    </div>
  );
}
