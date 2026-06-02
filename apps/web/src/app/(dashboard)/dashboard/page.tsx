"use client";

import { useState } from "react";
import {
    Search,
    ShieldCheck,
    PlusCircle,
    Building2,
    UserPlus,
    Pencil,
    ExternalLink,
    Grid3x3,
    MapPin,
    Landmark,
    Users,
    Check,
    X,
    Loader2,
    RefreshCw,
} from "lucide-react";
import { useBookings, transformBookingForUI } from "@/hooks/useBookings";
import { ScheduleManagementDrawer } from "@/components/dashboard/ScheduleManagementDrawer";
import Pagination from "@/components/dashboard/Pagination";
import BookingConfirmationModal from "@/components/modals/BookingConfirmationModal";
import { BookingDetailModal } from "@/components/dashboard/BookingDetailModal";
import { PaymentStatusBadge } from "@/components/dashboard/PaymentStatusBadge";
import { RecentActivityTimeline } from "@/components/dashboard/RecentActivityTimeline";
import EmptyState from "@/components/dashboard/EmptyState";
import { formatPrice } from "@/services/bookings.service";

interface Field {
    name: string;
    type: string;
    status: "DISPONIBLE" | "RESERVADA";
    next: string;
    action: string;
    reserveNow: boolean;
}

interface Booking {
    id: string;
    pitchName: string;
    userName: string;
    status: "pending" | "confirmed" | "rejected" | "cancelled";
    date: string;
    totalPrice: number;
    createdAt: string;
    updatedAt: string;
    paymentStatus: string;
}

interface VenueOption {
    value: string;
    label: string;
}

interface BookingAnalytics {
    totalIncome: number;
    totalReservations: number;
    activeReservations: number;
    occupancyRate: number;
}

interface RecentActivityItem {
    id: string;
    actionText: string;
    actionType: "pending" | "confirmed" | "rejected" | "cancelled";
    userName: string;
    timestamp: Date;
    booking: Record<string, unknown>;
}

interface BookingsHookReturn {
    bookings: Booking[];
    totalCount: number;
    totalPages: number;
    pageNumber: number;
    loading: boolean;
    error: string | null;
    statusFilter: string;
    actionLoading: string | null;
    sortBy: string;
    autoRefreshEnabled: boolean;
    selectedVenue: string;
    venueOptions: VenueOption[];
    analytics: {
        totalReservations: number;
        totalIncome: number;
        activeReservations: number;
        occupancyRate: number;
        bookingsByState: Record<string, number>;
        bookingsByPayment: Record<string, number>;
        revenueByVenue: Record<string, number>;
        trendByDate: Record<string, number>;
        busiestHours: Record<string, number>;
        mostUsedPitch: string;
        topVenue: string;
    };
    getVenueLabel: (value: string) => string;
    kpis: BookingAnalytics;
    recentActivity: RecentActivityItem[];
    handleStatusFilterChange: (newStatus: string) => void;
    handleVenueChange: (newVenue: string) => void;
    handlePrevPage: () => void;
    handleNextPage: () => void;
    handleConfirmBooking: (bookingId: string) => Promise<boolean>;
    handleRejectBooking: (bookingId: string) => Promise<boolean>;
    handleCancelBooking: (bookingId: string) => Promise<void>;
    handleSortChange: (newSortBy: string) => void;
    toggleAutoRefresh: (enabled: boolean) => void;
}

