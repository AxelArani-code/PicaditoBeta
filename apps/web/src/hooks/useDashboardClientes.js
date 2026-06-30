"use client";
import { useState, useEffect, useCallback } from "react";
import { getBookings } from "@/services/bookings.service";

/**
 * Hook para la sección "Clientes".
 * Obtiene bookings y agrupa por cliente (userName) para obtener lista única de clientes.
 */
export function useDashboardClientes() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getBookings({ pageSize: 50 });

      const items = data?.items ?? [];

      // Group by userName to get unique clients
      const clientMap = items.reduce((acc, booking) => {
        const name = booking.userName || booking.user?.name || "Cliente";
        if (!acc[name]) {
          acc[name] = {
            id: booking.userId || booking.user?.id || name,
            name,
            email: booking.userEmail || booking.user?.email || "—",
            phone: booking.userPhone || booking.user?.phone || "—",
            bookingsCount: 0,
            lastBooking: null,
          };
        }
        acc[name].bookingsCount += 1;
        const bookingDate = new Date(booking.createdAt || booking.date);
        if (!acc[name].lastBooking || bookingDate > new Date(acc[name].lastBooking)) {
          acc[name].lastBooking = booking.createdAt || booking.date;
        }
        return acc;
      }, {});

      setClients(Object.values(clientMap));
    } catch (err) {
      setError(err?.message ?? "Error al cargar los clientes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  return { clients, loading, error, refetch: fetchClients };
}
