// ─────────────────────────────────────────────────────────────────────────────
// StatsCards.tsx — 4 summary cards for "Mis Reservas" header
// ─────────────────────────────────────────────────────────────────────────────

import type { PlayerBookingStats } from "@/types/player-bookings";

interface StatsCardsProps {
  stats: PlayerBookingStats;
  loading?: boolean;
}

interface CardProps {
  label: string;
  value: number | string;
  color: string;
  loading?: boolean;
}

function StatCard({ label, value, color, loading }: CardProps) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-[#1a2e3a] bg-[#0d1f2d] px-5 py-4 transition hover:border-[#243d50]">
      <span className="text-[10px] font-bold uppercase tracking-widest text-[#4a6a82]">
        {label}
      </span>
      {loading ? (
        <div className="mt-1 h-8 w-12 animate-pulse rounded-lg bg-[#1a2e3a]" />
      ) : (
        <span className={`text-3xl font-black tabular-nums ${color}`}>
          {value}
        </span>
      )}
    </div>
  );
}

export function StatsCards({ stats, loading }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatCard
        label="Total Reservas"
        value={stats.total}
        color="text-white"
        loading={loading}
      />
      <StatCard
        label="Confirmadas"
        value={stats.confirmed}
        color="text-[#4be176]"
        loading={loading}
      />
      <StatCard
        label="Pendientes"
        value={stats.pending}
        color="text-[#f97316]"
        loading={loading}
      />
      <StatCard
        label="Canceladas"
        value={stats.cancelled}
        color="text-[#6b7f8c]"
        loading={loading}
      />
    </div>
  );
}
