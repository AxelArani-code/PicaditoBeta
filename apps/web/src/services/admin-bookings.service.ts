/**
 * services/admin-bookings.service.ts
 *
 * Client-side functions for admin booking actions.
 *
 * ✅ Correct architecture:
 *   Component → /api/proxy/bookings/{id}/confirm|cancel (PATCH)
 *             → .NET API at http://localhost:5000/api/Bookings/{id}/confirm
 *             → Supabase
 *
 * Auth: buildAuthHeaders() reads the token from localStorage
 *       ("picadito.auth.session" → access_token) and injects it as
 *       Authorization: Bearer <token> in every request.
 */

import { buildAuthHeaders } from "@/lib/auth/session";

export type AdminActionResult =
  | { ok: true; data: unknown }
  | { ok: false; error: string };

const PROXY_BASE = "/api/proxy/bookings";

/** Sleep helper for retry delay */
const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Single PATCH attempt to the proxy.
 */
async function proxyPatchOnce(
  bookingId: string,
  action: string
): Promise<{ ok: boolean; status: number; data: unknown }> {
  const url = `${PROXY_BASE}/${bookingId}/${action}`;

  const res = await fetch(url, {
    method: "PATCH",
    headers: buildAuthHeaders() as Record<string, string>,
    body: JSON.stringify({}),
  });

  const text = await res.text();
  let data: unknown = null;
  try { data = JSON.parse(text); } catch { data = text; }

  return { ok: res.ok, status: res.status, data };
}

/**
 * Shared PATCH helper with:
 *  - 1 automatic retry after 600 ms on 502
 *    (handles .NET cold-start: backend processes the request but the
 *     proxy times out before reading the response)
 *  - Idempotent 409 handling for "confirm": already-confirmed = success
 *    (the action took effect on the first attempt, even if proxy returned 502)
 */
async function proxyPatch(bookingId: string, action: string): Promise<AdminActionResult> {
  if (!bookingId || bookingId.trim() === "") {
    console.error(`[admin-bookings] ❌ bookingId vacío (action=${action})`);
    return { ok: false, error: "ID de reserva inválido" };
  }

  const label = `${PROXY_BASE}/${bookingId}/${action}`;
  console.log(`[admin-bookings] 🔄 PATCH ${label}`);

  const MAX_ATTEMPTS = 2;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    let result: Awaited<ReturnType<typeof proxyPatchOnce>>;

    try {
      result = await proxyPatchOnce(bookingId, action);
    } catch (networkErr) {
      // fetch() itself threw — pure network/connection failure
      if (attempt < MAX_ATTEMPTS) {
        console.warn(
          `[admin-bookings] ⚠️  Error de red (intento ${attempt}/${MAX_ATTEMPTS}). Reintentando en 600 ms…`,
          networkErr
        );
        await sleep(600);
        continue;
      }
      const msg =
        networkErr instanceof Error
          ? networkErr.message
          : "Error de red — ¿está corriendo el backend?";
      return { ok: false, error: msg };
    }

    const { ok, status, data } = result;
    console.log(`[admin-bookings] 📡 HTTP ${status} ← ${label}`, data);

    // ── 502: proxy couldn't forward the response in time ─────────────────
    // The backend likely processed the request (as evidenced by 409 on retry).
    // Wait 600 ms and try once more.
    if (status === 502 && attempt < MAX_ATTEMPTS) {
      console.warn(
        `[admin-bookings] ⚠️  502 recibido (intento ${attempt}/${MAX_ATTEMPTS}). Reintentando en 600 ms…`
      );
      await sleep(600);
      continue;
    }

    // ── 409 for "confirm": already confirmed — treat as idempotent success ─
    if (status === 409 && action === "confirm") {
      console.log(
        `[admin-bookings] ✅ confirm: reserva ya estaba confirmada (409 → éxito idempotente)`
      );
      return { ok: true, data };
    }

    // ── 2xx success ───────────────────────────────────────────────────────
    if (ok) {
      console.log(`[admin-bookings] ✅ ${action} exitoso`);
      return { ok: true, data };
    }

    // ── Other errors ──────────────────────────────────────────────────────
    const errorData = data as Record<string, unknown> | null;
    const message =
      (typeof errorData?.error   === "string" && errorData.error)   ||
      (typeof errorData?.message === "string" && errorData.message) ||
      (typeof errorData?.title   === "string" && errorData.title)   ||
      `Error ${status}`;

    console.error(`[admin-bookings] ❌ ${action} falló:`, { status, message, body: data });
    return { ok: false, error: message };
  }

  return { ok: false, error: "Error inesperado al procesar la acción" };
}

/**
 * Confirms a pending booking.
 * PATCH /api/proxy/bookings/{id}/confirm → .NET API
 */
export async function confirmBookingAdmin(bookingId: string): Promise<AdminActionResult> {
  return proxyPatch(bookingId, "confirm");
}

/**
 * Cancels a pending or confirmed booking.
 * PATCH /api/proxy/bookings/{id}/cancel → .NET API
 */
export async function cancelBookingAdmin(bookingId: string): Promise<AdminActionResult> {
  return proxyPatch(bookingId, "cancel");
}
