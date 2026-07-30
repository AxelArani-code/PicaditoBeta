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
 * This is a public endpoint — no auth token required.
 */
export async function getVenueClosures(): Promise<VenueClosuresListResult> {
  try {
    const res = await fetch(PROXY_BASE, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      cache: "no-store",
    });

    // Read body as text first — a non-JSON body (HTML 502, etc.) won't crash here
    const text = await res.text();

    let data: unknown = null;
    try {
      data = JSON.parse(text);
    } catch {
      // Body is not valid JSON (e.g. HTML error page from proxy/gateway)
      data = null;
    }

    if (!res.ok) {
      const errorData = data as Record<string, unknown> | null;
      const message =
        (typeof errorData?.error   === "string" && errorData.error)   ||
        (typeof errorData?.message === "string" && errorData.message) ||
        `Error ${res.status} ${res.statusText}`;

      // Serialize as a string so browsers don't collapse the log to "{}"
      console.error(
        `[venueClosures] ❌ GET falló — HTTP ${res.status} ${res.statusText}: ${message}`,
      );
      return { ok: false, error: message };
    }

    // The backend may return { data: VenueClosure[] } or VenueClosure[] directly
    const closures = Array.isArray(data)
      ? (data as VenueClosure[])
      : Array.isArray((data as Record<string, unknown>)?.data)
      ? ((data as Record<string, unknown>).data as VenueClosure[])
      : [];

    console.log(`[venueClosures] ✅ GET exitoso — ${closures.length} cierres`);
    return { ok: true, data: closures };
  } catch (err) {
    // Network-level failure (backend unreachable, CORS, etc.)
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
