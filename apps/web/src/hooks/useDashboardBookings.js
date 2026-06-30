"use client";
import { useState, useEffect, useCallback } from "react";
import { getBookings } from "@/services/bookings.service";

/**
 * Hook para la sección "Turnos" y "Calendario".
 * Soporta filtros por status, paymentStatus, pitchId y paginación.
 *
 * @param {Object} initialFilters  - Filtros iniciales (status, paymentStatus, pitchId, pageNumber, pageSize)
 */
export function useDashboardBookings(initialFilters = {}) {
  const [bookings, setBookings] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ pageNumber: 1, pageSize: 50, ...initialFilters });

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getBookings(filters);
      setBookings(data?.items ?? []);
      setTotalCount(data?.totalCount ?? 0);
      setTotalPages(data?.totalPages ?? 1);
    } catch (err) {
      setError(err?.message ?? "Error al cargar los turnos.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  return {
    bookings,
    totalCount,
    totalPages,
    loading,
    error,
    filters,
    setFilters,
    refetch: fetchBookings,
  };
}
