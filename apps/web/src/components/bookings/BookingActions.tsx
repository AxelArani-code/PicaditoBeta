"use client";

import { CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useTransition } from "react";
import {
  confirmBooking,
  rejectBooking,
} from "@/services/bookings.service";

export function BookingActions({ bookingId }: { bookingId: string }) {
    const [isPending, startTransition] = useTransition();

    const handleConfirm = () => {
        startTransition(async () => {
            try {
                await confirmBooking(bookingId);
                toast.success("Reserva confirmada. El partido fue creado automáticamente.");
            } catch (err) {
                const message = err instanceof Error ? err.message : "Error al confirmar la reserva";
                toast.error(message);
            }
        });
    };

    const handleReject = () => {
        startTransition(async () => {
            try {
                await rejectBooking(bookingId);
                toast.error("Reserva rechazada");
            } catch (err) {
                const message = err instanceof Error ? err.message : "Error al rechazar la reserva";
                toast.error(message);
            }
        });
    };

    return (
        <div className="flex shrink-0 gap-2">
            <button
                onClick={handleConfirm}
                disabled={isPending}
                className="flex items-center gap-1.5 rounded-lg bg-green-500/15 px-3 py-1.5 text-xs font-semibold text-green-400 transition-all hover:bg-green-500/25 disabled:opacity-50"
            >
                <CheckCircle className="h-3.5 w-3.5" />
                Confirmar
            </button>
            <button
                onClick={handleReject}
                disabled={isPending}
                className="flex items-center gap-1.5 rounded-lg bg-red-500/15 px-3 py-1.5 text-xs font-semibold text-red-400 transition-all hover:bg-red-500/25 disabled:opacity-50"
            >
                <XCircle className="h-3.5 w-3.5" />
                Rechazar
            </button>
        </div>
    );
}
