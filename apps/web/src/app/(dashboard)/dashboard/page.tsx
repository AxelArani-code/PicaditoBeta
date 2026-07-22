"use client";

import { useState, useEffect } from "react";
import BookingConfirmationModal from "@/components/modals/BookingConfirmationModal";
import { BookingDetailsModal } from "@/components/dashboard/BookingDetailModal";
import { ScheduleModal } from "@/components/dashboard/ScheduleModal";
import { RecentActivityTimeline } from "@/components/dashboard/RecentActivityTimeline";
import { getAccessToken } from "@/lib/auth/session";
import { useBookings } from "@/hooks/useBookings";
import { BookingsBoard } from "./components/BookingsBoard";
import { DashboardHero } from "./components/DashboardHero";
import { DashboardPanel } from "./components/DashboardPanel";
import { MetricGrid } from "./components/MetricGrid";
import { OccupancyPanel } from "./components/OccupancyPanel";
import { ReviewPanel } from "./components/ReviewPanel";
import { WeekOverviewPanel } from "./components/WeekOverviewPanel";
import type { Booking, BookingsHookReturn, Field } from "./components/types";
import { X, MapPin, ChevronRight, Loader2, AlertCircle, Calendar } from "lucide-react";

const EMPTY_KPIS = {
  totalIncome: 0,
  totalReservations: 0,
  activeReservations: 0,
  occupancyRate: 0,
};

const EMPTY_ANALYTICS = {
  totalReservations: 0,
  totalIncome: 0,
  activeReservations: 0,
  occupancyRate: 0,
  bookingsByState: {},
  bookingsByPayment: {},
  revenueByVenue: {},
  trendByDate: {},
  busiestHours: {},
  mostUsedPitch: "No hay datos",
  topVenue: "No hay datos",
};

// Tipo de pitch para el selector
interface PitchOption {
  id: string;
  name: string;
  type: string | null;
  venueName: string;
  city: string;
}

// ── PitchSelectorModal ────────────────────────────────────────────────────────

interface PitchSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  pitches: PitchOption[];
  isLoading: boolean;
  error: string | null;
  onSelect: (pitch: PitchOption) => void;
}

