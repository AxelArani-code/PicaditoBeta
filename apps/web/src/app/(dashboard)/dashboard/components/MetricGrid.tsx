"use client";

// ─────────────────────────────────────────────────────────────────────────────
// MetricGrid.tsx — Dashboard KPI widgets
// Conectado a /api/admin/stats vía useAdminStats.
// Muestra skeleton durante la carga y valores reales cuando están disponibles.
// ─────────────────────────────────────────────────────────────────────────────

import { CalendarCheck, Clock3, DollarSign, Users } from "lucide-react";
import { useAdminStats } from "@/hooks/useAdminStats";
import { DashboardPanel } from "./DashboardPanel";

// ── Skeleton shimmer ──────────────────────────────────────────────────────────

function SkeletonValue() {
  return (
    <div className="mt-5 h-10 w-24 animate-pulse rounded-lg bg-[#1d3b52]" />
  );
}

function SkeletonDetail() {
  return (
    <div className="mt-2 h-3 w-40 animate-pulse rounded bg-[#1d3b52]/70" />
  );
}

// ── Metric card ───────────────────────────────────────────────────────────────

function MetricCard({
  title,
  value,
  detail,
  icon: Icon,
  highlight = false,
  isLoading,
}: {
  title: string;
  value: string;
  detail: string;
  icon: React.ElementType;
  highlight?: boolean;
  isLoading: boolean;
}) {
  return (
    <DashboardPanel className="p-5 border-[#1d3b52] bg-[#102a40]/90">
      <div className="flex items-center gap-3 text-[#9fb3c5]">
        <Icon className={`h-4 w-4 ${highlight ? "text-[#4be176]" : "text-[#67a6d8]"}`} />
        <p className="text-sm font-semibold">{title}</p>
      </div>
      {isLoading ? (
        <>
          <SkeletonValue />
          <SkeletonDetail />
        </>
      ) : (
        <>
          <p className={`mt-5 text-4xl font-black ${highlight ? "text-[#4be176]" : "text-white"}`}>
            {value}
          </p>
          <p className="mt-2 text-[13px] text-[#7890a3]">{detail}</p>
        </>
      )}
    </DashboardPanel>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function MetricGrid() {
  const { stats, isLoading } = useAdminStats();

  const formatRevenue = (n: number) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(n);

  const metrics = [
    {
      title:   "Turnos de hoy",
      value:   String(stats?.todayBookings ?? 0),
      detail:  stats
        ? `${stats.todayConfirmed} confirmados · ${stats.todayPending} a confirmar · ${stats.todayCancelled} cancelados`
        : "—",
      icon:      CalendarCheck,
      highlight: false,
    },
    {
      title:   "Para confirmar",
      value:   String(stats?.pendingToConfirm ?? 0),
      detail:  "Reservas esperando tu aprobación",
      icon:    Clock3,
      highlight: (stats?.pendingToConfirm ?? 0) > 0,
    },
    {
      title:   "Clientes",
      value:   String(stats?.totalClients ?? 0),
      detail:  "Jugadores registrados",
      icon:    Users,
      highlight: false,
    },
    {
      title:   "Ingresos de hoy",
      value:   formatRevenue(stats?.todayRevenue ?? 0),
      detail:  "De los turnos confirmados",
      icon:    DollarSign,
      highlight: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map(({ title, value, detail, icon, highlight }) => (
        <MetricCard
          key={title}
          title={title}
          value={value}
          detail={detail}
          icon={icon}
          highlight={highlight}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}
