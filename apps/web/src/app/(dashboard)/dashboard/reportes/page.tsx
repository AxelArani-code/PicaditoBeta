"use client";

import { useDashboardReportes } from "@/hooks/useDashboardReportes";
import { formatPrice } from "@/services/bookings.service";
import { LoadingSpinner } from "@/components/dashboard/LoadingSpinner";
import { ErrorBanner } from "@/components/dashboard/ErrorBanner";

// ─── Sub-components ───────────────────────────────────────────────────────────

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#1d3b52] bg-[#102a40]/90 p-4 sm:p-5">
      <p className="text-[10px] font-bold uppercase tracking-wider text-[#9fb3c5] sm:text-[11px]">{label}</p>
      <p className="mt-2 text-lg font-black text-white sm:text-2xl">{value}</p>
    </div>
  );
}

function BarChart({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data).slice(0, 7);
  const max = Math.max(...entries.map(([, v]) => v), 1);

  return (
    <div className="space-y-4">
      {entries.map(([label, value]) => (
        <div key={label} className="flex items-center gap-3 text-[12px] sm:text-[13px]">
          <span className="w-20 shrink-0 truncate text-[#9fb3c5] sm:w-24">{label}</span>
          <div className="flex-1">
            <div className="h-2.5 w-full rounded-full bg-[#071521]">
              <div
                className="h-full rounded-full bg-[#4be176] transition-all duration-500"
                style={{ width: `${Math.round((value / max) * 100)}%` }}
              />
            </div>
          </div>
          <span className="w-8 shrink-0 text-right font-black text-white">{value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ReportesPage() {
  const { analytics, kpis, loading, error, refetch } = useDashboardReportes();

  // Day-of-week labels mapping from analytics trendByDate
  const dayLabels: Record<number, string> = { 0: "Dom", 1: "Lun", 2: "Mar", 3: "Mié", 4: "Jue", 5: "Vie", 6: "Sáb" };

  // Build weekly chart from busiestHours → use trendByDate for bar chart
  const chartData = analytics?.trendByDate ?? {};

  return (
    <div className="min-h-full bg-[#07111d] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">Reportes</h1>
          <p className="mt-1 text-sm text-[#9fb3c5] sm:mt-2">Un resumen de cómo viene tu complejo.</p>
        </div>

        {loading ? (
          <LoadingSpinner message="Calculando reportes..." />
        ) : error ? (
          <ErrorBanner message={error} onRetry={refetch} />
        ) : (
          <>
            {/* KPIs — 2 cols on mobile, 4 on lg */}
            <div className="mb-6 grid grid-cols-2 gap-3 sm:mb-8 sm:gap-4 lg:grid-cols-4">
              <KpiCard label="Reservas" value={String(kpis?.totalReservations ?? 0)} />
              <KpiCard label="Ingresos" value={formatPrice(kpis?.totalIncome ?? 0)} />
              <KpiCard label="Cancha más usada" value={analytics?.mostUsedPitch ?? "—"} />
              <KpiCard label="Tasa de ocupación" value={`${kpis?.occupancyRate ?? 0}%`} />
            </div>

            {/* Bar chart */}
            <div className="rounded-xl border border-[#1d3b52] bg-[#102a40]/90 p-5 sm:p-8">
              <h2 className="mb-1 text-base font-black text-white sm:text-lg">
                Reservas por período
              </h2>
              <p className="mb-6 text-[12px] text-[#7890a3] sm:text-[13px]">
                Distribución histórica de reservas
              </p>

              {Object.keys(chartData).length === 0 ? (
                <p className="py-8 text-center text-sm text-[#4a6a82]">Sin datos suficientes para mostrar el gráfico.</p>
              ) : (
                <BarChart data={chartData} />
              )}
            </div>

            {/* Booking state breakdown */}
            {analytics?.bookingsByState && Object.keys(analytics.bookingsByState).length > 0 && (
              <div className="mt-4 rounded-xl border border-[#1d3b52] bg-[#102a40]/90 p-5 sm:mt-5 sm:p-8">
                <h2 className="mb-5 text-base font-black text-white sm:text-lg">Estados de reservas</h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {Object.entries(analytics.bookingsByState).map(([state, count]) => (
                    <div key={state} className="rounded-lg border border-[#1d3b52] bg-[#071521]/50 p-3 text-center">
                      <p className="text-lg font-black text-white sm:text-2xl">{String(count)}</p>
                      <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-[#7890a3] sm:text-[11px] capitalize">
                        {state}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
