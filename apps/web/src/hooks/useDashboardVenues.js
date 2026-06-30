"use client";
import { useState, useEffect, useCallback } from "react";
import { getVenues } from "@/services/venues.service";

/**
 * Hook para la sección "Mis canchas".
 * Obtiene los complejos del usuario desde el backend.
 */
export function useDashboardVenues() {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchVenues = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getVenues();
      setVenues(data?.items ?? data ?? []);
    } catch (err) {
      setError(err?.message ?? "Error al cargar los complejos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchVenues(); }, [fetchVenues]);

  return { venues, loading, error, refetch: fetchVenues };
}
