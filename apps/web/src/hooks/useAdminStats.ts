"use client";

// ─────────────────────────────────────────────────────────────────────────────
// hooks/useAdminStats.ts
// Fetch a GET /api/admin/stats con auto-refresh cada 30 segundos.
//
// Arquitectura: Component → /api/admin/stats → Supabase
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useState } from "react";
import type { DashboardStats } from "@/types/admin";

const REFRESH_INTERVAL_MS = 30_000;

interface UseAdminStatsReturn {
  stats: DashboardStats | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

const EMPTY_STATS: DashboardStats = {
  todayBookings:    0,
  todayConfirmed:   0,
  todayPending:     0,
  todayCancelled:   0,
  todayRevenue:     0,
  pendingToConfirm: 0,
  totalClients:     0,
};

export function useAdminStats(): UseAdminStatsReturn {
  const [stats,     setStats]     = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/stats", {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? `HTTP ${res.status}`);
      }

      const data: DashboardStats = await res.json();
      setStats(data);
    } catch (err) {
      console.error("[useAdminStats] error:", err);
      setError(err instanceof Error ? err.message : "Error al cargar métricas");
      setStats(EMPTY_STATS); // Show zeros instead of crashing
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Auto-refresh every 30s
  useEffect(() => {
    const interval = setInterval(fetchStats, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchStats]);

  return { stats, isLoading, error, refetch: fetchStats };
}
