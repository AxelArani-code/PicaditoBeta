// ─────────────────────────────────────────────────────────────────────────────
// booking.types.ts
// Section 1 — Types & Interfaces for the Booking View
// ─────────────────────────────────────────────────────────────────────────────

// ── Pitch prop ────────────────────────────────────────────────────────────────

/**
 * Subset of the court data passed as a prop to the BookingView.
 * Populated from `PitchDetail` (returned by `getPitchDetail`) in the
 * server component and forwarded down — avoids an extra DB round-trip.
 */
export interface BookingPitch {
  id: string;
  /** Human-readable court name — e.g. "Cancha 1 · Fútbol 5" */
  name: string;
  /** Parent venue name — e.g. "La Redonda Sports" */
  venueName: string;
  /** Full address string */
  venueAddress: string;
  /** City — e.g. "Buenos Aires" */
  venueCity: string;
  /** Pitch modality as returned by the API — e.g. "FiveV5" */
  type: string;
  /** Surface string — e.g. "sintetico" */
  surface: string | null;
  /** Numeric hourly price in local currency (ARS) */
  pricePerHour: number;
  /** Pre-formatted price string — e.g. "$12.000" */
  priceFormatted: string;
  /** WhatsApp contact number (optional) */
  venueWhatsapp: string | null;
}

// ── Time slot ─────────────────────────────────────────────────────────────────

/** Slot status values mirroring the `time_slots.status` column */
export type SlotStatus = "available" | "booked" | "blocked";

/**
 * A single bookable time slot returned by the Supabase query.
 * Field names use camelCase (mapped from snake_case DB columns).
 */
export interface BookingTimeSlot {
  id: string;
  pitchId: string;
  /** ISO date string — "YYYY-MM-DD" */
  date: string;
  /** 24-hour time string — "HH:MM" */
  startTime: string;
  /** 24-hour time string — "HH:MM" */
  endTime: string;
  status: SlotStatus;
  /** Pre-formatted price — e.g. "$12.000" */
  priceFormatted: string;
}

// ── Day option ────────────────────────────────────────────────────────────────

/**
 * A single day entry in the date carousel, built by `buildNextDays()`.
 */
export interface DayOption {
  /** ISO date — "YYYY-MM-DD" (used as query key) */
  isoDate: string;
  /** Abbreviated day of the week in Spanish — e.g. "LUN" */
  dayLabel: string;
  /** Day number as string — e.g. "14" */
  dateNum: string;
  /** Abbreviated month in Spanish — e.g. "Jun" */
  month: string;
  /** Full human label — e.g. "sábado 14 de junio" */
  fullLabel: string;
}

// ── Grouped slots ─────────────────────────────────────────────────────────────

/** Available time periods for grouping slots */
export type TimePeriod = "Mañana" | "Tarde" | "Noche";

/** Slots organised by period of day */
export type GroupedSlots = Record<TimePeriod, BookingTimeSlot[]>;

// ── Hook return value ─────────────────────────────────────────────────────────

/**
 * Shape returned by `useAvailableSlots` custom hook.
 */
export interface UseAvailableSlotsReturn {
  slots: BookingTimeSlot[];
  isLoading: boolean;
  error: string | null;
}
