"use client";

import { useState } from "react";
import BookingConfirmationModal from "@/components/modals/BookingConfirmationModal";
import { BookingDetailModal } from "@/components/dashboard/BookingDetailModal";
import { ScheduleManagementDrawer } from "@/components/dashboard/ScheduleManagementDrawer";
import { RecentActivityTimeline } from "@/components/dashboard/RecentActivityTimeline";
import { useBookings } from "@/hooks/useBookings";
import { BookingsBoard } from "./components/BookingsBoard";
import { DashboardHero } from "./components/DashboardHero";
import { DashboardPanel } from "./components/DashboardPanel";
import { MetricGrid } from "./components/MetricGrid";
import { OccupancyPanel } from "./components/OccupancyPanel";
import { ReviewPanel } from "./components/ReviewPanel";
import { WeekOverviewPanel } from "./components/WeekOverviewPanel";
import type { Booking, BookingsHookReturn, Field } from "./components/types";

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

export default function DashboardPage() {
  const [isScheduleDrawerOpen, setIsScheduleDrawerOpen] = useState(false);
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
        <DashboardHero todayLabel="Martes, 9 de Junio" />

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

      <BookingDetailModal
        booking={selectedBookingForDetail}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedBookingForDetail(null);
        }}
      />

      <ScheduleManagementDrawer
        isOpen={isScheduleDrawerOpen}
        onClose={() => setIsScheduleDrawerOpen(false)}
        pitchName={selectedField?.name || "Cancha"}
        pitchType={selectedField?.type || "Futbol"}
      />
    </div>
  );
}
