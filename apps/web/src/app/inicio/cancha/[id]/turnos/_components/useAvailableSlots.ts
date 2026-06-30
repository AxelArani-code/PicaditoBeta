"use client";

// ─────────────────────────────────────────────────────────────────────────────
// useAvailableSlots.ts
// Obtiene los turnos disponibles de una cancha via .NET API (proxy)
//
// Arquitectura:
//   TurnosClient → useAvailableSlots → /api/proxy/pitches/{id}/slots → .NET API → Supabase
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { getAccessToken } from "@/lib/auth/session";
import { formatPrice, mapSlotRow } from "./booking.helpers";
import type { BookingTimeSlot, UseAvailableSlotsReturn } from "./booking.types";

/**
 * Custom hook que obtiene los turnos disponibles de una cancha para una fecha
 * determinada, pasando por el proxy local → .NET API → Supabase.
 *
 * @param pitchId       UUID de la cancha
 * @param selectedDate  Fecha en formato ISO "YYYY-MM-DD"
 * @param pricePerHour  Precio por hora para formatear cada slot
 */
export function useAvailableSlots(
  pitchId: string,
  selectedDate: string,
  pricePerHour: number
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
        const token = getAccessToken();

        const url = `/api/proxy/pitches/${encodeURIComponent(pitchId)}/slots?date=${encodeURIComponent(selectedDate)}`;

        const response = await fetch(url, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (ignore) return;

        if (!response.ok) {
          // Tratar error como sin turnos, no como crash de UI
          console.warn("[useAvailableSlots] API error:", response.status, response.statusText);
          setSlots([]);
          setError(null);
          return;
        }

        const data = await response.json();
        const priceFormatted = formatPrice(pricePerHour);

        // La API puede devolver un array de TimeSlotDto o un objeto con items
        const rawSlots: Record<string, unknown>[] = Array.isArray(data)
          ? data
          : (data?.items ?? []);

        const mapped = rawSlots.map((row) => mapSlotRow(row, priceFormatted));

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
  }, [pitchId, selectedDate, pricePerHour]);

  return { slots, isLoading, error };
}
