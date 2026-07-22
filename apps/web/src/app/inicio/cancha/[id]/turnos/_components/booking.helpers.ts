// ─────────────────────────────────────────────────────────────────────────────
// booking.helpers.ts
// Section 2 — Helper Functions (dates, formatting, grouping)
// ─────────────────────────────────────────────────────────────────────────────

import type { BookingTimeSlot, DayOption, GroupedSlots, RawTimeSlot } from "./booking.types";

// ── Locale labels ─────────────────────────────────────────────────────────────

const DAY_LABELS_ES = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"] as const;

const MONTH_LABELS_ES = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
] as const;

// ── Date helpers ──────────────────────────────────────────────────────────────

/**
 * Calculates and returns an array of `count` day entries, starting from today
 * (local time). Zero static dates — every value is computed at runtime.
 *
 * @param count  Number of days to generate. Defaults to 7.
 * @returns      Array of `DayOption` objects ready for the date carousel.
 *
 * @example
 * const days = buildNextDays(7);
 * // days[0].isoDate  → "2026-06-14"
 * // days[0].dayLabel → "DOM"
 * // days[0].dateNum  → "14"
 * // days[0].month    → "Jun"
 */
export function buildNextDays(count = 7): DayOption[] {
  const days: DayOption[] = [];

  for (let i = 0; i < count; i++) {
    // Create a fresh Date object for each iteration so there is no shared
    // reference — prevents accidental mutation bugs.
    const d = new Date();
    d.setDate(d.getDate() + i);

    // Build the ISO date using local date parts (not UTC) to avoid timezone
    // skew when the user is in a negative UTC offset (e.g. UTC-3 Buenos Aires).
    const year  = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day   = String(d.getDate()).padStart(2, "0");
    const isoDate = `${year}-${month}-${day}`;

    days.push({
      isoDate,
      dayLabel:  DAY_LABELS_ES[d.getDay()],
      dateNum:   String(d.getDate()),
      month:     MONTH_LABELS_ES[d.getMonth()],
      fullLabel: d.toLocaleDateString("es-AR", {
        weekday: "long",
        day:     "numeric",
        month:   "long",
      }),
    });
  }

  return days;
}

// ── Currency formatting ───────────────────────────────────────────────────────

/**
 * Formats a numeric price in ARS for display.
 * Falls back to a simple "$X" string if the Intl API is unavailable.
 *
 * @example
 * formatPrice(12000) // → "$12.000"
 */
export function formatPrice(amount: number): string {
  try {
    return new Intl.NumberFormat("es-AR", {
      style:    "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `$${amount}`;
  }
}

// ── Slot grouping ─────────────────────────────────────────────────────────────

/**
 * Groups an array of time slots into morning / afternoon / evening buckets
 * based on the starting hour.
 *
 * Boundaries:
 *  - Mañana  → 00:00 – 12:59
 *  - Tarde   → 13:00 – 18:59
 *  - Noche   → 19:00 – 23:59
 */
export function groupSlotsByPeriod(slots: BookingTimeSlot[]): GroupedSlots {
  const groups: GroupedSlots = {
    Mañana: [],
    Tarde:  [],
    Noche:  [],
  };

  for (const slot of slots) {
    const hour = parseInt(slot.startTime.split(":")[0], 10);
    if (hour < 13)       groups.Mañana.push(slot);
    else if (hour < 19)  groups.Tarde.push(slot);
    else                 groups.Noche.push(slot);
  }

  return groups;
}

// ── Slot mapping ─────────────────────────────────────────────────────────────────

/**
 * Maps a raw row from `time_slots` (Supabase snake_case) to the typed
 * `BookingTimeSlot` shape used by the UI.
 *
 * The numeric `price` field is read directly from the DB row; `priceFormatted`
 * is derived from it so the UI never has to recalculate prices.
 *
 * @param row  Raw row returned by the Supabase query on `time_slots`
 */
export function mapRawSlot(row: RawTimeSlot): BookingTimeSlot {
  const price = typeof row.price === "number" ? row.price : Number(row.price ?? 0);
  return {
    id:             String(row.id),
    pitchId:        String(row.pitch_id),
    date:           String(row.date),
    startTime:      String(row.start_time),
    endTime:        String(row.end_time),
    status:         row.status,
    price,
    priceFormatted: formatPrice(price),
  };
}

/**
 * @deprecated Use `mapRawSlot` for Supabase rows instead.
 *
 * Legacy mapper that supports both Supabase snake_case and .NET API camelCase
 * field naming conventions. Kept for backwards-compatibility with the proxy
 * route handler.
 *
 * @param row           Raw row (Supabase or .NET API response)
 * @param priceFormatted Pre-formatted price string derived from the pitch
 */
export function mapSlotRow(
  row: Record<string, unknown>,
  priceFormatted: string
): BookingTimeSlot {
  const priceRaw = row.price ?? row.pricePerHour ?? 0;
  const price    = typeof priceRaw === "number" ? priceRaw : Number(priceRaw);
  return {
    id:             String(row.id),
    pitchId:        String(row.pitchId ?? row.pitch_id),
    date:           String(row.date),
    startTime:      String(row.startTime ?? row.start_time),
    endTime:        String(row.endTime   ?? row.end_time),
    status:         (row.status ?? "available") as BookingTimeSlot["status"],
    price,
    priceFormatted,
  };
}
