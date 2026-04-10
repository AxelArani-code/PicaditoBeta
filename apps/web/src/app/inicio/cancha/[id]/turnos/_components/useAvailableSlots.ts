"use client";

// ─────────────────────────────────────────────────────────────────────────────
// useAvailableSlots.ts
// Obtiene los turnos disponibles consultando la tabla `time_slots` en Supabase.
//
// Arquitectura (este hook):
//   TurnosClient → useAvailableSlots → Supabase (time_slots)
//
// Filtros obligatorios:
//   - pitch_id  = pitchId (cancha actual)
//   - date      = selectedDate (fecha seleccionada en el carrusel)
//   - status    = 'available'
//
// El backend maneja cierres de emergencia y precios dinámicos vía CRON/Triggers.
// Este frontend sólo consume los datos ya preparados en `time_slots`.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { mapRawSlot } from "./booking.helpers";
import type { BookingTimeSlot, RawTimeSlot, UseAvailableSlotsReturn } from "./booking.types";

/**
 * Custom hook que obtiene los turnos disponibles de una cancha para una fecha
 * determinada, consultando directamente la tabla `time_slots` en Supabase.
 *
 * @param pitchId       UUID de la cancha
 * @param selectedDate  Fecha en formato ISO "YYYY-MM-DD"
 */
export function useAvailableSlots(
  pitchId: string,
  selectedDate: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _pricePerHour?: number   // kept for API compatibility — price now comes from the DB row
): UseAvailableSlotsReturn {
  const [slots,     setSlots]     = useState<BookingTimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!pitchId || !selectedDate) return;

    let ignore = false; // Race-condition guard

    async function fetchSlots() {
      setIsLoading(true);
      setError(null);

      try {
        const supabase = createClient();

        const { data, error: sbError } = await supabase
          .from("time_slots")
          .select("id, pitch_id, date, start_time, end_time, price, status")
          .eq("pitch_id", pitchId)
          .eq("date", selectedDate)
          .eq("status", "available")
          .order("start_time", { ascending: true });

        if (ignore) return;

        console.log("[useAvailableSlots] raw Supabase response:", { data, error: sbError });

        if (sbError) {
          console.warn("[useAvailableSlots] Supabase error:", sbError.message);
          setSlots([]);
          setError(null); // Show empty state, not a crash
          return;
        }

        const rawRows = (data ?? []) as RawTimeSlot[];
        const mapped  = rawRows.map((row) => mapRawSlot(row));

        setSlots(mapped);
      } catch (err) {
        if (ignore) return;
        console.error("[useAvailableSlots] unexpected error:", err);
        setSlots([]);
        setError("Error al cargar los turnos. Intentá de nuevo.");
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    fetchSlots();

    return () => {
      ignore = true;
    };
  }, [pitchId, selectedDate]);

  return { slots, isLoading, error };
}
