import { NextRequest, NextResponse } from "next/server";
import { backendUrl } from "@/config/api";

const BACKEND_BASE_URL = backendUrl("Venues");

async function forwardRequest(request: Request | NextRequest, method: string) {
  const url = new URL(request.url);
  const backendUrlObj = new URL(BACKEND_BASE_URL);

  // Forward all query params
  url.searchParams.forEach((value, key) => {
    backendUrlObj.searchParams.append(key, value);
  });

  const authorization = request.headers.get("authorization");
  console.log(`🔵 proxy/venues: ${method} REQUEST RECIBIDO`);
  console.log("🔵 proxy/venues: authorization header presente?", authorization ? "✓ SÍ" : "✗ NO");
  console.log("🔵 proxy/venues: backendUrl:", backendUrlObj.toString());

  const requestHeaders: HeadersInit = {
    Accept: "*/*",
    "Content-Type": "application/json",
    ...(authorization ? { Authorization: authorization } : {}),
  };

  const hasBody = method === "POST" || method === "PUT" || method === "PATCH";

  try {
    const response = await fetch(backendUrlObj.toString(), {
      method,
      headers: requestHeaders,
      body: hasBody ? await request.text() : undefined,
    });

    console.log("🔵 proxy/venues: RESPUESTA DEL BACKEND", {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    });

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
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
    console.error(`❌ proxy/venues: error en fetch (${method}):`, error);
    return new NextResponse(JSON.stringify({ error: "No se pudo conectar al backend" }), {
      status: 502,
      headers: { "content-type": "application/json" },
    });
  }
}

export async function GET(request: Request) {
  return forwardRequest(request, "GET");
}

export async function POST(request: Request) {
  return forwardRequest(request, "POST");
}

