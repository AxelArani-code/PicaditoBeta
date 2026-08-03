import { NextRequest, NextResponse } from "next/server";
import { backendUrl } from "@/config/api";

/**
 * API Proxy – /api/proxy/venueclosures
 *
 * Frontend → /api/proxy/venueclosures → {BACKEND_API_BASE}/VenueClosures
 *
 * Per backend dev:
 *   GET    → público (sin auth)
 *   POST   → requiere Authorization: Bearer <token>
 *   PUT    → requiere Authorization: Bearer <token>  (?id=uuid)
 *   DELETE → requiere Authorization: Bearer <token>  (?id=uuid)
 *
 * Response (GET): PagedResponse<VenueClosureDto>
 *   { Items: [...], PageNumber, PageSize, TotalCount, TotalPages }
 */

// ⚠️  .NET routing: [Route("api/[controller]")] → "api/VenueClosures"
//     ASP.NET Core routing is case-insensitive, but we match backend dev spec exactly.
const BACKEND_URL = backendUrl("VenueClosures");

async function forwardRequest(request: Request | NextRequest, method: "GET" | "POST" | "PUT" | "DELETE", id?: string) {
  const authorization = request.headers.get("authorization");

  const requestHeaders: HeadersInit = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(authorization ? { Authorization: authorization } : {}),
  };

  // Build target URL — append /{id} if present
  const targetUrl = id ? `${BACKEND_URL}/${encodeURIComponent(id)}` : BACKEND_URL;

  // ── DIAGNOSTIC SERVER LOG ─────────────────────────────────────────────────
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`🔵 proxy/venueclosures: ${method} request`);
  console.log(`   → Backend URL : ${targetUrl}`);
  console.log(`   → Auth header : ${authorization ? "Bearer ***" : "ninguno (GET público)"}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  // ─────────────────────────────────────────────────────────────────────────

  try {
    const hasBody = method === "POST" || method === "PUT";
    const res = await fetch(targetUrl, {
      method,
      headers: requestHeaders,
      body: hasBody ? await request.text() : undefined,
    });

    // 204 No Content — no body
    if (res.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const body = await res.text();
    const responseHeaders = new Headers();
    const contentType = res.headers.get("content-type");
    if (contentType) responseHeaders.set("content-type", contentType);

    // ── DIAGNOSTIC SERVER LOG ───────────────────────────────────────────────
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`${res.ok ? "✅" : "❌"} proxy/venueclosures: ← HTTP ${res.status} ${res.statusText}`);
    console.log(`   Content-Type : ${contentType ?? "(none)"}`);
    console.log(`   Body (500ch) : ${body.slice(0, 500)}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    // ─────────────────────────────────────────────────────────────────────────

    return new NextResponse(body, { status: res.status, headers: responseHeaders });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error(`❌ proxy/venueclosures: error de red → ${targetUrl}`);
    console.error(`   Error: ${errMsg}`);
    return new NextResponse(
      JSON.stringify({ error: "No se pudo conectar al backend", detail: errMsg }),
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

export async function PUT(request: NextRequest) {
  const id = new URL(request.url).searchParams.get("id") ?? undefined;
  return forwardRequest(request, "PUT", id);
}

export async function DELETE(request: NextRequest) {
  const id = new URL(request.url).searchParams.get("id") ?? undefined;
  return forwardRequest(request, "DELETE", id);
}

