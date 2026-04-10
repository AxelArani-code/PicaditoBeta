"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Calendar,
  User,
  DollarSign,
  Clock,
  CheckCircle2,
  Loader2,
  CheckCheck,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { confirmBookingAdmin, cancelBookingAdmin } from "@/services/admin-bookings.service";
import {
  getBookingStatusDisplay,
  formatBookingDate,
  formatPrice,
} from "@/services/bookings.service";

// ─── Types ────────────────────────────────────────────────────────────────────

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
  venueName?: string;
}

interface BookingDetailsModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  /** Called after a successful action so the parent can refresh its data. */
  onActionSuccess?: (bookingId: string, newStatus: "confirmed" | "cancelled") => void;
}

// ─── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  pending: {
    label: "PENDIENTE",
    badgeClass: "border-[#ffd05a]/60 bg-[#ffd05a]/10 text-[#ffd05a]",
    dotClass: "bg-[#ffd05a]",
  },
  confirmed: {
    label: "CONFIRMADA",
    badgeClass: "border-[#1cff87]/50 bg-[#1cff87]/10 text-[#1cff87]",
    dotClass: "bg-[#1cff87]",
  },
  rejected: {
    label: "RECHAZADA",
    badgeClass: "border-[#ff6b6b]/60 bg-[#ff6b6b]/10 text-[#ff6b6b]",
    dotClass: "bg-[#ff6b6b]",
  },
  cancelled: {
    label: "CANCELADA",
    badgeClass: "border-[#56d6ff]/30 bg-[#56d6ff]/5 text-[#7fafc4]",
    dotClass: "bg-[#7fafc4]",
  },
} as const;

const PAYMENT_CONFIG: Record<string, { label: string; className: string }> = {
  paid: { label: "PAGADO", className: "text-[#1cff87]" },
  pending: { label: "PENDIENTE", className: "text-[#ffd05a]" },
  failed: { label: "FALLIDO", className: "text-[#ff6b6b]" },
  refunded: { label: "REEMBOLSADO", className: "text-[#56d6ff]" },
};

// ─── Helper ────────────────────────────────────────────────────────────────────

function getRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60_000);
    const diffHours = Math.floor(diffMs / 3_600_000);
    const diffDays = Math.floor(diffMs / 86_400_000);

    if (diffMins < 1) return "Hace unos segundos";
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return formatBookingDate(dateString);
  } catch {
    return formatBookingDate(dateString);
  }
}

// ─── Toast ─────────────────────────────────────────────────────────────────────

function Toast({
  message,
  variant,
}: {
  message: string;
  variant: "success" | "error";
}) {
  return (
    <div
      className={`fixed bottom-6 left-1/2 z-[9999] -translate-x-1/2 flex items-center gap-3 rounded-2xl border px-5 py-3 text-sm font-semibold shadow-2xl backdrop-blur-sm transition-all
        ${
          variant === "success"
            ? "border-[#1cff87]/30 bg-[#071520]/95 text-[#1cff87]"
            : "border-[#ff6b6b]/30 bg-[#150a0a]/95 text-[#ff6b6b]"
        }`}
      role="alert"
    >
      {variant === "success" ? (
        <CheckCircle2 className="h-4 w-4 shrink-0" />
      ) : (
        <XCircle className="h-4 w-4 shrink-0" />
      )}
      {message}
    </div>
  );
}

// ─── Cancel Confirm Dialog ─────────────────────────────────────────────────────

