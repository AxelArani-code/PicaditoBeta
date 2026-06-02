"use client";

import { useCallback, useMemo, useState } from "react";
import { createBooking } from "@/services/bookings.service";

const PAYMENT_METHODS = [
  { id: "card", label: "Tarjeta de crédito", helper: "Visa, MasterCard, Amex" },
  { id: "paypal", label: "PayPal", helper: "Pago instantáneo seguro" },
  { id: "cash", label: "Pago en efectivo", helper: "Paga en la sede" },
];

export function useBookingCheckout(initialBooking = null) {
  const [booking, setBooking] = useState(initialBooking);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const total = useMemo(() => {
    if (!booking) return 0;
    const base = Number(booking.price || 0);
    const serviceFee = Math.round(base * 0.06);
    const insurance = 1200;
    return base + serviceFee + insurance;
  }, [booking]);

  const create = useCallback(async () => {
    if (!booking) {
      setError("No hay datos de reserva disponibles");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        pitch_id: booking.pitchId,
        date: booking.date,
        start_time: booking.start_time,
        end_time: booking.end_time,
        notes,
      };
      const response = await createBooking(payload);
      setSuccess(response);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido al crear la reserva");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [booking, notes]);

  const updateBooking = useCallback((next) => {
    setBooking((current) => ({ ...current, ...next }));
  }, []);

  return {
    booking,
    paymentMethod,
    notes,
    loading,
    error,
    success,
    total,
    setPaymentMethod,
    setNotes,
    create,
    updateBooking,
    PAYMENT_METHODS,
  };
}
