"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { useDashboardBookings } from "@/hooks/useDashboardBookings";
import { getBookingStatusDisplay, getPaymentStatusDisplay, formatPrice } from "@/services/bookings.service";
import { LoadingSpinner } from "@/components/dashboard/LoadingSpinner";
import { ErrorBanner } from "@/components/dashboard/ErrorBanner";

// ─── Types ────────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "pending", label: "Pendiente" },
  { value: "confirmed", label: "Confirmado" },
  { value: "rejected", label: "Rechazado" },
  { value: "cancelled", label: "Cancelado" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusPill({ status }: { status: string }) {
  const display = getBookingStatusDisplay(status);
  return (
    <span className={`inline-flex h-5 items-center rounded-full border px-2 text-[10px] font-bold ${display.borderColor} ${display.bgColor} ${display.color}`}>
      {display.label}
    </span>
  );
}

function PaymentPill({ status }: { status: string }) {
  const display = getPaymentStatusDisplay(status);
  return (
    <span className={`inline-flex h-5 items-center rounded-full border px-2 text-[10px] font-bold ${display.borderColor} ${display.bgColor} ${display.color}`}>
      {display.label}
    </span>
  );
}

// Mobile card view for each booking
function BookingCard({ booking }: { booking: any }) {
  const date = new Date(booking.date || booking.createdAt);
  const timeStr = !isNaN(date.getTime())
    ? date.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })
    : "—";
  const dateStr = !isNaN(date.getTime())
    ? date.toLocaleDateString("es-AR", { day: "2-digit", month: "short" })
    : "—";

  return (
    <div className="rounded-xl border border-[#1d3b52] bg-[#102a40]/90 p-4">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-white">{booking.userName || "—"}</p>
          <p className="text-[11px] text-[#7890a3]">{booking.pitchName || "—"}</p>
        </div>
        <StatusPill status={booking.status} />
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[#9fb3c5]">
        <span>{dateStr} · {timeStr}</span>
        <span>{formatPrice(booking.totalPrice)}</span>
        <PaymentPill status={booking.paymentStatus} />
      </div>
    </div>
  );
}

// Desktop table row
function BookingRow({ booking }: { booking: any }) {
  const date = new Date(booking.date || booking.createdAt);
  const timeStr = !isNaN(date.getTime())
    ? date.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })
    : "—";
  const dateStr = !isNaN(date.getTime())
    ? date.toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" })
    : "—";

  return (
    <tr className="border-t border-[#1d3b52] transition hover:bg-[#0c1f2e]/50">
      <td className="px-4 py-3 text-sm font-semibold text-white">{booking.userName || "—"}</td>
      <td className="px-4 py-3 text-[13px] text-[#9fb3c5]">{booking.pitchName || "—"}</td>
      <td className="px-4 py-3 text-[13px] text-[#9fb3c5]">{dateStr}</td>
      <td className="px-4 py-3 text-[13px] text-[#9fb3c5]">{timeStr}</td>
      <td className="px-4 py-3 text-[13px] font-bold text-white">{formatPrice(booking.totalPrice)}</td>
      <td className="px-4 py-3"><StatusPill status={booking.status} /></td>
      <td className="px-4 py-3"><PaymentPill status={booking.paymentStatus} /></td>
      <td className="px-4 py-3 text-right">
        <button className="inline-flex h-7 items-center gap-1 rounded-full border border-[#1d3b52] px-2.5 text-[11px] font-bold text-[#9fb3c5] transition hover:border-[#2d5a73] hover:text-white">
          <Eye className="h-3.5 w-3.5" />
          Ver
        </button>
      </td>
    </tr>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TurnosPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const { bookings, totalCount, totalPages, loading, error, filters, setFilters, refetch } =
    useDashboardBookings({ status: statusFilter });

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setFilters((f: any) => ({ ...f, status: value || undefined, pageNumber: 1 }));
  };

  const handlePage = (delta: number) => {
    setFilters((f: any) => ({ ...f, pageNumber: Math.max(1, (f.pageNumber ?? 1) + delta) }));
  };

  return (
    <div className="min-h-full bg-[#07111d] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">Turnos</h1>
            <p className="mt-1 text-sm text-[#9fb3c5] sm:mt-2">
              {loading ? "Cargando..." : `${totalCount} reservas en total`}
            </p>
          </div>

          {/* Status filter */}
          <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleStatusChange(opt.value)}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-[12px] font-bold transition ${
                  statusFilter === opt.value
                    ? "border-[#4be176] bg-[#4be176]/15 text-[#4be176]"
                    : "border-[#1d3b52] text-[#7890a3] hover:border-[#2d5a73] hover:text-white"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <LoadingSpinner message="Cargando turnos..." />
        ) : error ? (
          <ErrorBanner message={error} onRetry={refetch} />
        ) : bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-[#4a6a82]">No hay turnos para los filtros seleccionados.</p>
          </div>
        ) : (
          <>
            {/* Mobile: cards */}
            <div className="space-y-3 sm:hidden">
              {bookings.map((b: any) => <BookingCard key={b.id} booking={b} />)}
            </div>

            {/* Tablet/Desktop: table */}
            <div className="hidden sm:block overflow-hidden rounded-xl border border-[#1d3b52] bg-[#102a40]/90">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#1d3b52] bg-[#071521]/50">
                      {["Cliente", "Cancha", "Fecha", "Hora", "Total", "Estado", "Pago", ""].map((h) => (
                        <th key={h} className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#4a6a82]">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b: any) => <BookingRow key={b.id} booking={b} />)}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-5 flex items-center justify-between text-[13px] text-[#7890a3]">
                <span>Página {filters.pageNumber} de {totalPages}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePage(-1)}
                    disabled={(filters.pageNumber ?? 1) <= 1}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[#1d3b52] transition hover:border-[#2d5a73] disabled:opacity-30"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handlePage(1)}
                    disabled={(filters.pageNumber ?? 1) >= totalPages}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[#1d3b52] transition hover:border-[#2d5a73] disabled:opacity-30"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
