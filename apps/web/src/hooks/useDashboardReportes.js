"use client";
import { useState, useEffect, useCallback } from "react";
import { getBookings, calculateBookingAnalytics, calculateKPIs } from "@/services/bookings.service";

/**
 * Hook para la sección "Reportes".
 * Obtiene todos los bookings y calcula analytics + KPIs.
 */
export function useDashboardReportes() {
  const [analytics, setAnalytics] = useState(null);
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReportes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getBookings({ pageSize: 50 });

      const items = data?.items ?? [];
      setAnalytics(calculateBookingAnalytics(items));
      setKpis(calculateKPIs(items));
    } catch (err) {
      setError(err?.message ?? "Error al cargar los reportes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReportes(); }, [fetchReportes]);

  return { analytics, kpis, loading, error, refetch: fetchReportes };
}
