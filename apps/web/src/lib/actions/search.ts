"use server";

/**
 * search.ts — Server Action
 * ─────────────────────────────────────────────────────────────────────────────
 * Server Action de búsqueda y filtrado de canchas (pitches) con su complejo
 * (venue) para la vista /inicio.
 *
 * Arquitectura:
 *   Frontend → Server Action → Supabase
 *   (nunca Frontend → Supabase directamente)
 *
 * El backend filtra automáticamente:
 *   - pitches.is_active = true
 *   - venues.deleted_at IS NULL
 */

import { createClient } from "@/lib/supabase/server";
import type {
  PitchCard,
  PitchFeature,
  PitchRow,
  PitchSearchFilters,
  PitchSearchResult,
  PitchSize,
  PitchWithVenueRow,
  VenueRow,
} from "@/types/search";

// ── Constantes ────────────────────────────────────────────────────────────────

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_PAGE = 1;

/**
 * Columna `type` en Supabase ya almacena los valores del enum de la API.
 * Este mapa convierte el label de UI al valor directo de la DB.
 * Ej: "Fútbol 9" → "NineV9"
 */
const PITCH_SIZE_LABEL_TO_CODE: Record<string, string> = {
  "Fútbol 5":  "FiveV5",
  "Fútbol 7":  "SevenV7",
  "Fútbol 9":  "NineV9",
  "Fútbol 11": "ElevenV11",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Formatea un número como moneda local argentina.
 * Ej: 45000 → "$45.000"
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Convierte los campos booleanos de comodidades de `PitchRow`
 * en un array de strings legibles para la UI.
 */
function mapFeatures(pitch: PitchRow): PitchFeature[] {
  const features: PitchFeature[] = [];
  if (pitch.has_showers)      features.push("Vestuarios");
  if (pitch.has_led_lighting) features.push("Iluminación LED");
  if (pitch.has_parking)      features.push("Parking Gratuito");
  if (pitch.has_lockers)      features.push("Casilleros");
  if (pitch.has_wifi)         features.push("Wifi Gratis");
  return features;
}

/**
 * Convierte una fila cruda de Supabase en el shape `PitchCard` de la UI.
 * La columna `type` ya tiene el valor de la API ("NineV9", etc.) — sin conversión.
 * La columna `surface` ya tiene el valor directo ("cemento", "natural", etc.).
 */
function toPitchCard(row: PitchWithVenueRow): PitchCard {
  return {
    id:             row.id,
    name:           row.name,
    venueId:        row.venue_id,
    venueName:      row.venue.name,
    type:           row.type as PitchCard["type"],
    surface:        (row.surface ?? "sintetico") as PitchCard["surface"],
    pricePerHour:   row.price_per_hour,
    priceFormatted: formatCurrency(row.price_per_hour),
    isActive:       row.is_active,
  };
}

// ── Server Action principal ───────────────────────────────────────────────────

/**
 * `getPitches` — Server Action de búsqueda de canchas.
 *
 * Realiza un JOIN entre `pitches` y `venues` en Supabase, aplicando todos
 * los filtros recibidos desde el formulario de la UI.
 *
 * Filtros automáticos (siempre activos):
 *  - pitches.is_active = true
 *  - venues.deleted_at IS NULL  (via inner join — Supabase filtra nulls en FK joins)
 *
 * @param filters - Parámetros opcionales de filtrado y paginación.
 * @returns `PitchSearchResult` — discriminar por `"error" in result`.
 *
 * @example
 * // En un Server Component:
 * const result = await getPitches({ zone: "Palermo", sizes: ["Fútbol 5"], sortBy: "price_asc" });
 * if ("error" in result) { ... }
 * const { data, total, hasMore } = result;
 */
export async function getPitches(
  filters: PitchSearchFilters = {}
): Promise<PitchSearchResult> {
  const {
    zone,
    turfType,
    surfaces   = [],
    minPrice,
    maxPrice,
    sizes      = [],
    sortBy     = "rating",
    page       = DEFAULT_PAGE,
    pageSize   = DEFAULT_PAGE_SIZE,
  } = filters;

  try {
    const supabase = await createClient();

    // ── Construcción de la query ─────────────────────────────────────────────
    // Columnas reales del schema confirmadas por el JSON de la API:
    // { id, name, venue_id, type, surface, price_per_hour, is_active }
    let query = supabase
      .from("pitches")
      .select(
        `
        id,
        name,
        venue_id,
        type,
        surface,
        price_per_hour,
        is_active,
        venue:venues!inner (
          id,
          name,
          address,
          city
        )
        `,
        { count: "exact" }
      )
      .eq("is_active", true);

    // ── Filtros opcionales del formulario ────────────────────────────────────

    // Búsqueda por nombre de cancha (columna directa en pitches, no join)
    if (zone?.trim()) {
      query = query.ilike("name", `%${zone.trim()}%`);
    }

    // Tipo de superficie desde la barra de búsqueda (valor único, ej: "sintetico")
    if (turfType?.trim()) {
      query = query.ilike("surface", `%${turfType.trim()}%`);
    }

    // Múltiples superficies desde el panel de filtros lateral
    if (surfaces.length > 0) {
      query = query.in("surface", surfaces);
    }

    // Rango de precio
    if (minPrice != null) {
      query = query.gte("price_per_hour", minPrice);
    }
    if (maxPrice != null) {
      query = query.lte("price_per_hour", maxPrice);
    }

    // Tamaños de cancha — columna `type` con valores "FiveV5", "SevenV7", etc.
    if (sizes.length > 0) {
      query = query.in("type", sizes);
    }

    // ── Ordenamiento ─────────────────────────────────────────────────────────
    switch (sortBy) {
      case "price_asc":
        query = query.order("price_per_hour", { ascending: true });
        break;
      case "price_desc":
        query = query.order("price_per_hour", { ascending: false });
        break;
      case "rating":
      default:
        // Si tienes una columna `rating` en venues, ordenar por ella.
        // Por ahora ordenamos por created_at como fallback.
        query = query.order("created_at", { ascending: false });
        break;
    }

    // ── Paginación ───────────────────────────────────────────────────────────
    const from = (page - 1) * pageSize;
    const to   = from + pageSize - 1;
    query = query.range(from, to);

    // ── Ejecución ────────────────────────────────────────────────────────────
    const { data, error, count } = await query;

    if (error) {
      console.error("[getPitches] Supabase error:", {
        message: error.message,
        code:    error.code,
        details: error.details,
        hint:    error.hint,
      });
      return { error: error.message };
    }

    // 🔍 RAW JSON — estructura completa que devuelve Supabase antes de transformar
    console.log(
      "[getPitches] RAW data (" + (count ?? 0) + " total rows, " + (data?.length ?? 0) + " en esta página):",
      JSON.stringify(data, null, 2)
    );

    const total = count ?? 0;

    // ── Adaptación de datos para la UI ───────────────────────────────────────
    const pitchCards = (data as unknown as PitchWithVenueRow[]).map(toPitchCard);

    return {
      data:     pitchCards,
      total,
      page,
      pageSize,
      hasMore:  to < total - 1,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error inesperado en getPitches";
    console.error("[getPitches] Unexpected error:", err);
    return { error: message };
  }
}

// ── Server Actions adicionales ────────────────────────────────────────────────

/**
 * `getPitchById` — Obtiene una cancha individual con su complejo.
 * Usada en la vista /inicio/cancha/[id].
 */
export async function getPitchById(id: string): Promise<{ data: PitchCard } | { error: string }> {
  if (!id) return { error: "ID de cancha requerido" };

  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("pitches")
      .select(
        `
        id, venue_id, name, pitch_type, turf_type, price_per_hour,
        has_showers, has_led_lighting, has_parking, has_lockers, has_wifi,
        is_active, image_url, created_at,
        venue:venues!inner (
          id, name, zone, address, city, cover_image_url, deleted_at
        )
        `
      )
      .eq("id", id)
      .eq("is_active", true)
      .is("venue.deleted_at", null)
      .single();

    if (error) return { error: error.message };

    return { data: toPitchCard(data as unknown as PitchWithVenueRow) };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error inesperado";
    return { error: message };
  }
}

/**
 * `getVenuePitches` — Obtiene todas las canchas activas de un complejo.
 * Usada en la vista detalle del complejo.
 */
export async function getVenuePitches(
  venueId: string
): Promise<{ data: PitchCard[] } | { error: string }> {
  if (!venueId) return { error: "ID de complejo requerido" };

  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("pitches")
      .select(
        `
        id, venue_id, name, pitch_type, turf_type, price_per_hour,
        has_showers, has_led_lighting, has_parking, has_lockers, has_wifi,
        is_active, image_url, created_at,
        venue:venues!inner (
          id, name, zone, address, city, cover_image_url, deleted_at
        )
        `
      )
      .eq("venue_id", venueId)
      .eq("is_active", true)
      .is("venue.deleted_at", null)
      .order("created_at", { ascending: true });

    if (error) return { error: error.message };

    return { data: (data as unknown as PitchWithVenueRow[]).map(toPitchCard) };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error inesperado";
    return { error: message };
  }
}

// ── Exports de utilidades (reutilizables en componentes) ─────────────────────

export { formatCurrency, mapFeatures, toPitchCard };
