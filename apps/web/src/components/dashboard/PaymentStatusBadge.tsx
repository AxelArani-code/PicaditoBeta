"use client";

import { getPaymentStatusDisplay } from "@/services/bookings.service";

interface PaymentStatusBadgeProps {
  paymentStatus: string;
  variant?: "card" | "modal" | "inline";
  className?: string;
}

/**
 * Badge reutilizable para mostrar estado de pago
 * Soporta múltiples variantes visuales
 */
export function PaymentStatusBadge({
  paymentStatus,
  variant = "card",
  className = "",
}: PaymentStatusBadgeProps) {
  const display = getPaymentStatusDisplay(paymentStatus);

  if (variant === "inline") {
    return (
      <span className={`inline-block text-xs font-semibold ${display.color} ${className}`}>
        {display.label}
      </span>
    );
  }

  if (variant === "modal") {
    return (
      <div className={`rounded-lg border ${display.borderColor} ${display.bgColor} px-3 py-2 ${className}`}>
        <p className={`text-xs font-semibold uppercase tracking-wider ${display.color}`}>
          {display.label}
        </p>
      </div>
    );
  }

  // Default: card
  return (
    <span className={`inline-flex rounded-full border ${display.borderColor} ${display.bgColor} px-2.5 py-1 text-xs font-semibold ${display.color} ${className}`}>
      {display.label}
    </span>
  );
}
