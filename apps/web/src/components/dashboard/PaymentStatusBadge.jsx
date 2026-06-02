"use client";

import React from "react";

export function PaymentStatusBadge({ paymentStatus = "pending", variant = "card" }) {
  const map = {
    paid: { label: "Pagado", color: "bg-emerald-600 text-white" },
    pending: { label: "Pendiente", color: "bg-yellow-500 text-black" },
    failed: { label: "Fallido", color: "bg-red-500 text-white" },
  };

  const info = map[paymentStatus] || map.pending;

  const base = variant === "card" ? "px-2 py-1 text-xs font-semibold rounded-full" : "px-3 py-1 text-sm font-medium rounded-full";

  return (
    <span className={`${base} ${info.color} inline-flex items-center gap-2`}>{info.label}</span>
  );
}

export default PaymentStatusBadge;