function PitchSelectorModal({ isOpen, onClose, pitches, isLoading, error, onSelect }: PitchSelectorModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pitch-selector-title"
        className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6"
      >
        <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[#1a2d3d] bg-[#07111d] shadow-2xl shadow-black/60">

          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-[#1a2d3d] px-6 py-5">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-[#4be176]" />
                <span className="text-[10px] font-black uppercase tracking-[0.22em] text-[#4be176]">
                  Horarios
                </span>
              </div>
              <h2 id="pitch-selector-title" className="text-lg font-black text-white">
                Selecciona una cancha
              </h2>
              <p className="mt-0.5 text-xs text-[#5a8099]">
                Elegí la cancha para configurar sus horarios
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-[#5a8099] transition hover:bg-[#0c1823] hover:text-white active:scale-95"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5">
            {isLoading && (
              <div className="flex items-center justify-center gap-3 py-10">
                <Loader2 className="h-5 w-5 animate-spin text-[#4be176]" />
                <span className="text-sm text-[#4a5a4a]">Cargando canchas...</span>
              </div>
            )}

            {!isLoading && error && (
              <div className="flex items-center gap-3 rounded-2xl border border-red-900/40 bg-red-950/30 px-4 py-3">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                <p className="text-xs text-red-300">{error}</p>
              </div>
            )}

            {!isLoading && !error && pitches.length === 0 && (
              <div className="py-10 text-center">
                <p className="text-sm font-bold text-[#3a5a6a]">No tenes canchas creadas</p>
                <p className="mt-1 text-xs text-[#2a4a5a]">Creá una cancha desde Mi Complejo</p>
              </div>
            )}

            {!isLoading && pitches.length > 0 && (
              <div className="space-y-2">
                {pitches.map((pitch) => (
                  <button
                    key={pitch.id}
                    type="button"
                    onClick={() => onSelect(pitch)}
                    className="group flex w-full items-center gap-4 rounded-2xl border border-[#1a2d3d] bg-[#0c1823] px-4 py-3.5 text-left transition-all hover:border-[#4be176]/30 hover:bg-[#0e1f30] active:scale-[0.99]"
                  >
                    {/* Avatar */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#4be176]/10 text-[#4be176]">
                      <span className="text-xs font-black uppercase">
                        {pitch.type === "5v5" ? "F5" : pitch.type === "7v7" ? "F7" : pitch.type === "11v11" ? "F11" : "F"}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-bold text-white">{pitch.name}</p>
                      <div className="mt-0.5 flex items-center gap-1 text-[11px] text-[#5a8099]">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{pitch.venueName} · {pitch.city}</span>
                      </div>
                    </div>

                    <ChevronRight className="h-4 w-4 shrink-0 text-[#3a5a6a] transition group-hover:translate-x-0.5 group-hover:text-[#4be176]" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ── DashboardPage ──────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isPitchSelectorOpen, setIsPitchSelectorOpen] = useState(false);

  const [activePitchId,   setActivePitchId]   = useState<string>("");
  const [activePitchName, setActivePitchName] = useState<string>("Cancha 01");
  const [activePitchType, setActivePitchType] = useState<string>("Futbol 5");

  // Lista completa de pitches para el selector
  const [allPitches,    setAllPitches]    = useState<PitchOption[]>([]);
  const [isPitchLoading, setIsPitchLoading] = useState<boolean>(true);
  const [pitchLoadError, setPitchLoadError] = useState<string | null>(null);

  useEffect(() => {
    setIsPitchLoading(true);
    setPitchLoadError(null);

    const token = getAccessToken();
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    fetch("/api/owner/pitches", { headers })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: {
        venues?: Array<{ id: string; name: string; city: string }>;
        pitches?: Array<{ id: string; name?: string; type?: string; venue_id?: string }>;
        error?: string
      }) => {
        if (data.error) throw new Error(data.error);

        // Construir mapa de venues para lookup
        const venueMap = new Map<string, { name: string; city: string }>();
        for (const v of data.venues ?? []) {
          venueMap.set(v.id, { name: v.name, city: v.city });
        }

        const options: PitchOption[] = (data.pitches ?? []).map((p) => {
          const venue = venueMap.get(p.venue_id ?? "") ?? { name: "", city: "" };
          return {
            id:        p.id,
            name:      p.name ?? "Cancha",
            type:      p.type ?? null,
            venueName: venue.name,
            city:      venue.city,
          };
        });

        setAllPitches(options);

        // Pre-seleccionar la primera
        if (options.length > 0) {
          setActivePitchId(options[0].id);
          setActivePitchName(options[0].name);
          setActivePitchType(options[0].type ?? "Futbol 5");
        } else {
          setPitchLoadError("No tenes canchas creadas en tu complejo.");
        }
      })
      .catch((err: Error) => {
        console.error("[Dashboard] Error cargando pitches:", err.message);
        setPitchLoadError("No se pudo cargar la cancha. Intenta de nuevo.");
      })
      .finally(() => setIsPitchLoading(false));
  }, []);

  // Abrir selector si hay mas de 1 pitch, o directo si hay solo 1
  const handleOpenScheduleModal = () => {
    if (allPitches.length > 1) {
      setIsPitchSelectorOpen(true);
    } else if (allPitches.length === 1) {
      setIsScheduleModalOpen(true);
    }
  };

  // Seleccionar una cancha del picker y abrir el schedule modal
  const handlePitchSelect = (pitch: PitchOption) => {
    setActivePitchId(pitch.id);
    setActivePitchName(pitch.name);
    setActivePitchType(pitch.type ?? "Futbol 5");
    setIsPitchSelectorOpen(false);
    setIsScheduleModalOpen(true);
  };

  const [selectedField] = useState<Field | null>(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [actionType, setActionType] = useState<"confirm" | "reject" | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedBookingForDetail, setSelectedBookingForDetail] = useState<Booking | null>(null);

  const bookingsContext = useBookings();
  const {
    bookings = [],
    totalCount = 0,
    totalPages = 1,
    pageNumber = 1,
    loading = false,
    error,
    statusFilter = "all",
    actionLoading,
    sortBy = "recent",
    autoRefreshEnabled = false,
    selectedVenue = "all",
    venueOptions = [],
    analytics = EMPTY_ANALYTICS,
    getVenueLabel = () => "Todas las sedes",
    kpis = EMPTY_KPIS,
    recentActivity = [],
    handleStatusFilterChange,
    handleVenueChange,
    handlePrevPage,
    handleNextPage,
    handleConfirmBooking,
    handleRejectBooking,
    handleCancelBooking,
    handleSortChange,
    toggleAutoRefresh,
  } = bookingsContext as unknown as BookingsHookReturn;

  const openActionModal = (booking: Booking, type: "confirm" | "reject") => {
    setActiveBooking(booking);
    setActionType(type);
    setModalError(null);
    setIsActionModalOpen(true);
  };

  const closeActionModal = () => {
    if (modalLoading) return;
    setIsActionModalOpen(false);
    setActiveBooking(null);
    setActionType(null);
    setModalError(null);
  };

  const openDetailModal = (booking: Booking) => {
    setSelectedBookingForDetail(booking);
    setIsDetailModalOpen(true);
  };

  const handleModalConfirmAction = async () => {
    if (!activeBooking || !actionType) return;

    setModalLoading(true);
    setModalError(null);

    const success =
      actionType === "confirm"
        ? await handleConfirmBooking(activeBooking.id)
        : await handleRejectBooking(activeBooking.id);

    setModalLoading(false);

    if (success) {
      setSuccessMessage(
        actionType === "confirm"
          ? `Reserva de la cancha ${activeBooking.pitchName} confirmada correctamente.`
          : `Reserva de la cancha ${activeBooking.pitchName} rechazada correctamente.`
      );
      closeActionModal();
      window.setTimeout(() => setSuccessMessage(null), 4500);
      return;
    }

    setModalError("No se pudo completar la accion. Intenta nuevamente.");
  };

  return (
    <div className="min-h-full bg-[#07111d] px-4 py-5 text-[#d7e8f2] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1180px] space-y-5">
        <DashboardHero
          onNewBooking={() => setIsScheduleModalOpen(true)}
          onManageSchedule={handleOpenScheduleModal}
          isPitchLoading={isPitchLoading}
          pitchLoadError={pitchLoadError}
        />

        {error && (
          <div className="rounded-2xl border border-[#ff6b6b]/30 bg-[#ff6b6b]/10 px-4 py-3 text-sm text-[#ffc9c9]">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="rounded-2xl border border-[#4be176]/30 bg-[#4be176]/10 px-4 py-3 text-sm text-[#c8ffd8]">
            {successMessage}
          </div>
        )}

        <MetricGrid />

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-5">
            <BookingsBoard
              bookings={bookings}
              totalCount={totalCount}
              totalPages={totalPages}
              pageNumber={pageNumber}
              loading={loading}
              statusFilter={statusFilter}
              actionLoading={actionLoading}
              sortBy={sortBy}
              autoRefreshEnabled={autoRefreshEnabled}
              selectedVenueLabel={getVenueLabel(selectedVenue)}
              analytics={analytics}
              onStatusFilterChange={handleStatusFilterChange}
              onSortChange={handleSortChange}
              onToggleAutoRefresh={toggleAutoRefresh}
              onPrevPage={handlePrevPage}
              onNextPage={handleNextPage}
              onOpenDetail={openDetailModal}
              onOpenAction={openActionModal}
              onCancelBooking={handleCancelBooking}
            />

            <OccupancyPanel />
          </div>

          <div className="space-y-5">
            <ReviewPanel />
            <WeekOverviewPanel />
          </div>
        </div>
      </div>

      <BookingConfirmationModal
        open={isActionModalOpen}
        title={actionType === "confirm" ? "Confirmar reserva" : "Rechazar reserva"}
        message={
          activeBooking
            ? actionType === "confirm"
              ? `Estas seguro de que deseas confirmar la reserva de la cancha ${activeBooking.pitchName}?`
              : `Estas seguro de que deseas rechazar la reserva de la cancha ${activeBooking.pitchName}?`
            : "Estas seguro de que deseas continuar con esta accion?"
        }
        confirmLabel={actionType === "confirm" ? "Confirmar reserva" : "Rechazar reserva"}
        onClose={closeActionModal}
        onConfirm={handleModalConfirmAction}
        loading={modalLoading}
        error={modalError}
      />

      <BookingDetailsModal
        booking={selectedBookingForDetail}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedBookingForDetail(null);
        }}
        onActionSuccess={(_id, newStatus) => {
          if (selectedBookingForDetail) {
            setSelectedBookingForDetail((prev) =>
              prev ? { ...prev, status: newStatus } : prev
            );
          }
        }}
      />

      {/* Selector de cancha - aparece antes del ScheduleModal */}
      <PitchSelectorModal
        isOpen={isPitchSelectorOpen}
        onClose={() => setIsPitchSelectorOpen(false)}
        pitches={allPitches}
        isLoading={isPitchLoading}
        error={pitchLoadError}
        onSelect={handlePitchSelect}
      />

      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        pitchId={activePitchId}
        pitchName={activePitchName}
        pitchType={activePitchType}
        accessToken={getAccessToken()}
      />
    </div>
  );
}