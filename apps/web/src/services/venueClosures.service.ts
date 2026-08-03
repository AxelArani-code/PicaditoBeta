/**
 * services/venueClosures.service.ts
 *
 * Client-side functions for the Venue Closures (Cierres de Cancha) module.
 *
 * ✅ Correct architecture:
 *   Component → /api/proxy/venueclosures (GET | POST)
 *             → Backend API at http://localhost:5000/api/VenueClosures
 *             → Supabase (triggers handle slot deletion automatically)
 *
 * Auth: buildAuthHeaders() reads the token from localStorage
 *       ("picadito.auth.session" → access_token) and injects it as
 *       Authorization: Bearer <token> in every authenticated request.
 */

import { buildAuthHeaders } from "@/lib/auth/session";
import type {
  VenueClosure,
  VenueClosureResult,
  VenueClosuresListResult,
  CreateVenueClosurePayload,
} from "@/types/venueClosures";

const PROXY_BASE = "/api/proxy/venueclosures";

// ── GET /api/venueclosures ────────────────────────────────────────────────────

/**
 * Fetches the full list of active venue closures.
 *
 * ✅ Per backend dev: GET is PUBLIC — no auth token needed.
 *    Response shape: PagedResponse<VenueClosureDto>
 *      { Items: VenueClosureDto[], PageNumber, PageSize, TotalCount, TotalPages }
 */
export async function getVenueClosures(): Promise<VenueClosuresListResult> {
  const url = PROXY_BASE;
  const requestHeaders = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  // ── DIAGNOSTIC ────────────────────────────────────────────────────────────
  console.group("[venueClosures] 🔍 GET — diagnóstico");
  console.log("URL del proxy Next.js :", url);
  console.log("Headers enviados      :", requestHeaders);
  console.log("(Sin token — endpoint público)");
  console.groupEnd();
  // ──────────────────────────────────────────────────────────────────────────

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: requestHeaders,
      cache: "no-store",
    });

    const text = await res.text();

    // ── DIAGNOSTIC ──────────────────────────────────────────────────────────
    console.group(`[venueClosures] 🔍 GET — respuesta HTTP ${res.status}`);
    console.log("Status      :", res.status, res.statusText);
    console.log("Content-Type:", res.headers.get("content-type"));
    console.log("Body (raw)  :", text.slice(0, 500));
    console.groupEnd();
    // ────────────────────────────────────────────────────────────────────────

    let data: unknown = null;
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }

    if (!res.ok) {
      const errorData = data as Record<string, unknown> | null;
      const message =
        (typeof errorData?.error   === "string" && errorData.error)   ||
        (typeof errorData?.message === "string" && errorData.message) ||
        (typeof errorData?.title   === "string" && errorData.title)   ||
        `Error ${res.status} ${res.statusText}`;

      console.error(`[venueClosures] ❌ GET falló — HTTP ${res.status} ${res.statusText}: ${message}`);
      return { ok: false, error: message };
    }

    // Backend returns PagedResponse<VenueClosureDto>:
    //   { Items: [...], PageNumber, PageSize, TotalCount, TotalPages }
    const pagedData = data as Record<string, unknown> | null;
    const closures: VenueClosure[] =
      Array.isArray(pagedData?.Items)
        ? (pagedData.Items as VenueClosure[])
        : Array.isArray(pagedData?.data)
        ? (pagedData.data as VenueClosure[])
        : Array.isArray(data)
        ? (data as VenueClosure[])
        : [];

    console.log(`[venueClosures] ✅ GET exitoso — ${closures.length} cierres`, closures);
    return { ok: true, data: closures };
  } catch (err) {
    const message =
      err instanceof Error
        ? `Error de red: ${err.message}`
        : "Error de red — ¿está corriendo el backend?";
    console.error(`[venueClosures] ❌ Error de red en GET: ${message}`);
    return { ok: false, error: message };
  }
}


// ── POST /api/venueclosures ───────────────────────────────────────────────────

/**
 * Creates a new venue closure (blocks a date for a specific pitch).
 * Requires a valid JWT access token (admin/owner).
 *
 * @param payload - The closure data to create.
 * @param token   - Optional override token. Falls back to localStorage session.
 */
export async function createVenueClosure(
  payload: CreateVenueClosurePayload,
  token?: string | null
): Promise<VenueClosureResult> {
  const headers = buildAuthHeaders() as Record<string, string>;

  // Allow explicit token override (e.g. passed from parent state)
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  console.log("[venueClosures] 🔄 POST", PROXY_BASE, payload);

  // .NET System.Text.Json deserializes PascalCase by default.
  // Send both camelCase and PascalCase keys for maximum compatibility.
  const body = JSON.stringify({
    pitchId:     payload.pitchId,
    closureDate: payload.closureDate,
    startTime:   payload.startTime,
    endTime:     payload.endTime,
    reason:      payload.reason,
    // PascalCase aliases
    PitchId:     payload.pitchId,
    ClosureDate: payload.closureDate,
    StartTime:   payload.startTime,
    EndTime:     payload.endTime,
    Reason:      payload.reason,
  });

  try {
    const res = await fetch(PROXY_BASE, {
      method: "POST",
      headers,
      body,
    });

    const text = await res.text();
    let data: unknown = null;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    if (!res.ok) {
      const errorData = data as Record<string, unknown> | null;
      const message =
        (typeof errorData?.error   === "string" && errorData.error)   ||
        (typeof errorData?.message === "string" && errorData.message) ||
        (typeof errorData?.title   === "string" && errorData.title)   ||
        `Error ${res.status}`;
      // Log the full raw body so it's easy to diagnose backend rejections
      console.error("[venueClosures] ❌ POST falló:", { status: res.status, message, rawBody: text });
      return { ok: false, error: message };
    }

    // Normalise: backend may wrap in { data: {...} } or return the entity directly
    const closure =
      (data as Record<string, unknown>)?.data != null
        ? ((data as Record<string, unknown>).data as VenueClosure)
        : (data as VenueClosure);

    console.log("[venueClosures] ✅ Cierre creado:", closure);
    return { ok: true, data: closure };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error de red — ¿está corriendo el backend?";
    console.error("[venueClosures] ❌ Error de red en POST:", err);
    return { ok: false, error: message };
  }
}
