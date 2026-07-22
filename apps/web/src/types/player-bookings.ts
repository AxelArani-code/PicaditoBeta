// ─────────────────────────────────────────────────────────────────────────────
// types/player-bookings.ts
// Types for the Player "Mis Reservas" view.
// Derived from the real DB schema: bookings → time_slots → pitches → venues
// ─────────────────────────────────────────────────────────────────────────────

// ── DB enum values (as stored in Supabase) ────────────────────────────────────
export type PlayerBookingStatus =
  | "pending"
  | "confirmed"
  | "rejected"
  | "cancelled";

export type PitchType = "5v5" | "7v7" | "9v9" | "11v11";
export type PitchSurface =
  | "cesped_natural"
  | "sintetico"
  | "cemento"
  | "parquet";

// ── Nested pitch info (joined from `pitches`) ─────────────────────────────────
export interface PlayerBookingPitch {
  id: string;
  name: string;
  type: PitchType;
  surface: PitchSurface;
}

// ── Nested venue info (joined from `venues`) ──────────────────────────────────
export interface PlayerBookingVenue {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string | null;
  /** notes derived from venues.description */
  notes: string | null;
  /** first element of venues.images[] used as pitch image */
  imageUrl: string | null;
}

// ── Full booking card data (returned by GET /api/player/bookings) ─────────────
export interface PlayerBooking {
  /** UUID from bookings.id */
  id: string;
  /** Human-readable code derived from id: "#PK-XXXXX" */
  code: string;
  status: PlayerBookingStatus;
  /** YYYY-MM-DD */
  date: string;
  /** HH:MM (from time_slots.start_time) */
  startTime: string;
  /** HH:MM (from time_slots.end_time) */
  endTime: string;
  /** Computed duration in minutes */
  durationMinutes: number;
  /** Monetary total from bookings.total_price */
  totalAmount: number;
  /** bookings.created_at ISO string */
  createdAt: string;
  pitch: PlayerBookingPitch;
  venue: PlayerBookingVenue;
}

// ── Aggregated stats for the StatsCards header ────────────────────────────────
export interface PlayerBookingStats {
  total: number;
  confirmed: number;
  pending: number;
  cancelled: number;
}

// ── API response shape from GET /api/player/bookings ─────────────────────────
export interface PlayerBookingsPage {
  items: PlayerBooking[];
  stats: PlayerBookingStats;
  totalCount: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
}

// ── Filter params sent to GET /api/player/bookings ────────────────────────────
export interface PlayerBookingsFilters {
  search?: string;
  status?: PlayerBookingStatus | "";
  date?: string;
  venueId?: string;
  pageNumber: number;
  pageSize: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Display labels for surface types */
export const SURFACE_LABELS: Record<PitchSurface, string> = {
  cesped_natural: "Césped Natural",
  sintetico: "Sintética",
  cemento: "Cemento",
  parquet: "Parquet",
};

/** Display labels for pitch format */
export const FORMAT_LABELS: Record<PitchType, string> = {
  "5v5": "5 VS 5",
  "7v7": "7 VS 7",
  "9v9": "9 VS 9",
  "11v11": "11 VS 11",
};

/** Derive a short booking code from UUID */
export function deriveBookingCode(id: string): string {
  return `#PK-${id.replace(/-/g, "").slice(0, 5).toUpperCase()}`;
}

/** Compute duration in minutes from HH:MM strings */
export function computeDuration(startTime: string, endTime: string): number {
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  return (eh * 60 + em) - (sh * 60 + sm);
}
