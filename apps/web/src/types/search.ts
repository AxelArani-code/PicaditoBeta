/**
 * search.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Tipos estrictos para la vista de búsqueda y listado de complejos deportivos.
 * Están pensados para la UI de /inicio y sus sub-rutas (cancha, turnos, confirmacion).
 *
 * Convención de nombres:
 *  - *Row      → forma cruda tal como llega de Supabase (snake_case)
 *  - *Card     → forma adaptada lista para renderizar en el componente de tarjeta (camelCase)
 *  - *Filters  → parámetros de búsqueda/filtrado del Server Action
 */

// ── Enums de UI ──────────────────────────────────────────────────────────────

/** Tamaños de cancha mostrados en la UI */
export type PitchSize = "Fútbol 5" | "Fútbol 7" | "Fútbol 9" | "Fútbol 11";

/** Tipo de césped mostrado en la UI */
export type TurfType = "Sintética" | "Natural" | "Sintética Pro" | "Fútbol Sala";

/** Badge de disponibilidad para la tarjeta */
export type AvailabilityBadge = "DISPONIBLE HOY" | "ÚLTIMOS CUPOS" | "DISPONIBLE" | "RESERVADO";

/** Opciones de ordenamiento */
export type SortBy = "rating" | "price_asc" | "price_desc" | "distance";

// ── Row types (raw de Supabase) ───────────────────────────────────────────────

/**
 * Fila cruda de la tabla `venues`.
 * Mapea 1:1 con el schema de Supabase.
 */
export interface VenueRow {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string | null;
  city: string;
  address: string;
  zone: string | null;          // Ej: "Zona Norte, Sector Empresarial"
  latitude: number | null;
  longitude: number | null;
  cover_image_url: string | null;
  whatsapp: string | null;
  deleted_at: string | null;    // Soft-delete — filtrado automáticamente por el backend
  created_at: string;
}

/**
 * Fila cruda de la tabla `pitches`.
 * Mapea 1:1 con el schema de Supabase.
 */
export interface PitchRow {
  id: string;
  venue_id: string;
  name: string;
  /** Tipo de cancha — valores reales del DB: "FiveV5" | "SevenV7" | "NineV9" | "ElevenV11" */
  type: string;
  /** Superficie — valores reales del DB: "natural" | "sintetico" | "cemento" */
  surface: string | null;
  price_per_hour: number;
  is_active: boolean;
}

/**
 * Resultado del JOIN venues + pitches que devuelve Supabase.
 * Equivale a la vista `pitches` con su venue embebido.
 */
export interface PitchWithVenueRow extends PitchRow {
  /** Solo los campos que realmente existen en la tabla venues y son seleccionados en la query */
  venue: Pick<VenueRow, "id" | "name" | "address" | "city">;
  /** Rating promedio computado (puede venir de una vista o de un avg en la query) */
  rating?: number | null;
  /** Cantidad de reseñas */
  review_count?: number | null;
}

// ── Card types (listos para la UI) ───────────────────────────────────────────

/**
 * Comodidades de la cancha como array de strings legibles.
 * Generado por `mapFeatures()` a partir de los booleanos de `PitchRow`.
 */
export type PitchFeature =
  | "Vestuarios"
  | "Iluminación LED"
  | "Parking Gratuito"
  | "Casilleros"
  | "Wifi Gratis";

/**
 * Tipo de cancha tal como lo devuelve la API (.NET backend).
 * Convención PascalCase para alinearse con el enum del servidor.
 */
export type PitchApiType = "FiveV5" | "SevenV7" | "NineV9" | "ElevenV11";

/**
 * Superficie de la cancha tal como la devuelve la API.
 */
export type PitchApiSurface = "natural" | "sintetico" | "cemento";

/**
 * Shape final que consume el componente `<PitchCardItem />`.
 * Refleja exactamente la respuesta de la API (camelCase del backend .NET).
 *
 * @example JSON real:
 * { id, name, venueId, venueName, type: "NineV9", surface: "cemento", pricePerHour: 90, isActive: true }
 */
export interface PitchCard {
  /** UUID de la cancha */
  id: string;
  /** Nombre descriptivo de la cancha — ej: "Predio El Potrero - Fútbol 9 - Pasto Natural" */
  name: string;
  /** UUID del complejo al que pertenece */
  venueId: string;
  /** Nombre del complejo — ej: "La Redonda Sports" */
  venueName: string;
  /** Formato de cancha del backend — ej: "NineV9" */
  type: PitchApiType;
  /** Superficie — "natural" | "sintetico" | "cemento" */
  surface: PitchApiSurface | string;
  /** Precio por hora en la moneda local */
  pricePerHour: number;
  /** Precio formateado para mostrar en UI — ej: "$90" */
  priceFormatted: string;
  /** Si la cancha está activa y disponible para reservar */
  isActive: boolean;
}

// ── Filter / Input types ──────────────────────────────────────────────────────

/**
 * Parámetros de filtrado que acepta el Server Action `getPitches`.
 * Todos son opcionales — sin filtros devuelve todos los resultados paginados.
 */
export interface PitchSearchFilters {
  /** Búsqueda por zona o nombre del complejo */
  zone?: string;
  /** Tipo de superficie desde la barra de búsqueda (valor único, ej: "sintetico") */
  turfType?: string;
  /** Múltiples superficies desde el panel de filtros */
  surfaces?: string[];
  /** Precio mínimo por hora */
  minPrice?: number;
  /** Precio máximo por hora */
  maxPrice?: number;
  /** Tamaños de cancha — valores del enum de la API: "FiveV5", "SevenV7", etc. */
  sizes?: string[];
  /** Criterio de ordenamiento */
  sortBy?: SortBy;
  /** Página actual (base 1) */
  page?: number;
  /** Resultados por página */
  pageSize?: number;
}

// ── Response types ────────────────────────────────────────────────────────────

/** Respuesta exitosa del Server Action */
export interface PitchSearchSuccess {
  data: PitchCard[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/** Respuesta de error del Server Action */
export interface PitchSearchError {
  error: string;
}

/** Tipo unión de respuesta — discriminar por `"error" in result` */
export type PitchSearchResult = PitchSearchSuccess | PitchSearchError;
