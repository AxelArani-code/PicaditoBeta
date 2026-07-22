"use client";

// ─────────────────────────────────────────────────────────────────────────────
// hooks/usePlayerBookings.ts
// React hook that consumes GET /api/player/bookings and
// PATCH /api/player/bookings/[id]/cancel.
//
// Sends the auth token via Authorization header (read from cookies).
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useRef } from "react";
import type {
  PlayerBooking,
  PlayerBookingStats,
  PlayerBookingsFilters,
} from "@/types/player-bookings";

// ── Helper: get token from cookie ─────────────────────────────────────────────
function getTokenFromCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith("picadito_access_token="));
  return match ? match.split("=")[1] ?? null : null;
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function usePlayerBookings(initialFilters?: Partial<PlayerBookingsFilters>) {
  const [bookings, setBookings] = useState<PlayerBooking[]>([]);
  const [stats, setStats] = useState<PlayerBookingStats>({
    total: 0,
    confirmed: 0,
    pending: 0,
    cancelled: 0,
  });
  const [totalCount, setTotalCount]   = useState(0);
  const [totalPages, setTotalPages]   = useState(1);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState<string | null>(null); // booking id being cancelled
  const [cancelError, setCancelError] = useState<string | null>(null);

  const [filters, setFilters] = useState<PlayerBookingsFilters>({
    pageNumber: 1,
    pageSize: 20,
    ...initialFilters,
  });

  // Keep a ref to avoid stale closures in fetchBookings
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const f = filtersRef.current;
      const qs = new URLSearchParams();
      if (f.status)   qs.set("status",   f.status);
      if (f.date)     qs.set("date",     f.date);
      if (f.venueId)  qs.set("venueId",  f.venueId);
      if (f.search)   qs.set("search",   f.search);
      qs.set("page",     String(f.pageNumber));
      qs.set("pageSize", String(f.pageSize));

      const token = getTokenFromCookie();
      const res = await fetch(`/api/player/bookings?${qs.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: "no-store",
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Error ${res.status}`);
      }

      const data = await res.json();
      setBookings(data.items  ?? []);
      setStats(data.stats     ?? { total: 0, confirmed: 0, pending: 0, cancelled: 0 });
      setTotalCount(data.totalCount ?? 0);
      setTotalPages(data.totalPages ?? 1);
    } catch (err: any) {
      setError(err?.message ?? "Error al cargar las reservas.");
    } finally {
      setLoading(false);
    }
  }, []); // stable — reads from filtersRef

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings, filters]); // re-run when filters change

  // ── Cancel a booking ──────────────────────────────────────────────────────
  const cancelBooking = useCallback(async (bookingId: string): Promise<boolean> => {
    setCancelLoading(bookingId);
    setCancelError(null);

    try {
      const token = getTokenFromCookie();
      const res = await fetch(`/api/player/bookings/${bookingId}/cancel`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const msg = body.error ?? `Error ${res.status}`;
        setCancelError(msg);
        return false;
      }

      // Optimistic update: mark booking as cancelled in local state
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: "cancelled" } : b))
      );
      setStats((prev) => ({
        ...prev,
        pending:   Math.max(0, prev.pending - 1),
        cancelled: prev.cancelled + 1,
      }));

      return true;
    } catch (err: any) {
      setCancelError(err?.message ?? "Error al cancelar la reserva.");
      return false;
    } finally {
      setCancelLoading(null);
    }
  }, []);

  // ── Exposed API ───────────────────────────────────────────────────────────
  return {
    bookings,
    stats,
    totalCount,
    totalPages,
    loading,
    error,
    filters,
    setFilters,
    refetch: fetchBookings,
    cancelBooking,
    cancelLoading,
    cancelError,
  };
}
