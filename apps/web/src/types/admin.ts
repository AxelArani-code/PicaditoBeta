// ─────────────────────────────────────────────────────────────────────────────
// src/types/admin.ts
// Tipos centralizados para el panel de administración de Picadito.
// Usados por los Route Handlers (/api/admin/*) y los hooks del dashboard.
// ─────────────────────────────────────────────────────────────────────────────

// ── Booking ───────────────────────────────────────────────────────────────────

export type BookingStatus = "pending" | "confirmed" | "rejected" | "cancelled";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

/** Reserva completa tal como la devuelve /api/admin/bookings */
export interface AdminBooking {
  id: string;
  pitchId: string;
  pitchName: string;
  venueId: string;
  venueName: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string | null;
  /** ISO date — "YYYY-MM-DD" */
  date: string;
  /** 24-h — "HH:MM" */
  startTime: string;
  /** 24-h — "HH:MM" */
  endTime: string;
  totalPrice: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}

/** Shape devuelta por GET /api/admin/bookings */
export interface AdminBookingsPage {
  items: AdminBooking[];
  totalCount: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
}

// ── Venue / Pitch ─────────────────────────────────────────────────────────────

export type PitchType = "FiveV5" | "SevenV7" | "NineV9" | "ElevenV11" | "Padel";
export type SurfaceType = "natural" | "sintetico" | "cemento";

export interface AdminPitch {
  id: string;
  venueId: string;
  name: string;
  type: PitchType;
  surface: SurfaceType | null;
  pricePerHour: number;
  isActive: boolean;
}

export interface AdminVenue {
  id: string;
  ownerId: string;
  name: string;
  address: string;
  city: string;
  phone: string | null;
  email: string | null;
  whatsapp: string | null;
  pitchCount: number;
  pitches: AdminPitch[];
}

// ── Stats / KPIs ──────────────────────────────────────────────────────────────

/** Shape devuelta por GET /api/admin/stats */
export interface DashboardStats {
  /** Reservas con fecha = hoy */
  todayBookings: number;
  /** Reservas confirmadas hoy */
  todayConfirmed: number;
  /** Reservas pendientes hoy */
  todayPending: number;
  /** Reservas canceladas hoy */
  todayCancelled: number;
  /** Ingresos confirmados hoy (sum total_price de status=confirmed, date=today) */
  todayRevenue: number;
  /** Total reservas en estado "pending" (todas las fechas) */
  pendingToConfirm: number;
  /** Total clientes únicos */
  totalClients: number;
}

// ── Calendar ──────────────────────────────────────────────────────────────────

export interface CalendarSlot {
  id: string;
  pitchId: string;
  pitchName: string;
  startTime: string;
  endTime: string;
  status: "available" | "booked" | "blocked";
  price: number;
  /** Booking asociado (si status = booked) */
  booking?: {
    id: string;
    userName: string;
    totalPrice: number;
    bookingStatus: BookingStatus;
  };
}

/** Shape devuelta por GET /api/admin/calendar?date=YYYY-MM-DD */
export interface CalendarDayData {
  date: string;
  slots: CalendarSlot[];
  /** Conteos rápidos para el badge del día en el grid */
  summary: {
    total: number;
    booked: number;
    available: number;
  };
}

// ── Clients ───────────────────────────────────────────────────────────────────

/** Shape devuelta por GET /api/admin/clients */
export interface AdminClient {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  bookingsCount: number;
  lastBookingDate: string | null;
  totalSpent: number;
}

// ── API response wrapper ───────────────────────────────────────────────────────

export interface ApiError {
  error: string;
  code?: string;
}
