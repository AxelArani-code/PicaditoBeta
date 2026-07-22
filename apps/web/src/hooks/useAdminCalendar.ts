"use client";

// ─────────────────────────────────────────────────────────────────────────────
// hooks/useAdminCalendar.ts
// Fetch a GET /api/admin/calendar?date=YYYY-MM-DD cuando cambia el día.
//
// Arquitectura: Component → /api/admin/calendar → Supabase
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useState } from "react";
import type { CalendarDayData } from "@/types/admin";

interface UseAdminCalendarReturn {
  dayData: CalendarDayData | null;
  isLoading: boolean;
  error: string | null;
}

export function useAdminCalendar(isoDate: string): UseAdminCalendarReturn {
  const [dayData,   setDayData]   = useState<CalendarDayData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const fetchDay = useCallback(async (date: string) => {
    if (!date) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/calendar?date=${encodeURIComponent(date)}`, {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? `HTTP ${res.status}`);
      }

      const data: CalendarDayData = await res.json();
      setDayData(data);
    } catch (err) {
      console.error("[useAdminCalendar] error:", err);
      setError(err instanceof Error ? err.message : "Error al cargar los turnos del día");
      setDayData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDay(isoDate);
  }, [isoDate, fetchDay]);

  return { dayData, isLoading, error };
}
