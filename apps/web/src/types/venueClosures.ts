// ── Venue Closures – TypeScript interfaces ────────────────────────────────────
// These types reflect the `venue_closures` table as returned by the backend API
// at http://localhost:5000/api/venueclosures

// ── Entity ────────────────────────────────────────────────────────────────────

/** A single closure record as returned by GET /api/venueclosures */
export interface VenueClosure {
  /** UUID of the closure record */
  id: string;
  /** UUID of the affected pitch */
  pitchId: string;
  /** Human-readable name of the pitch (may be absent if backend doesn't join) */
  pitchName?: string;
  /** ISO date string: "YYYY-MM-DD" */
  closureDate: string;
  /** HH:mm time string or null for all-day */
  startTime: string | null;
  /** HH:mm time string or null for all-day */
  endTime: string | null;
  /** Reason description, e.g. "Mantenimiento" or "Feriado" */
  reason: string;
  /** ISO timestamp of when the closure was created */
  createdAt?: string;
}

// ── Request payload ───────────────────────────────────────────────────────────

/** Payload for POST /api/venueclosures */
export interface CreateVenueClosurePayload {
  pitchId: string;
  /** ISO date: "YYYY-MM-DD" */
  closureDate: string;
  /** null → all-day closure */
  startTime: null;
  /** null → all-day closure */
  endTime: null;
  reason: string;
}

// ── API result wrapper ────────────────────────────────────────────────────────

export type VenueClosureResult =
  | { ok: true; data: VenueClosure }
  | { ok: false; error: string };

export type VenueClosuresListResult =
  | { ok: true; data: VenueClosure[] }
  | { ok: false; error: string };

// ── Pitch option for the selector ─────────────────────────────────────────────

/** Lightweight pitch option used in the creation form selector */
export interface PitchOption {
  id: string;
  name: string;
  type: string | null;
  venueName: string;
  city: string;
}
