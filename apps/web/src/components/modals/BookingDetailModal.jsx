"use client";

import React from "react";
import { X, Users, Check, Loader2 } from "lucide-react";
import { formatBookingDate, formatPrice, getBookingStatusDisplay } from "@/services/bookings.service";
import { PaymentStatusBadge } from "@/components/dashboard/PaymentStatusBadge";

export default function BookingDetailModal({ booking, isOpen, onClose }) {
  if (!isOpen) return null;

  const statusDisplay = getBookingStatusDisplay(booking?.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 backdrop-blur-sm bg-black/40" onClick={onClose} />

      <div className="relative z-10 mx-4 max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl border border-white/10 bg-[#0b120b] p-6 shadow-lg animate-fade-in">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">Detalle de reserva</h3>
            <p className="mt-1 text-xs text-[#bccbb9]">ID: {booking?.id}</p>
          </div>
          <button onClick={onClose} className="rounded-full bg-transparent p-2 text-[#bccbb9] hover:bg-white/5">
            <X className="h-4 w-4" />
          </button>
        </div>

        {!booking ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-[#6bfe8f]" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-[#bccbb9]">Cancha</p>
                <h4 className="text-xl font-semibold">{booking.pitchName}</h4>
                <p className="mt-1 text-sm text-[#bccbb9]">Reservado por {booking.userName}</p>
              </div>
              <div className="text-right">
                <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${statusDisplay.borderColor} ${statusDisplay.bgColor}`}>
                  {statusDisplay.label}
                </span>
                <div className="mt-2">
                  <PaymentStatusBadge paymentStatus={booking.paymentStatus} variant="detail" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
                <p className="text-xs text-[#bccbb9]">Fecha</p>
                <p className="mt-1 text-sm text-[#dce5d9]">{formatBookingDate(booking.date)}</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
                <p className="text-xs text-[#bccbb9]">Monto</p>
                <p className="mt-1 text-sm text-[#6bfe8f]">{formatPrice(booking.totalPrice)}</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
                <p className="text-xs text-[#bccbb9]">Creado</p>
                <p className="mt-1 text-sm text-[#dce5d9]">{formatBookingDate(booking.createdAt)}</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
                <p className="text-xs text-[#bccbb9]">Actualizado</p>
                <p className="mt-1 text-sm text-[#dce5d9]">{formatBookingDate(booking.updatedAt)}</p>
              </div>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
              <p className="text-xs text-[#bccbb9]">Información completa</p>
              <pre className="mt-2 max-h-40 overflow-auto text-xs text-[#9ab59d]">{JSON.stringify(booking, null, 2)}</pre>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button onClick={onClose} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-[#bccbb9]">Cerrar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
