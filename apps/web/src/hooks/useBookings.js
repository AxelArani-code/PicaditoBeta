"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  getBookings,
  confirmBooking,
  rejectBooking,
  cancelBooking,
  getBookingStatusDisplay,
  formatBookingDate,
  formatPrice,
  sortBookings,
  calculateKPIs,
  getRecentActivity,
  filterBookingsByVenue,
  calculateBookingAnalytics,
  getVenueOptions,
  getVenueLabel,
} from "@/services/bookings.service";

/**
 * Hook personalizado para manejar reservas
 * Maneja loading, errores, filtros, paginación, sorting, sedes, acciones y métricas
 */
export function useBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [actionLoading, setActionLoading] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [selectedVenue, setSelectedVenue] = useState("all");

  // Nuevos estados para sorting y auto-refresh
  const [sortBy, setSortBy] = useState("recent");
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState(15000);

  const venueOptions = useMemo(() => getVenueOptions(), []);

  const filteredBookings = useMemo(() => {
    const sorted = sortBookings(bookings, sortBy);
    return filterBookingsByVenue(sorted, selectedVenue);
  }, [bookings, sortBy, selectedVenue]);

  const analytics = useMemo(
    () => calculateBookingAnalytics(bookings, selectedVenue),
    [bookings, selectedVenue]
  );

  /**
   * Carga los bookings del servidor
   */
  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const filters = {
        pageNumber,
        pageSize,
      };

      if (statusFilter !== "all") {
        filters.status = statusFilter;
      }

      const data = await getBookings(filters);

      setBookings(data.items ?? []);
      setTotalPages(data.totalPages ?? 1);
      setTotalCount(data.totalCount ?? 0);
    } catch (err) {
      console.error("Error cargando bookings:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [pageNumber, pageSize, statusFilter]);

  /**
   * Recarga los bookings (mantiene filtros y página actual)
   */
  const refetch = useCallback(() => {
    loadBookings();
  }, [loadBookings]);

  /**
   * Cambia el filtro de estado y reinicia la paginación
   */
  const handleStatusFilterChange = useCallback((newStatus) => {
    setStatusFilter(newStatus);
    setPageNumber(1);
  }, []);

  const handleVenueChange = useCallback((newVenue) => {
    setSelectedVenue(newVenue);
    setPageNumber(1);
  }, []);

  /**
   * Navega a la página anterior
   */
  const handlePrevPage = useCallback(() => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  }, []);

  /**
   * Navega a la página siguiente
   */
  const handleNextPage = useCallback(() => {
    setPageNumber((prev) => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  /**
   * Cambia el criterio de ordenamiento y aplica sorting local
   */
  const handleSortChange = useCallback((newSortBy) => {
    setSortBy(newSortBy);
  }, []);

  /**
   * Alterna auto-refresh
   */
  const toggleAutoRefresh = useCallback((enabled) => {
    setAutoRefreshEnabled(enabled);
  }, []);

  /**
   * Cambia intervalo de auto-refresh
   */
  const setRefreshInterval = useCallback((interval) => {
    setAutoRefreshInterval(interval);
  }, []);

  const updateBookingStatusLocally = useCallback((bookingId, update) => {
    setBookings((prev) =>
      prev.map((booking) =>
        booking.id === bookingId
          ? {
              ...booking,
              ...update,
            }
          : booking
      )
    );
  }, []);

  /**
   * Confirma una reserva con optimismo UI
   */
  const handleConfirmBooking = useCallback(
    async (bookingId) => {
      const previousBookings = bookings;
      try {
        setActionLoading(bookingId);
        setActionError(null);

        updateBookingStatusLocally(bookingId, { status: "confirmed" });

        await confirmBooking(bookingId);
        await loadBookings();
        return true;
      } catch (err) {
        console.error("Error confirmando booking:", err);
        setBookings(previousBookings);
        setActionError(err instanceof Error ? err.message : "Error desconocido");
        return false;
      } finally {
        setActionLoading(null);
      }
    },
    [bookings, loadBookings, updateBookingStatusLocally]
  );

  /**
   * Rechaza una reserva con optimismo UI
   */
  const handleRejectBooking = useCallback(
    async (bookingId) => {
      const previousBookings = bookings;
      try {
        setActionLoading(bookingId);
        setActionError(null);

        updateBookingStatusLocally(bookingId, { status: "rejected" });

        await rejectBooking(bookingId);
        await loadBookings();
        return true;
      } catch (err) {
        console.error("Error rechazando booking:", err);
        setBookings(previousBookings);
        setActionError(err instanceof Error ? err.message : "Error desconocido");
        return false;
      } finally {
        setActionLoading(null);
      }
    },
    [bookings, loadBookings, updateBookingStatusLocally]
  );

  /**
   * Cancela una reserva con optimismo UI
   */
  const handleCancelBooking = useCallback(
    async (bookingId) => {
      const previousBookings = bookings;
      try {
        setActionLoading(bookingId);
        setActionError(null);

        updateBookingStatusLocally(bookingId, { status: "cancelled" });

        await cancelBooking(bookingId);
        await loadBookings();
      } catch (err) {
        console.error("Error cancelando booking:", err);
        setBookings(previousBookings);
        setActionError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setActionLoading(null);
      }
    },
    [bookings, loadBookings, updateBookingStatusLocally]
  );

  // Carga inicial de bookings
  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  /**
   * Auto-refresh cada N segundos
   * Mantiene filtros y paginación actual
   */
  useEffect(() => {
    if (!autoRefreshEnabled) return;

    const interval = setInterval(() => {
      loadBookings();
    }, autoRefreshInterval);

    return () => clearInterval(interval);
  }, [autoRefreshEnabled, autoRefreshInterval, loadBookings]);

  return {
    // Data
    bookings: filteredBookings,
    totalCount,
    totalPages,
    pageNumber,
    pageSize,
    selectedVenue,
    venueOptions,

    // State
    loading,
    error,
    actionLoading,
    actionError,
    statusFilter,
    sortBy,
    autoRefreshEnabled,
    autoRefreshInterval,

    // Análisis
    kpis: calculateKPIs(filteredBookings),
    analytics,
    recentActivity: getRecentActivity(filteredBookings, 8),

    // Métodos
    loadBookings,
    refetch,
    handleStatusFilterChange,
    handleVenueChange,
    handlePrevPage,
    handleNextPage,
    handleConfirmBooking,
    handleRejectBooking,
    handleCancelBooking,
    setPageSize,
    handleSortChange,
    toggleAutoRefresh,
    setRefreshInterval,
    getVenueLabel,
  };
}

/**
 * Helper para transformar un booking a formato de UI
 */
export function transformBookingForUI(booking) {
  const statusDisplay = getBookingStatusDisplay(booking.status);

  return {
    id: booking.id,
    pitchName: booking.pitchName || "Sin nombre",
    userName: booking.userName || "Usuario",
    status: booking.status,
    statusDisplay,
    date: formatBookingDate(booking.date),
    totalPrice: formatPrice(booking.totalPrice),
    createdAt: formatBookingDate(booking.createdAt),
    updatedAt: formatBookingDate(booking.updatedAt),
    paymentStatus: booking.paymentStatus,
    // Data raw para acciones
    _raw: booking,
  };
}
