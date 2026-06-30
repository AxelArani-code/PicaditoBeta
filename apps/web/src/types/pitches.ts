// ── Pitch search types ────────────────────────────────────────────────────
// These types reflect the *pitches* table joined with the *venues* table
// for the court-search listing view. They are intentionally separate from
// the core domain types in index.ts so the search layer can evolve
// independently (e.g. adding computed fields like `available_slots`).

// ── Enums ────────────────────────────────────────────────────────────────
/** Pitch size format. Matches the `size` column in the `pitches` table. */
export type PitchSize = "f5" | "f7" | "f9" | "f11";

/** Turf surface type. Matches the `turf_type` column in the `pitches` table. */
export type TurfType = "natural" | "sintetico" | "cemento";

// ── Base interfaces ───────────────────────────────────────────────────────

/**
 * Represents a row from the `venues` table as returned by a Supabase join.
 * Only the columns selected for the listing view are included here.
 */
export interface VenueSearchResult {
  id: string;
  name: string;
  /** Neighborhood / area within the city (e.g. "Palermo", "Belgrano"). */
  zone: string;
  /** Aggregate rating from 0 to 5. Null when no ratings exist yet. */
  rating: number | null;
}

/**
 * Represents a row from the `pitches` table as returned by a Supabase join.
 * Only the columns selected for the listing view are included here.
 */
export interface PitchSearchResult {
  id: string;
  /** E.g. "f5", "f7", "f9", "f11" */
  size: PitchSize;
  /** Surface type: "natural" | "sintetico" | "cemento" */
  turf_type: TurfType;
  /** Cost per hour in local currency (ARS). */
  price_per_hour: number;
  /** Optional array of amenity strings, e.g. ["Vestuarios", "Iluminación"]. */
  features: string[] | null;
}

// ── Joined / enriched type ────────────────────────────────────────────────

/**
 * A pitch row enriched with its parent venue data, as returned by the
 * `getPitchesWithVenues` query.
 *
 * @example
 * const { data } = await supabase
 *   .from("pitches")
 *   .select("id, size, turf_type, price_per_hour, features, venues(id, name, zone, rating)");
 * // data is PitchWithVenue[]
 */
export type PitchWithVenue = PitchSearchResult & {
  venues: VenueSearchResult;
};

// ── Filter params ─────────────────────────────────────────────────────────

/**
 * Optional filter parameters accepted by `getPitchesWithVenues`.
 * All fields are optional — omit to fetch all pitches without filtering.
 */
export interface PitchFilters {
  size?: PitchSize;
  turf_type?: TurfType;
  /** Filter pitches whose price_per_hour is ≥ this value. */
  minPrice?: number;
  /** Filter pitches whose price_per_hour is ≤ this value. */
  maxPrice?: number;
  /** Free-text search on venue name or zone (case-insensitive). */
  search?: string;
}
