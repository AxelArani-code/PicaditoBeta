import { createClient } from "@/lib/supabase/server";
import type { PitchWithVenue, PitchFilters } from "@/types/pitches";

// ── Supabase select string ────────────────────────────────────────────────
// Selecting only the columns the UI actually needs keeps the payload lean.
const PITCH_SELECT = `
  id,
  size,
  turf_type,
  price_per_hour,
  features,
  venues (
    id,
    name,
    zone,
    rating
  )
` as const;

// ── Query function ────────────────────────────────────────────────────────

/**
 * Fetches the list of pitches joined with their parent venue data.
 *
 * All filter parameters are optional. When none are provided the function
 * returns every pitch ordered by price ascending.
 *
 * @param filters - Optional {@link PitchFilters} to narrow results.
 * @returns A typed array of {@link PitchWithVenue} objects.
 *
 * @throws Will throw an `Error` with a descriptive message when the
 *   Supabase query fails, so the caller (Server Component / Server Action)
 *   can decide how to surface the error to the user.
 */
export async function getPitchesWithVenues(
  filters: PitchFilters = {}
): Promise<PitchWithVenue[]> {
  const supabase = await createClient();

  let query = supabase
    .from("pitches")
    .select(PITCH_SELECT)
    .order("price_per_hour", { ascending: true });

  // ── Equality filters ──────────────────────────────────────────────────
  if (filters.size) {
    query = query.eq("size", filters.size);
  }

  if (filters.turf_type) {
    query = query.eq("turf_type", filters.turf_type);
  }

  // ── Range filters ─────────────────────────────────────────────────────
  if (filters.minPrice != null) {
    query = query.gte("price_per_hour", filters.minPrice);
  }

  if (filters.maxPrice != null) {
    query = query.lte("price_per_hour", filters.maxPrice);
  }

  // ── Full-text search on venue name / zone ─────────────────────────────
  // Supabase doesn't support filtering on joined columns directly in the
  // `.from("pitches")` chain, so we use a `textSearch` workaround via an
  // ilike on the venues side through the PostgREST `or` helper.
  // NOTE: for production, consider a Postgres full-text-search index or a
  // dedicated view that flattens venue name/zone into the pitches rows.
  if (filters.search && filters.search.trim().length > 0) {
    const term = `%${filters.search.trim()}%`;
    // PostgREST allows filtering on embedded resources using dot notation.
    query = query.or(`venues.name.ilike.${term},venues.zone.ilike.${term}`);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(
      `[getPitchesWithVenues] Supabase query failed: ${error.message} (code: ${error.code})`
    );
  }

  // The join guarantees that every pitch has an associated venue row.
  // We cast here because Supabase's generic returns the nested object as
  // the plain table type — our PitchWithVenue type is the correct shape.
  return (data ?? []) as unknown as PitchWithVenue[];
}