export default function DashboardPage() {
    const [isScheduleDrawerOpen, setIsScheduleDrawerOpen] = useState(false);
    const [selectedField] = useState<Field | null>(null);
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
    const [actionType, setActionType] = useState<"confirm" | "reject" | null>(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [modalError, setModalError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    
    // Nuevos estados para detail modal
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedBookingForDetail, setSelectedBookingForDetail] = useState<Booking | null>(null);

    // Hook para manejar bookings reales con todas las funcionalidades
    const bookingsContext = useBookings();
    const {
        bookings,
        totalCount,
        totalPages,
        pageNumber,
        loading,
        error,
        statusFilter,
        actionLoading,
        sortBy,
        autoRefreshEnabled,
        selectedVenue,
        venueOptions,
        analytics,
        getVenueLabel,
        kpis,
        recentActivity,
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

    const closeDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedBookingForDetail(null);
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

        setModalError("No se pudo completar la acción. Intenta nuevamente.");
    };

    return (
        <div className="animate-fade-in min-h-full bg-[radial-gradient(1200px_500px_at_80%_-10%,rgba(75,225,118,0.18),transparent_65%),radial-gradient(1000px_420px_at_10%_0%,rgba(5,102,217,0.12),transparent_60%),#0e150e] p-4 text-[#dce5d9] sm:p-6">
            <div className="mx-auto max-w-[1440px] space-y-4 sm:space-y-6">
                {/* Admin banner */}
                <div className="rounded-xl border border-[#3d4a3d]/70 bg-[linear-gradient(90deg,rgba(5,102,217,0.2),rgba(33,196,93,0.1))] px-4 py-2">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="h-4 w-4 shrink-0 text-[#adc6ff]" />
                            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#adc6ff]">
                                Modo super administrador activo
                            </span>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                            <div className="relative">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#bccbb9]" />
                                <input
                                    type="text"
                                    placeholder="Buscar dueno o complejo..."
                                    className="h-9 w-full rounded-full border border-[#3d4a3d] bg-[#0e150e]/80 pl-9 pr-3 text-sm text-[#dce5d9] placeholder:text-[#bccbb9]/70 focus:border-[#0566d9] focus:outline-none sm:w-[220px] lg:w-[250px]"
                                />
                            </div>
                            <button className="rounded-full border border-[#0566d9]/60 bg-[#0566d9]/20 px-3 py-1.5 text-xs font-medium text-[#adc6ff] transition hover:bg-[#0566d9]/30">
                                Cambiar a Vista Dueno
                            </button>
                        </div>
                    </div>
                </div>

                {/* Page title + sede selector */}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6bfe8f]">
                            Gestion de propiedad
                        </p>
                        <h1 className="text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl">Dueno: Carlos Rodriguez</h1>
                        <p className="mt-2 max-w-2xl text-sm text-[#bccbb9] sm:text-base">
                            Administracion jerarquica de sedes deportivas y optimizacion de campos de juego.
                        </p>
                    </div>
                    <div className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur-xl lg:w-auto">
                        <div className="flex-1 lg:flex-none">
                            <p className="text-xs text-[#bccbb9]">Sede seleccionada</p>
                            <select
                                value={selectedVenue}
                                onChange={(e) => handleVenueChange(e.target.value)}
                                className="w-full bg-transparent text-lg font-semibold text-[#4be176] focus:outline-none sm:text-xl"
                            >
                                {venueOptions.map((option: VenueOption) => (
                                    <option key={option.value} value={option.value} className="bg-[#1a221a]">
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="h-10 w-px bg-white/20" />
                        <button className="flex flex-col items-center text-[#bccbb9] transition hover:text-[#4be176]">
                            <MapPin className="h-5 w-5" />
                            <span className="text-xs">Nueva sede</span>
                        </button>
                    </div>
                </div>

                {/* Bento grid */}
                <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-12">
                    {/* Complex overview */}
                    <section className="lg:col-span-8">
                        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl sm:p-5">
                            <div className="absolute inset-0 bg-[radial-gradient(700px_240px_at_80%_10%,rgba(75,225,118,0.13),transparent_70%)]" />
                            <div className="relative z-10 flex min-h-[280px] flex-col sm:min-h-[380px]">
                                <div className="mb-auto flex items-start justify-between">
                                    <span className="rounded-full border border-[#4be176]/30 bg-[#4be176]/15 px-3 py-1 text-xs text-[#6bfe8f]">
                                        Complejo activo: {getVenueLabel(selectedVenue)}
                                    </span>
                                    <div className="flex gap-2">
                                        <button className="rounded-lg border border-white/10 bg-white/5 p-2 text-[#bccbb9] transition hover:bg-white/10">
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                        <button className="rounded-lg border border-white/10 bg-white/5 p-2 text-[#bccbb9] transition hover:bg-white/10">
                                            <ExternalLink className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:grid-cols-4">
                                    <article className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                                        <p className="text-xs text-[#bccbb9]">Canchas</p>
                                        <p className="text-xl font-bold text-[#dce5d9] sm:text-2xl">12</p>
                                    </article>
                                    <article className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                                        <p className="text-xs text-[#bccbb9]">Ocupación</p>
                                        <p className="text-xl font-bold text-[#4be176] sm:text-2xl">{kpis.occupancyRate}%</p>
                                    </article>
                                    <article className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                                        <p className="text-xs text-[#bccbb9]">Staff</p>
                                        <p className="text-xl font-bold text-[#dce5d9] sm:text-2xl">08</p>
                                    </article>
                                    <article className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                                        <p className="text-xs text-[#bccbb9]">Ingresos</p>
                                        <p className="text-xl font-bold text-[#dce5d9] sm:text-2xl">{formatPrice(kpis.totalIncome)}</p>
                                    </article>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Right panel */}
                    <section className="space-y-4 sm:space-y-6 lg:col-span-4">
                        <div className="rounded-2xl border border-[#4be176]/30 bg-white/[0.03] p-4 backdrop-blur-xl">
                            <h3 className="mb-3 text-xl font-semibold sm:text-2xl">Acciones Rapidas</h3>
                            <div className="space-y-2">
                                {[
                                    { label: "Crear Nuevo Complejo", icon: PlusCircle },
                                    { label: "Anadir Cancha a Sede Norte", icon: Building2 },
                                    { label: "Asignar Manager", icon: UserPlus },
                                ].map(({ label, icon: Icon }) => (
                                    <button key={label} className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-[#1a221a]/70 p-3 text-left transition hover:border-[#4be176]/50 hover:bg-[#1a221a]">
                                        <Icon className="h-4 w-4 shrink-0 text-[#bccbb9]" />
                                        <span className="text-sm">{label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl">
                            <div className="mb-4 flex items-center justify-between">
                                <h4 className="text-xs font-semibold uppercase tracking-[0.1em] text-[#bccbb9]">Vista jerarquica</h4>
                                <Grid3x3 className="h-4 w-4 text-[#bccbb9]" />
                            </div>
                            <ul className="space-y-3 text-sm">
                                <li className="flex items-center gap-3"><span className="h-2 w-2 shrink-0 rounded-full bg-[#4be176]" />Propiedad (C. Rodriguez)</li>
                                <li className="ml-4 flex items-center gap-3 border-l border-white/10 pl-4"><span className="h-2 w-2 shrink-0 rounded-full bg-[#adc6ff]" />Complejo Sede Norte</li>
                                <li className="ml-8 flex items-center gap-2 border-l border-white/10 pl-4 text-[#bccbb9]">8x Canchas F5</li>
                                <li className="ml-8 flex items-center gap-2 border-l border-white/10 pl-4 text-[#bccbb9]">4x Canchas F11</li>
                            </ul>
                        </div>
                    </section>

                    {/* Field management - BOOKINGS REALES */}
                    <section className="lg:col-span-12">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-lg font-semibold sm:text-xl lg:text-2xl xl:text-3xl">Reservas: {getVenueLabel(selectedVenue)}</h2>
                                <p className="text-xs text-[#bccbb9]">Total: {analytics.totalReservations} reservas · {totalCount} totales</p>
                            </div>
                            <div className="flex shrink-0 flex-wrap items-center gap-2">
                                {/* Sort dropdown */}
                                <select 
                                    value={sortBy}
                                    onChange={(e) => handleSortChange(e.target.value)}
                                    className="rounded-lg border border-white/10 bg-[#1a221a]/70 px-3 py-2 text-sm text-[#dce5d9] focus:outline-none"
                                >
                                    <option value="recent">Más recientes</option>
                                    <option value="oldest">Más antiguas</option>
                                    <option value="highestPrice">Mayor monto</option>
                                    <option value="lowestPrice">Menor monto</option>
                                    <option value="status">Por estado</option>
                                </select>

                                {/* Status filter */}
                                <select 
                                    value={statusFilter}
                                    onChange={(e) => handleStatusFilterChange(e.target.value)}
                                    className="rounded-lg border border-white/10 bg-[#1a221a]/70 px-3 py-2 text-sm text-[#dce5d9] focus:outline-none"
                                >
                                    <option value="all">Todos</option>
                                    <option value="pending">Pendientes</option>
                                    <option value="confirmed">Confirmadas</option>
                                    <option value="rejected">Rechazadas</option>
                                    <option value="cancelled">Canceladas</option>
                                </select>

                                {/* Auto-refresh toggle */}
                                <button
                                    onClick={() => toggleAutoRefresh(!autoRefreshEnabled)}
                                    className={`rounded-lg border p-2 transition ${
                                        autoRefreshEnabled
                                            ? "border-[#4be176]/40 bg-[#4be176]/10 text-[#4be176]"
                                            : "border-white/10 bg-[#1a221a]/70 text-[#bccbb9]"
                                    }`}
                                    title={autoRefreshEnabled ? "Auto-refresh activo" : "Auto-refresh inactivo"}
                                >
                                    <RefreshCw className="h-4 w-4" />
                                </button>

                                <button className="rounded-lg border border-white/10 bg-[#1a221a]/70 p-2 text-[#bccbb9]">
                                    <Grid3x3 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Error state */}
                        {error && (
                            <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
                                {error}
                            </div>
                        )}

                        {/* Success state */}
                        {successMessage && (
                            <div className="mb-4 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                                {successMessage}
                            </div>
                        )}

                        {/* Loading state */}
                        {loading && (
                            <div className="flex min-h-[400px] items-center justify-center">
                                <div className="flex flex-col items-center gap-3">
                                    <Loader2 className="h-8 w-8 animate-spin text-[#6bfe8f]" />
                                    <p className="text-sm text-[#bccbb9]">Cargando reservas...</p>
                                </div>
                            </div>
                        )}

                        {/* Empty state */}
                        {!loading && bookings.length === 0 && (
                            <EmptyState
                                title={
                                    statusFilter === "all"
                                        ? "No hay reservas para mostrar"
                                        : `No hay reservas ${statusFilter}`
                                }
                                description={
                                    statusFilter === "all"
                                        ? "No se encontraron reservas con los filtros actuales. Intenta cambiar el rango de fechas o la sede."
                                        : `No se encontraron reservas con estado ${statusFilter}.`
                                }
                            />
                        )}

                        {/* Bookings Grid */}
                        {!loading && bookings.length > 0 && (
                            <>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                    {bookings.map((bookingItem: Booking) => {
                                        const booking = bookingItem;
                                        const transformed = transformBookingForUI(booking);
                                        const isActionLoading = actionLoading === booking.id;
                                        
                                        return (
                                            <article 
                                                key={booking.id} 
                                                className={`rounded-2xl border p-4 backdrop-blur-xl transition cursor-pointer hover:shadow-lg hover:shadow-[#4be176]/20 ${transformed.statusDisplay.borderColor} bg-white/[0.03]`}
                                                onClick={() => openDetailModal(booking)}
                                            >
                                                <div className="mb-3 flex items-start justify-between">
                                                    <div>
                                                        <h3 className="text-lg font-semibold">{transformed.pitchName}</h3>
                                                        <p className="text-xs text-[#bccbb9]">{transformed.userName}</p>
                                                    </div>
                                                    <PaymentStatusBadge 
                                                        paymentStatus={booking.paymentStatus}
                                                        variant="card"
                                                    />
                                                </div>

                                                <div className={`mb-3 flex h-20 items-center justify-center rounded-xl border sm:h-24 ${transformed.statusDisplay.bgColor} ${transformed.statusDisplay.borderColor}`}>
                                                    {transformed.statusDisplay.icon === "Users" ? (
                                                        <Users className="h-8 w-8 text-[#adc6ff]/40 sm:h-9 sm:w-9" />
                                                    ) : transformed.statusDisplay.icon === "Check" ? (
                                                        <Check className="h-8 w-8 text-[#6bfe8f]/40 sm:h-9 sm:w-9" />
                                                    ) : transformed.statusDisplay.icon === "X" ? (
                                                        <X className="h-8 w-8 text-[#ff6b6b]/40 sm:h-9 sm:w-9" />
                                                    ) : (
                                                        <Landmark className="h-8 w-8 text-[#ffd05a]/40 sm:h-9 sm:w-9" />
                                                    )}
                                                </div>

                                                <div className="mb-3 space-y-2 text-xs text-[#bccbb9]">
                                                    <div className="flex items-center justify-between">
                                                        <span>Fecha:</span>
                                                        <span className="text-[#dce5d9]">{transformed.date}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span>Monto:</span>
                                                        <span className="text-[#6bfe8f]">{transformed.totalPrice}</span>
                                                    </div>
                                                </div>

                                                {/* Acciones según estado */}
                                                <div className="space-y-2">
                                                    {booking.status === "pending" && (
                                                        <>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    openActionModal(booking, "confirm");
                                                                }}
                                                                disabled={isActionLoading}
                                                                className="w-full rounded-lg border border-[#6bfe8f]/40 bg-[#6bfe8f]/10 px-3 py-2 text-xs font-medium text-[#6bfe8f] transition hover:bg-[#6bfe8f]/20 disabled:opacity-50"
                                                            >
                                                                {isActionLoading ? "Procesando..." : "Confirmar"}
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    openActionModal(booking, "reject");
                                                                }}
                                                                disabled={isActionLoading}
                                                                className="w-full rounded-lg border border-[#ff6b6b]/40 bg-[#ff6b6b]/10 px-3 py-2 text-xs font-medium text-[#ff6b6b] transition hover:bg-[#ff6b6b]/20 disabled:opacity-50"
                                                            >
                                                                {isActionLoading ? "Procesando..." : "Rechazar"}
                                                            </button>
                                                        </>
                                                    )}
                                                    {booking.status === "confirmed" && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleCancelBooking(booking.id);
                                                            }}
                                                            disabled={isActionLoading}
                                                            className="w-full rounded-lg border border-white/10 bg-[#1a221a]/50 px-3 py-2 text-xs font-medium text-[#bccbb9] transition hover:bg-[#1a221a] disabled:opacity-50"
                                                        >
                                                            {isActionLoading ? "Procesando..." : "Cancelar"}
                                                        </button>
                                                    )}
                                                    {["rejected", "cancelled"].includes(booking.status) && (
                                                        <button disabled className="w-full rounded-lg border border-white/10 bg-[#1a221a]/50 px-3 py-2 text-xs font-medium text-[#9ab59d] cursor-not-allowed">
                                                            Sin acciones
                                                        </button>
                                                    )}
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>

                                {/* Paginación */}
                                {totalPages > 1 && (
                                    <>
                                        {/* Desktop / tablet */}
                                        <div className="mt-6 hidden sm:block">
                                            <Pagination
                                                pageNumber={pageNumber}
                                                totalPages={totalPages}
                                                onPrev={handlePrevPage}
                                                onNext={handleNextPage}
                                            />
                                        </div>

                                        {/* Mobile compact */}
                                        <div className="mt-6 sm:hidden">
                                            <Pagination
                                                compact
                                                pageNumber={pageNumber}
                                                totalPages={totalPages}
                                                onPrev={handlePrevPage}
                                                onNext={handleNextPage}
                                            />
                                        </div>
                                    </>
                                )}
                            </>
                        )}
                    </section>

                    {/* NUEVA SECCIÓN: Actividad Reciente */}
                    {recentActivity.length > 0 && (
                        <section className="lg:col-span-12">
                            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl sm:p-6">
                                <div className="mb-6">
                                    <h2 className="text-lg font-semibold sm:text-xl lg:text-2xl">Actividad Reciente</h2>
                                    <p className="mt-1 text-xs text-[#bccbb9]">Últimos cambios en reservas</p>
                                </div>
                                <RecentActivityTimeline activities={recentActivity} />
                            </div>
                        </section>
                    )}

                    {/* Insights */}
                    <section className="lg:col-span-12">
                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl sm:p-5">
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                                <div>
                                    <h3 className="text-xl font-semibold sm:text-2xl lg:text-3xl">Insights de Rendimiento</h3>
                                    <p className="mt-2 text-sm text-[#bccbb9]">Comparativa de ingresos y ocupacion entre tus sedes activas.</p>

                                    <div className="mt-6 space-y-3 text-sm">
                                        {[
                                            { label: "Sede Norte", w: "84%", color: "bg-[#4be176]" },
                                            { label: "Sede Centro", w: "62%", color: "bg-[#6bfe8f]" },
                                            { label: "Sede Sur", w: "45%", color: "bg-[#869585]" },
                                        ].map((s) => (
                                            <div key={s.label} className="flex items-center justify-between gap-3">
                                                <span className="shrink-0">{s.label}</span>
                                                <div className="h-2 w-full max-w-[144px] rounded-full bg-[#1a221a]">
                                                    <div className={`h-2 rounded-full ${s.color}`} style={{ width: s.w }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="lg:col-span-2">
                                    <div className="relative h-48 overflow-hidden rounded-xl border border-white/10 bg-[#1a221a]/60 px-4 pb-3 pt-4 sm:h-64 sm:px-6 sm:pb-4 sm:pt-6">
                                        <div className="absolute inset-0 z-0 flex flex-col justify-between p-4 opacity-20">
                                            <div className="border-t border-[#bccbb9]" />
                                            <div className="border-t border-[#bccbb9]" />
                                            <div className="border-t border-[#bccbb9]" />
                                            <div className="border-t border-[#bccbb9]" />
                                        </div>
                                        <div className="relative z-10 flex h-full items-end justify-between gap-1 sm:gap-3">
                                            {[40, 60, 55, 80, 75, 90, 100, 85, 70, 65].map((h, idx) => (
                                                <div key={h + idx} className="w-full rounded-t bg-[#4be176]" style={{ height: `${h}%`, opacity: 0.22 + idx * 0.06 }} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            {/* Modals */}
            <BookingConfirmationModal
                open={isActionModalOpen}
                title={
                    actionType === "confirm"
                        ? "Confirmar reserva"
                        : "Rechazar reserva"
                }
                message={
                    activeBooking
                        ? actionType === "confirm"
                            ? `¿Estás seguro de que deseas confirmar la reserva de la cancha ${activeBooking.pitchName}?`
                            : `¿Estás seguro de que deseas rechazar la reserva de la cancha ${activeBooking.pitchName}?`
                        : "¿Estás seguro de que deseas continuar con esta acción?"
                }
                confirmLabel={
                    actionType === "confirm" ? "Confirmar Reserva" : "Rechazar Reserva"
                }
                onClose={closeActionModal}
                onConfirm={handleModalConfirmAction}
                loading={modalLoading}
                error={modalError}
            />

            <BookingDetailModal
                booking={selectedBookingForDetail}
                isOpen={isDetailModalOpen}
                onClose={closeDetailModal}
            />

            {/* Schedule Management Drawer */}
            <ScheduleManagementDrawer
                isOpen={isScheduleDrawerOpen}
                onClose={() => setIsScheduleDrawerOpen(false)}
                pitchName={selectedField?.name || "Cancha"}
                pitchType={selectedField?.type || "Fútbol"}
            />
        </div>
    );
}
