"use client";

import { X, AlertTriangle } from "lucide-react";

export default function BookingConfirmationModal({
  open,
  title,
  message,
  confirmLabel,
  onClose,
  onConfirm,
  loading,
  error,
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center px-4 py-6 sm:items-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative w-full max-w-xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#0d1610]/95 p-6 shadow-2xl shadow-black/50 backdrop-blur-xl transition duration-200 ease-out sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-[#1c2c21] p-3 text-[#6bfe8f] shadow-inner shadow-[#2f5c33]/40">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white sm:text-xl">{title}</h2>
              <p className="mt-1 text-sm text-[#bccbb9]">{message}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 bg-white/5 p-2 text-[#bccbb9] transition hover:bg-white/10"
            aria-label="Cerrar modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-[#dce5d9] transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="w-full rounded-full bg-[#4be176] px-4 py-3 text-sm font-semibold text-[#0b170d] transition hover:bg-[#52ec7b] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {loading ? "Procesando..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
