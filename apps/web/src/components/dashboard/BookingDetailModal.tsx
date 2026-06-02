"use client";

import { X, Calendar, User, DollarSign, Clock, CheckCircle2 } from "lucide-react";
import { PaymentStatusBadge } from "./PaymentStatusBadge";
import {
  getBookingStatusDisplay,
  formatBookingDate,
  formatPrice,
} from "@/services/bookings.service";

interface Booking {
  id: string;
  pitchName: string;
  userName: string;
  status: "pending" | "confirmed" | "rejected" | "cancelled";
  date: string;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
  paymentStatus?: string;
}

interface BookingDetailModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Modal profesional mostrando detalles completos de una reserva
 * - Overlay con blur
 * - Animación suave
 * - Responsive
 * - Estados visuales dinámicos
 */
export function BookingDetailModal({
  booking,
  isOpen,
  onClose,
}: BookingDetailModalProps) {
  if (!isOpen || !booking) {
    return null;
  }

  const statusDisplay = getBookingStatusDisplay(booking.status);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center px-4 py-6 sm:items-center">
      {/* Overlay con blur */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal content */}
      <div className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#0d1610]/95 p-6 shadow-2xl shadow-black/50 backdrop-blur-xl transition duration-200 ease-out animate-in sm:p-8">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6bfe8f]">
              Detalle de Reserva
            </p>
            <h2 className="mt-2 text-2xl font-bold text-[#dce5d9] sm:text-3xl">
              {booking.pitchName}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="rounded-full border border-white/10 bg-white/5 p-2 text-[#bccbb9] transition hover:bg-white/10"
            aria-label="Cerrar modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Status badges grid */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {/* Reservation status */}
          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
            <p className="text-xs text-[#bccbb9]">Estado de Reserva</p>
            <p className={`mt-1 font-semibold ${statusDisplay.color}`}>
              {statusDisplay.label}
            </p>
          </div>

          {/* Payment status */}
          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
            <p className="text-xs text-[#bccbb9]">Pago</p>
            <div className="mt-2">
              <PaymentStatusBadge paymentStatus={booking.paymentStatus} variant="inline" />
            </div>
          </div>

          {/* Reservation ID */}
          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
            <p className="text-xs text-[#bccbb9]">ID</p>
            <p className="mt-1 truncate font-mono text-xs text-[#dce5d9]">
              {booking.id.substring(0, 8)}...
            </p>
          </div>
        </div>

        {/* Details grid */}
        <div className="space-y-4 border-t border-white/10 pt-6">
          {/* Row 1: Usuario y Monto */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1c2c21]/70">
                <User className="h-5 w-5 text-[#6bfe8f]" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-[#bccbb9]">Solicitante</p>
                <p className="mt-1 font-semibold text-[#dce5d9]">{booking.userName}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1c2c21]/70">
                <DollarSign className="h-5 w-5 text-[#ffd05a]" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-[#bccbb9]">Monto Total</p>
                <p className="mt-1 font-semibold text-[#dce5d9]">
                  {formatPrice(booking.totalPrice)}
                </p>
              </div>
            </div>
          </div>

          {/* Row 2: Fechas */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1c2c21]/70">
                <Calendar className="h-5 w-5 text-[#adc6ff]" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-[#bccbb9]">Fecha de Reserva</p>
                <p className="mt-1 font-semibold text-[#dce5d9]">
                  {formatBookingDate(booking.date)}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1c2c21]/70">
                <Clock className="h-5 w-5 text-[#ff6b6b]" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-[#bccbb9]">Creada hace</p>
                <p className="mt-1 font-semibold text-[#dce5d9]">
                  {getRelativeTime(booking.createdAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Row 3: Actualizada */}
          <div className="flex gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1c2c21]/70">
              <CheckCircle2 className="h-5 w-5 text-[#6bfe8f]" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-[#bccbb9]">Última actualización</p>
              <p className="mt-1 font-semibold text-[#dce5d9]">
                {formatBookingDate(booking.updatedAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Footer action */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-full bg-[#4be176] px-6 py-2.5 text-sm font-semibold text-[#0b170d] transition hover:bg-[#52ec7b]"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Calcula tiempo relativo desde una fecha
 */
function getRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Hace unos segundos";
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;

    return formatBookingDate(dateString);
  } catch {
    return formatBookingDate(dateString);
  }
}
