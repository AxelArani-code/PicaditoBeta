// app/api/availability-rules/route.ts
//
// Proxy hacia el backend .NET en {NEXT_PUBLIC_API_URL}/api/availabilityrules
//
// GET  /api/availability-rules?pitchId={uuid}  → GET  /api/availabilityrules?pitchId={uuid}
// POST /api/availability-rules                 → POST /api/availabilityrules
//
// Auth: lee el token del header Authorization o de la cookie picadito_access_token
// y lo reenvía como Bearer al backend .NET.

import { NextRequest, NextResponse } from "next/server";
import { backendUrl } from "@/config/api";

const BACKEND_BASE = backendUrl("availabilityrules");

/** Extrae el Bearer token del header o del cookie picadito_access_token */
async function resolveToken(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    console.log("[availability-rules] token from Authorization header");
    return authHeader.slice(7);
  }

  // Fallback: cookie httpOnly persistida en el login
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get("picadito_access_token")?.value ?? null;
  if (cookieToken) {
    console.log("[availability-rules] token from picadito_access_token cookie");
  } else {
    console.warn("[availability-rules] NO token found");
  }
  return cookieToken;
}

// ── GET /api/availability-rules?pitchId={uuid} ──────────────────────────────
// Proxea al backend: GET {NEXT_PUBLIC_API_URL}/api/availabilityrules?pitchId={uuid}

export async function GET(req: NextRequest) {
  console.log("=== [GET /api/availability-rules] ===");

  const { searchParams } = new URL(req.url);
  const pitchId = searchParams.get("pitchId");

  if (!pitchId) {
    return NextResponse.json({ error: "pitchId es requerido" }, { status: 400 });
  }

  const token = await resolveToken(req);

  if (!token) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const backendUrl = `${BACKEND_BASE}?pitchId=${encodeURIComponent(pitchId)}`;
  console.log("[GET /api/availability-rules] → backend:", backendUrl);

  try {
    const res = await fetch(backendUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const text = await res.text();
    console.log(`[GET /api/availability-rules] backend status: ${res.status}`);
    if (!res.ok) {
      console.error("[GET /api/availability-rules] backend error:", text);
    }

    return new NextResponse(text, {
      status: res.status,
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    console.error("[GET /api/availability-rules] fetch error:", err);
    return NextResponse.json(
      { error: "No se pudo conectar al servidor de horarios" },
      { status: 502 }
    );
  }
}

// ── POST /api/availability-rules ─────────────────────────────────────────────
// Proxea al backend: POST {NEXT_PUBLIC_API_URL}/api/availabilityrules
//
// Body esperado (igual al que acepta el backend .NET):
// {
//   "pitchId":       "uuid",
//   "dayOfWeek":     "Friday",    ← string EN capitalizado
//   "startTime":     "20:00",
//   "endTime":       "21:00",
//   "priceOverride": 30000.00
// }

export async function POST(req: NextRequest) {
  console.log("=== [POST /api/availability-rules] ===");

  const token = await resolveToken(req);

  if (!token) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  let bodyText: string;
  try {
    bodyText = await req.text();
    const parsed = JSON.parse(bodyText);
    console.log("[POST /api/availability-rules] payload:", JSON.stringify(parsed));
  } catch {
    return NextResponse.json({ error: "Body JSON invalido" }, { status: 400 });
  }

  console.log("[POST /api/availability-rules] → backend:", BACKEND_BASE);

  try {
    const res = await fetch(BACKEND_BASE, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: bodyText,
      cache: "no-store",
    });

    const text = await res.text();
    console.log(`[POST /api/availability-rules] backend status: ${res.status}`);
    if (!res.ok) {
      console.error("[POST /api/availability-rules] backend error:", text);
    }

    return new NextResponse(text, {
      status: res.status,
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    console.error("[POST /api/availability-rules] fetch error:", err);
    return NextResponse.json(
      { error: "No se pudo conectar al servidor de horarios" },
      { status: 502 }
    );
  }
}
