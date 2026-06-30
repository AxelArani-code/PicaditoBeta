"use server";

import { createClient } from "@/lib/supabase/server";
import type { PitchCard, PitchWithVenueRow } from "@/types/search";
import { toPitchCard, formatCurrency } from "@/lib/actions/search";

// ── Tipos extendidos para la vista de detalle ─────────────────────────────────

export interface PitchDetail extends PitchCard {
  description: string | null;
  hasShowers: boolean;
  hasLedLighting: boolean;
  hasParking: boolean;
  hasLockers: boolean;
  hasWifi: boolean;
  // Venue extra
  venueCity: string;
  venueAddress: string;
  venueWhatsapp: string | null;
  venueLatitude: number | null;
  venueLongitude: number | null;
}

export interface TimeSlot {
  id: string;
  pitchId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "available" | "booked" | "blocked";
  priceFormatted: string;
}

// ── Columnas base garantizadas (iguales a las que usa getPitches) ──────────────

const BASE_PITCH_SELECT = `
  id,
  venue_id,
  name,
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
`;

// ── Columnas opcionales (pueden no existir en el schema actual) ────────────────

const OPTIONAL_PITCH_COLS = [
  "description",
  "has_showers",
  "has_led_lighting",
  "has_parking",
  "has_lockers",
  "has_wifi",
] as const;

const OPTIONAL_VENUE_COLS = ["whatsapp", "latitude", "longitude"] as const;

// ── getPitchDetail ─────────────────────────────────────────────────────────────

/**
 * Obtiene el detalle de una cancha para la vista /inicio/cancha/[id].
 *
 * Estrategia:
 *  1. Primero hace el query base con las columnas garantizadas.
 *  2. Luego intenta enriquecer con columnas opcionales (amenities, coords).
 *     Si ese segundo query falla, simplemente usa defaults vacíos.
 */
export async function getPitchDetail(
  id: string
): Promise<{ data: PitchDetail } | { error: string }> {
  if (!id) return { error: "ID de cancha requerido" };

  try {
    const supabase = await createClient();

    // ── 1. Query base — usa solo columnas confirmadas ──────────────────────
    const { data, error } = await supabase
      .from("pitches")
      .select(BASE_PITCH_SELECT)
      .eq("id", id)
      .eq("is_active", true)
      .single();

    if (error) {
      console.error("[getPitchDetail] base query error:", error.message);
      return { error: error.message };
    }
    if (!data) return { error: "Cancha no encontrada" };

    const row = data as any;
    const base = toPitchCard(row as unknown as PitchWithVenueRow);

    // ── 2. Intentar columnas opcionales de pitch ───────────────────────────
    let extras: Record<string, any> = {};
    try {
      const { data: extData } = await supabase
        .from("pitches")
        .select(OPTIONAL_PITCH_COLS.join(", "))
        .eq("id", id)
        .single();
      if (extData) extras = extData;
    } catch {
      // Columnas opcionales no disponibles — continuamos con defaults
    }

    // ── 3. Intentar columnas opcionales de venue ───────────────────────────
    let venueExtras: Record<string, any> = {};
    try {
      const { data: venueData } = await supabase
        .from("venues")
        .select(OPTIONAL_VENUE_COLS.join(", "))
        .eq("id", row.venue_id)
        .single();
      if (venueData) venueExtras = venueData;
    } catch {
      // Columnas opcionales del venue no disponibles
    }

    const detail: PitchDetail = {
      ...base,
      description:    extras.description      ?? null,
      hasShowers:     extras.has_showers       ?? false,
      hasLedLighting: extras.has_led_lighting  ?? false,
      hasParking:     extras.has_parking       ?? false,
      hasLockers:     extras.has_lockers       ?? false,
      hasWifi:        extras.has_wifi          ?? false,
      venueCity:      row.venue?.city          ?? "",
      venueAddress:   row.venue?.address       ?? "",
      venueWhatsapp:  venueExtras.whatsapp     ?? null,
      venueLatitude:  venueExtras.latitude     ?? null,
      venueLongitude: venueExtras.longitude    ?? null,
    };

    return { data: detail };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error inesperado";
    console.error("[getPitchDetail] unexpected error:", err);
    return { error: message };
  }
}

// ── getAvailableSlots ──────────────────────────────────────────────────────────

/**
 * Obtiene los turnos disponibles de una cancha para los próximos 14 días.
 * Si la tabla `time_slots` no existe o no tiene datos, devuelve array vacío
 * (nunca error — la vista de turnos lo muestra como "sin horarios publicados").
 */
export async function getAvailableSlots(
  pitchId: string,
  fromDate?: string
): Promise<{ data: TimeSlot[] } | { error: string }> {
  if (!pitchId) return { error: "ID de cancha requerido" };

  try {
    const supabase = await createClient();

    const today   = fromDate ?? new Date().toISOString().split("T")[0];
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 14);
    const toDate  = endDate.toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("time_slots")
      .select("id, pitch_id, date, start_time, end_time, status")
      .eq("pitch_id", pitchId)
      .gte("date", today)
      .lte("date", toDate)
      .order("date",       { ascending: true })
      .order("start_time", { ascending: true });

    // Si la tabla no existe o cualquier error, devolver vacío (no 500)
    if (error) {
      console.warn("[getAvailableSlots] error (returning empty):", error.message);
      return { data: [] };
    }

    // Get pitch price for formatting
    let priceFormatted = "";
    try {
      const { data: pitchData } = await supabase
        .from("pitches")
        .select("price_per_hour")
        .eq("id", pitchId)
        .single();
      if (pitchData) priceFormatted = formatCurrency(pitchData.price_per_hour);
    } catch {
      // ignore
    }

    const slots: TimeSlot[] = (data ?? []).map((row: any) => ({
      id:             row.id,
      pitchId:        row.pitch_id,
      date:           row.date,
      startTime:      row.start_time,
      endTime:        row.end_time,
      status:         row.status as TimeSlot["status"],
      priceFormatted,
    }));

    return { data: slots };
  } catch (err) {
    console.warn("[getAvailableSlots] unexpected error (returning empty):", err);
    return { data: [] };
  }
}