function CancelConfirmDialog({
  onConfirm,
  onDismiss,
  isLoading,
}: {
  onConfirm: () => void;
  onDismiss: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-[1.75rem] bg-[#071520]/90 backdrop-blur-sm">
      <div className="mx-6 rounded-2xl border border-[#ff6b6b]/30 bg-[#0d1e2b] p-6 text-center shadow-2xl">
        <div className="mb-4 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#ff6b6b]/30 bg-[#ff6b6b]/10">
            <AlertTriangle className="h-7 w-7 text-[#ff6b6b]" />
          </div>
        </div>
        <h3 className="mb-1 text-base font-bold text-white">¿Cancelar este turno?</h3>
        <p className="mb-6 text-sm text-[#7fafc4]">
          Esta acción no se puede deshacer. El turno pasará al estado{" "}
          <span className="font-semibold text-[#a6b8c4]">Cancelado</span>.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onDismiss}
            disabled={isLoading}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-[#234253] bg-transparent px-5 text-sm font-semibold text-[#a6b8c4] transition hover:border-[#2c5368] hover:text-white disabled:opacity-50"
          >
            Mantener
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-[#ff6b6b]/50 bg-[#ff6b6b]/10 px-5 text-sm font-bold text-[#ff6b6b] transition hover:bg-[#ff6b6b]/20 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            {isLoading ? "Cancelando..." : "Sí, cancelar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function BookingDetailsModal({
  booking,
  isOpen,
  onClose,
  onActionSuccess,
}: BookingDetailsModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState<"confirm" | "cancel" | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(
    null
  );

  if (!isOpen || !booking) return null;

  const statusCfg = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.pending;
  const paymentCfg =
    PAYMENT_CONFIG[(booking.paymentStatus ?? "pending").toLowerCase()] ?? PAYMENT_CONFIG.pending;
  const isPending = booking.status === "pending";
  const isConfirmed = booking.status === "confirmed";

  const showToast = (message: string, variant: "success" | "error") => {
    setToast({ message, variant });
    window.setTimeout(() => setToast(null), 4000);
  };

  const handleConfirm = async () => {
    if (isSubmitting) return;
    setIsSubmitting("confirm");
    const result = await confirmBookingAdmin(booking.id);
    setIsSubmitting(null);

    if (result.ok) {
      showToast("✅ Reserva confirmada correctamente.", "success");
      onActionSuccess?.(booking.id, "confirmed");
      window.setTimeout(() => {
        onClose();
        router.refresh();
      }, 1200);
    } else {
      showToast(result.error, "error");
    }
  };

  const handleCancel = async () => {
    if (isSubmitting) return;
    setIsSubmitting("cancel");
    const result = await cancelBookingAdmin(booking.id);
    setIsSubmitting(null);
    setShowCancelConfirm(false);

    if (result.ok) {
      showToast("Turno cancelado exitosamente.", "success");
      onActionSuccess?.(booking.id, "cancelled");
      window.setTimeout(() => {
        onClose();
        router.refresh();
      }, 1200);
    } else {
      showToast(result.error, "error");
    }
  };

  return (
    <>
      {/* ── Overlay ── */}
      <div className="fixed inset-0 z-50 flex items-end justify-center px-4 py-6 sm:items-center">
        <div
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={isSubmitting || showCancelConfirm ? undefined : onClose}
        />

        {/* ── Panel ── */}
        <div
          className="relative w-full max-w-2xl overflow-hidden rounded-[1.75rem] border border-[#1b3442] bg-[#071520] p-6 shadow-[0_32px_80px_rgba(0,0,0,0.8)] sm:p-8"
          style={{ animation: "bookingModalIn 0.22s ease-out" }}
        >
          {/* ── Cancel Confirm Overlay ── */}
          {showCancelConfirm && (
            <CancelConfirmDialog
              onConfirm={handleCancel}
              onDismiss={() => setShowCancelConfirm(false)}
              isLoading={isSubmitting === "cancel"}
            />
          )}

          {/* ── Header ── */}
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#28d7ff]">
                Detalle de Reserva
              </p>
              <h2 className="mt-2 text-2xl font-extrabold leading-tight text-white sm:text-3xl">
                {booking.pitchName}
              </h2>
              {booking.venueName && (
                <p className="mt-1 text-sm text-[#7fafc4]">{booking.venueName}</p>
              )}
            </div>

            <button
              id="booking-details-modal-close"
              onClick={isSubmitting ? undefined : onClose}
              disabled={!!isSubmitting}
              className="rounded-full border border-[#1b3442] bg-[#0a2231] p-2 text-[#577080] transition hover:border-[#234253] hover:text-[#a6b8c4] disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Cerrar modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* ── Top badges grid ── */}
          <div className="mb-7 grid grid-cols-3 gap-3">
            {/* Estado */}
            <div className="rounded-xl border border-[#1b3442] bg-[#0a2231]/60 p-3">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#577080]">
                Estado
              </p>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${statusCfg.badgeClass}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dotClass}`} />
                {statusCfg.label}
              </span>
            </div>

            {/* Pago */}
            <div className="rounded-xl border border-[#1b3442] bg-[#0a2231]/60 p-3">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#577080]">
                Pago
              </p>
              <p className={`text-sm font-bold ${paymentCfg.className}`}>{paymentCfg.label}</p>
            </div>

            {/* ID */}
            <div className="rounded-xl border border-[#1b3442] bg-[#0a2231]/60 p-3">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#577080]">
                ID
              </p>
              <p className="truncate font-mono text-[11px] text-[#56d6ff]/70">
                #{booking.id.slice(0, 8)}
              </p>
            </div>
          </div>

          {/* ── Detail grid ── */}
          <div className="grid grid-cols-1 gap-4 border-t border-[#1b3442] pt-6 sm:grid-cols-2">
            {/* Solicitante */}
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#56d6ff]/10 border border-[#56d6ff]/15">
                <User className="h-5 w-5 text-[#56d6ff]" />
              </div>
              <div>
                <p className="text-[11px] text-[#577080]">Solicitante</p>
                <p className="mt-0.5 font-semibold text-white">{booking.userName}</p>
              </div>
            </div>

            {/* Monto */}
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ffd05a]/10 border border-[#ffd05a]/15">
                <DollarSign className="h-5 w-5 text-[#ffd05a]" />
              </div>
              <div>
                <p className="text-[11px] text-[#577080]">Monto Total</p>
                <p className="mt-0.5 font-semibold text-white">{formatPrice(booking.totalPrice)}</p>
              </div>
            </div>

            {/* Fecha reserva */}
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#28d7ff]/10 border border-[#28d7ff]/15">
                <Calendar className="h-5 w-5 text-[#28d7ff]" />
              </div>
              <div>
                <p className="text-[11px] text-[#577080]">Fecha de Reserva</p>
                <p className="mt-0.5 font-semibold text-white">{formatBookingDate(booking.date)}</p>
              </div>
            </div>

            {/* Creada hace */}
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ff6b6b]/10 border border-[#ff6b6b]/15">
                <Clock className="h-5 w-5 text-[#ff6b6b]" />
              </div>
              <div>
                <p className="text-[11px] text-[#577080]">Creada hace</p>
                <p className="mt-0.5 font-semibold text-white">
                  {getRelativeTime(booking.createdAt)}
                </p>
              </div>
            </div>

            {/* Última actualización */}
            <div className="flex items-start gap-3 sm:col-span-2">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1cff87]/10 border border-[#1cff87]/15">
                <CheckCircle2 className="h-5 w-5 text-[#1cff87]" />
              </div>
              <div>
                <p className="text-[11px] text-[#577080]">Última actualización</p>
                <p className="mt-0.5 font-semibold text-white">
                  {formatBookingDate(booking.updatedAt)}
                </p>
              </div>
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="mt-8 flex items-center justify-end gap-3 border-t border-[#1b3442] pt-6">
            {isPending ? (
              <>
                {/* Cancel button */}
                <button
                  id="booking-details-modal-cancel"
                  onClick={handleCancel}
                  disabled={!!isSubmitting}
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-[#ff6b6b]/40 bg-transparent px-6 text-sm font-bold text-[#ff6b6b] transition hover:border-[#ff6b6b]/80 hover:bg-[#ff6b6b]/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting === "cancel" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  {isSubmitting === "cancel" ? "Cancelando..." : "Cancelar Reserva"}
                </button>

                {/* Confirm button */}
                <button
                  id="booking-details-modal-confirm"
                  onClick={handleConfirm}
                  disabled={!!isSubmitting}
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-gradient-to-r from-[#1cff87] to-[#28d7ff] px-6 text-sm font-bold text-[#071520] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting === "confirm" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCheck className="h-4 w-4" />
                  )}
                  {isSubmitting === "confirm" ? "Confirmando..." : "Confirmar Reserva"}
                </button>
              </>
            ) : isConfirmed ? (
              <>
                {/* Close button for confirmed */}
                <button
                  id="booking-details-modal-close-footer"
                  onClick={onClose}
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-[#234253] bg-[#0a2231] px-6 text-sm font-semibold text-[#a6b8c4] transition hover:border-[#2c5368] hover:text-white"
                >
                  Cerrar
                </button>

                {/* Cancel confirmed booking */}
                <button
                  id="booking-details-modal-cancel-confirmed"
                  onClick={() => setShowCancelConfirm(true)}
                  disabled={!!isSubmitting}
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-[#ff6b6b]/40 bg-[#ff6b6b]/8 px-6 text-sm font-bold text-[#ff6b6b] transition hover:border-[#ff6b6b]/70 hover:bg-[#ff6b6b]/15 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <XCircle className="h-4 w-4" />
                  Cancelar Turno
                </button>
              </>
            ) : (
              /* Other non-actionable states (rejected, cancelled): only close */
              <button
                id="booking-details-modal-close-footer"
                onClick={onClose}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-gradient-to-r from-[#1cff87] to-[#28d7ff] px-8 text-sm font-bold text-[#071520] transition hover:opacity-90"
              >
                Cerrar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Toast notification ── */}
      {toast && <Toast message={toast.message} variant={toast.variant} />}

      {/* ── Animation keyframes ── */}
      <style>{`
        @keyframes bookingModalIn {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)     scale(1);    }
        }
      `}</style>
    </>
  );
}
