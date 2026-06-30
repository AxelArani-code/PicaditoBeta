import {
  CheckCircle2,
  ChevronRight,
  Eye,
  Loader2,
  Pencil,
  RefreshCw,
  SlidersHorizontal,
  XCircle,
} from "lucide-react";
import Pagination from "@/components/dashboard/Pagination";
import EmptyState from "@/components/dashboard/EmptyState";
import { transformBookingForUI } from "@/hooks/useBookings";
import { DashboardPanel } from "./DashboardPanel";
import type { Booking, DashboardAnalytics } from "./types";

type BookingsBoardProps = {
  bookings: Booking[];
  totalCount: number;
  totalPages: number;
  pageNumber: number;
  loading: boolean;
  statusFilter: string;
  actionLoading: string | null;
  sortBy: string;
  autoRefreshEnabled: boolean;
  selectedVenueLabel: string;
  analytics: DashboardAnalytics;
  onStatusFilterChange: (newStatus: string) => void;
  onSortChange: (newSortBy: string) => void;
  onToggleAutoRefresh: (enabled: boolean) => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  onOpenDetail: (booking: Booking) => void;
  onOpenAction: (booking: Booking, type: "confirm" | "reject") => void;
  onCancelBooking: (bookingId: string) => void;
};

export function BookingsBoard({
  bookings,
  totalCount,
  totalPages,
  pageNumber,
  loading,
  statusFilter,
  actionLoading,
  sortBy,
  autoRefreshEnabled,
  selectedVenueLabel,
  analytics,
  onStatusFilterChange,
  onSortChange,
  onToggleAutoRefresh,
  onPrevPage,
  onNextPage,
  onOpenDetail,
  onOpenAction,
  onCancelBooking,
}: BookingsBoardProps) {
  const visibleCountLabel = `${bookings.length} en pantalla`;

  return (
    <DashboardPanel className="overflow-hidden rounded-lg border-[#1d3b52] bg-[#102a40]/95 shadow-none">
      <div className="flex flex-col gap-3 border-b border-[#1d3b52] px-4 py-4 sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-bold text-white">Próximos turnos de hoy</h2>

          <button
            type="button"
            onClick={() => onStatusFilterChange("all")}
            className="text-xs font-bold text-[#67a6d8] hover:underline"
          >
            Ver todos
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex min-h-[240px] items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-[#9fb3c5]">
            <Loader2 className="h-8 w-8 animate-spin text-[#4be176]" />
            <p className="text-sm">Cargando reservas...</p>
          </div>
        </div>
      )}

      {!loading && bookings.length === 0 && (
        <div className="p-5">
          <EmptyState
            title={statusFilter === "all" ? "No hay reservas para mostrar" : `No hay reservas ${statusFilter}`}
            description="Proba cambiando filtros, estado o sede para ampliar la busqueda."
          />
        </div>
      )}

      {!loading && bookings.length > 0 && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead className="bg-[#0b1f30]/70 text-[10px] uppercase text-[#7890a3]">
                <tr>
                  <th className="px-4 py-3 font-bold sm:px-5">Hora</th>
                  <th className="px-4 py-3 font-bold sm:px-5">Cancha</th>
                  <th className="px-4 py-3 font-bold sm:px-5">Deporte</th>
                  <th className="px-4 py-3 font-bold sm:px-5">Cliente</th>
                  <th className="px-4 py-3 font-bold sm:px-5">Estado</th>
                  <th className="px-4 py-3 text-right font-bold sm:px-5">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1d3b52] text-sm">
                {bookings.map((booking, index) => (
                  <BookingRow
                    key={booking.id}
                    booking={booking}
                    fallbackHour={`${18 + index}:00`}
                    isActionLoading={actionLoading === booking.id}
                    onOpenDetail={onOpenDetail}
                    onOpenAction={onOpenAction}
                    onCancelBooking={onCancelBooking}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="border-t border-[#1d3b52] px-4 py-3 sm:px-5">
              <Pagination pageNumber={pageNumber} totalPages={totalPages} onPrev={onPrevPage} onNext={onNextPage} />
            </div>
          )}
        </>
      )}
    </DashboardPanel>
  );
}

