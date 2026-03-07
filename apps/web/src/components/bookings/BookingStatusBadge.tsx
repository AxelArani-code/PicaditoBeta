import type { BookingStatus } from "@/types";

const STATUS_CONFIG: Record<BookingStatus, { label: string; className: string }> = {
    pending: { label: "Pendiente", className: "status-pending" },
    confirmed: { label: "Confirmada", className: "status-confirmed" },
    rejected: { label: "Rechazada", className: "status-rejected" },
    cancelled: { label: "Cancelada", className: "status-cancelled" },
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
    const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${config.className}`}>
            {config.label}
        </span>
    );
}
