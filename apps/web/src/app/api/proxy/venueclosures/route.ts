import { NextResponse } from "next/server";
import { backendUrl } from "@/config/api";

/**
 * API Proxy – /api/proxy/venueclosures
 *
 * Forwards GET and POST requests to the backend:
 *   Frontend → /api/proxy/venueclosures → {BACKEND_API_BASE}/VenueClosures
 *
 * Architecture: Frontend / Mobile → API → Supabase
 * Auth headers are forwarded transparently from the client.
 *
 * ⚠️  If the backend returns 404 on GET (endpoint not yet implemented),
 *     this proxy returns an empty array so the UI shows "Sin cierres activos"
 *     instead of a hard error. Same pattern used in /api/proxy/pitches/[id]/slots.
 */

// ⚠️  Case-sensitive: .NET Web API controller is "VenueClosures" (PascalCase)
const BACKEND_URL = backendUrl("VenueClosures");

async function forwardRequest(request: Request, method: "GET" | "POST") {
  const authorization = request.headers.get("authorization");

  const requestHeaders: HeadersInit = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(authorization ? { Authorization: authorization } : {}),
  };

  console.log(`🔵 proxy/venueclosures: ${method} → ${BACKEND_URL}`);

  try {
    const res = await fetch(BACKEND_URL, {
      method,
      headers: requestHeaders,
      body: method === "POST" ? await request.text() : undefined,
    });

    const body = await res.text();
    const responseHeaders = new Headers();
    const contentType = res.headers.get("content-type");
    if (contentType) responseHeaders.set("content-type", contentType);

    // ── 404 on GET: endpoint not implemented yet → return empty list ──────────
    // Prevents the UI from showing a hard error while the backend feature is pending.
    // Remove this block once VenueClosuresController is deployed.
    if (res.status === 404 && method === "GET") {
      console.warn(
        `⚠️  proxy/venueclosures: backend devolvió 404 en GET.` +
        `\n   El controlador VenueClosures aún no existe en el backend.` +
        `\n   Devolviendo lista vacía para no romper la UI.`,
      );
      return new NextResponse(JSON.stringify([]), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }

    // ── Diagnostic log for other non-OK responses ─────────────────────────────
    if (!res.ok) {
      console.error(
        `❌ proxy/venueclosures: backend devolvió HTTP ${res.status} ${res.statusText}` +
        `\n   URL  : ${BACKEND_URL}` +
        `\n   Body : ${body.slice(0, 300)}`,
      );
    } else {
      console.log(`✅ proxy/venueclosures: ← HTTP ${res.status}`);
    }

    return new NextResponse(body, { status: res.status, headers: responseHeaders });
  } catch (err) {
    console.error(
      `❌ proxy/venueclosures: error de red al llamar ${BACKEND_URL} — ` +
      (err instanceof Error ? err.message : String(err)),
    );
    return new NextResponse(
      JSON.stringify({ error: "No se pudo conectar al backend" }),
      { status: 502, headers: { "content-type": "application/json" } },
    );
  }
}

export async function GET(request: Request) {
  return forwardRequest(request, "GET");
}

export async function POST(request: Request) {
  return forwardRequest(request, "POST");
}