type BookingRowProps = {
  booking: Booking;
  fallbackHour: string;
  isActionLoading: boolean;
  onOpenDetail: (booking: Booking) => void;
  onOpenAction: (booking: Booking, type: "confirm" | "reject") => void;
  onCancelBooking: (bookingId: string) => void;
};

function BookingRow({
  booking,
  fallbackHour,
  isActionLoading,
  onOpenDetail,
  onOpenAction,
  onCancelBooking,
}: BookingRowProps) {
  const transformed = transformBookingForUI(booking);
  const bookingDate = new Date(booking.date);
  const time = Number.isNaN(bookingDate.getTime())
    ? fallbackHour
    : bookingDate.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
  const sport = getSportLabel(booking.pitchName);

  return (
    <tr className="bg-[#102a40]/70 transition hover:bg-[#14344d]">
      <td className="whitespace-nowrap px-4 py-3 font-black text-white sm:px-5">{time}</td>
      <td className="whitespace-nowrap px-4 py-3 text-[#d7e8f2] sm:px-5">{transformed.pitchName}</td>
      <td className="whitespace-nowrap px-4 py-3 text-[#9fb3c5] sm:px-5">{sport}</td>
      <td className="whitespace-nowrap px-4 py-3 font-bold text-white sm:px-5">{transformed.userName}</td>
      <td className="whitespace-nowrap px-4 py-3 sm:px-5">
        <StatusBadge status={booking.status} />
      </td>
      <td className="px-4 py-3 sm:px-5">
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => onOpenDetail(booking)}
            className="inline-flex h-7 items-center gap-1.5 rounded-full border border-[#24485f] bg-transparent px-3 text-[11px] font-bold text-[#9fb3c5] transition hover:border-[#67a6d8] hover:text-[#d7e8f2]"
          >
            <Eye className="h-3.5 w-3.5" />
            Ver
          </button>

          <button
            type="button"
            className="inline-flex h-7 items-center gap-1.5 rounded-full border border-[#24485f] bg-transparent px-3 text-[11px] font-bold text-[#9fb3c5] transition hover:border-[#67a6d8] hover:text-[#d7e8f2]"
          >
            <Pencil className="h-3.5 w-3.5" />
            Editar
          </button>
        </div>
      </td>
    </tr>
  );
}

function StatusBadge({ status }: { status: Booking["status"] }) {
  const statusMap = {
    pending: {
      label: "Pendiente",
      className: "border-[#ffd05a] bg-transparent text-[#ffd05a]",
      dotClass: "bg-[#ffd05a]",
    },
    confirmed: {
      label: "Confirmado",
      className: "border-[#4be176] bg-transparent text-[#4be176]",
      dotClass: "bg-[#4be176]",
    },
    rejected: {
      label: "Rechazado",
      className: "border-[#ff6b6b] bg-transparent text-[#ff6b6b]",
      dotClass: "bg-[#ff6b6b]",
    },
    cancelled: {
      label: "Cancelado",
      className: "border-[#7890a3] bg-transparent text-[#9fb3c5]",
      dotClass: "bg-[#7890a3]",
    },
  };

  const item = statusMap[status] ?? {
    label: "Sin estado",
    className: "border-[#7890a3] bg-transparent text-[#9fb3c5]",
    dotClass: "bg-[#7890a3]",
  };

  return (
    <span className={`inline-flex h-6 items-center gap-1.5 rounded-full border px-2.5 text-[11px] font-bold ${item.className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${item.dotClass}`} />
      {item.label}
    </span>
  );
}

function getSportLabel(pitchName: string) {
  const normalized = pitchName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (normalized.includes("padel")) {
    return "Padel";
  }

  if (normalized.includes("7")) {
    return "Futbol 7";
  }

  if (normalized.includes("11")) {
    return "Futbol 11";
  }

  return "Futbol 5";
}
