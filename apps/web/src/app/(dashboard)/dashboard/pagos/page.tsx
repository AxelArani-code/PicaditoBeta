"use client";

import { useDashboardBookings } from "@/hooks/useDashboardBookings";
import { formatPrice, getPaymentStatusDisplay } from "@/services/bookings.service";
import { LoadingSpinner } from "@/components/dashboard/LoadingSpinner";
import { ErrorBanner } from "@/components/dashboard/ErrorBanner";

// ─── Sub-components ───────────────────────────────────────────────────────────

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#1d3b52] bg-[#102a40]/90 p-4 sm:p-5">
      <p className="text-[10px] font-bold uppercase tracking-wider text-[#9fb3c5] sm:text-[11px]">{label}</p>
      <p className="mt-2 text-xl font-black text-white sm:text-2xl">{value}</p>
    </div>
  );
}

function PaymentPill({ status }: { status: string }) {
  const d = getPaymentStatusDisplay(status);
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${d.borderColor} ${d.bgColor} ${d.color}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${d.color.replace("text-", "bg-")}`} />
      {d.label}
    </span>
  );
}

// Mobile: card per transaction
function TxCard({ booking }: { booking: any }) {
  const date = new Date(booking.date || booking.createdAt);
  const dateStr = !isNaN(date.getTime())
    ? date.toLocaleDateString("es-AR", { day: "2-digit", month: "short" })
    : "—";
  const timeStr = !isNaN(date.getTime())
    ? date.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })
    : "—";

  return (
    <div className="flex items-center justify-between border-t border-[#1d3b52] px-4 py-4">
      <div>
        <p className="text-sm font-bold text-white">{booking.userName || "—"}</p>
        <p className="mt-0.5 text-[11px] text-[#7890a3]">{booking.pitchName || "—"} · {dateStr} {timeStr}</p>
      </div>
      <div className="flex flex-col items-end gap-1.5">
        <span className="text-sm font-black text-white">{formatPrice(booking.totalPrice)}</span>
        <PaymentPill status={booking.paymentStatus} />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PagosPage() {
  const { bookings, loading, error, refetch } = useDashboardBookings();


  const paid = bookings.filter((b: any) => b.paymentStatus?.toLowerCase() === "paid");
  const pending = bookings.filter((b: any) => b.paymentStatus?.toLowerCase() === "pending");

  const totalCobrado = paid.reduce((sum: number, b: any) => sum + (Number(b.totalPrice) || 0), 0);
  const totalPendiente = pending.reduce((sum: number, b: any) => sum + (Number(b.totalPrice) || 0), 0);

  return (
    <div className="min-h-full bg-[#07111d] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">Pagos y señas</h1>
          <p className="mt-1 text-sm text-[#9fb3c5] sm:mt-2">Lo que cobraste y lo que falta cobrar.</p>
        </div>

        {loading ? (
          <LoadingSpinner message="Cargando pagos..." />
        ) : error ? (
          <ErrorBanner message={error} onRetry={refetch} />
        ) : (
          <>
            {/* KPIs — 2 cols on mobile, 3 on sm+ */}
            <div className="mb-6 grid grid-cols-2 gap-3 sm:mb-8 sm:grid-cols-3 sm:gap-4">
              <KpiCard label="Cobrado" value={formatPrice(totalCobrado)} />
              <KpiCard label="Pendiente" value={formatPrice(totalPendiente)} />
              <div className="col-span-2 sm:col-span-1">
                <KpiCard label="Total reservas" value={String(bookings.length)} />
              </div>
            </div>

            {/* Transaction list */}
            <div className="overflow-hidden rounded-xl border border-[#1d3b52] bg-[#102a40]/90">
              <div className="border-b border-[#1d3b52] bg-[#071521]/50 px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#4a6a82]">
                  {bookings.length} transacciones
                </p>
              </div>

              {bookings.length === 0 ? (
                <p className="py-12 text-center text-sm text-[#4a6a82]">Sin transacciones registradas.</p>
              ) : (
                <div>
                  {bookings.map((b: any) => <TxCard key={b.id} booking={b} />)}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
