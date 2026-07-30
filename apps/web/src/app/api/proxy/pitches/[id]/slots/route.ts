import { NextResponse } from "next/server";
import { backendUrl } from "@/config/api";

/**
 * proxy/pitches/[id]/slots/route.ts
 *
 * GET /api/proxy/pitches/{pitchId}/slots?date=YYYY-MM-DD
 *
 * Reenvía la petición al endpoint del backend .NET:
 *   GET {BACKEND_API_BASE}/Pitches/{pitchId}/slots?date=YYYY-MM-DD
 *
 * Si el backend no tiene este endpoint todavía, responde con array vacío
 * para que la UI muestre el estado "sin turnos" en lugar de un error.
 */

const BACKEND_BASE_URL = backendUrl("Pitches");

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const url = new URL(request.url);

  const backendUrl = new URL(`${BACKEND_BASE_URL}/${encodeURIComponent(id)}/slots`);
  url.searchParams.forEach((value, key) => {
    backendUrl.searchParams.append(key, value);
  });

  const authorization = request.headers.get("authorization");

  console.log("🔵 proxy/pitches/[id]/slots: REQUEST RECIBIDO", {
    id,
    backendUrl: backendUrl.toString(),
    date: url.searchParams.get("date"),
  });

  const requestHeaders: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(authorization ? { Authorization: authorization } : {}),
  };

  try {
    const response = await fetch(backendUrl.toString(), {
      method: "GET",
      headers: requestHeaders,
    });

    console.log("🔵 proxy/pitches/[id]/slots: RESPUESTA DEL BACKEND", {
      status: response.status,
      ok: response.ok,
    });

    // Si el backend aún no tiene el endpoint de slots, retornar array vacío
    if (response.status === 404 || response.status === 405) {
      console.warn(
        "⚠️ proxy/pitches/[id]/slots: endpoint no implementado en el backend — retornando []"
      );
      return NextResponse.json([]);
    }

    const body = await response.text();
    const responseHeaders = new Headers();
    const contentType = response.headers.get("content-type");
    if (contentType) {
      responseHeaders.set("content-type", contentType);
    }

    return new NextResponse(body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("❌ proxy/pitches/[id]/slots: error en fetch:", error);
    // No crashear la UI — retornar vacío
    return NextResponse.json([]);
  }
}
