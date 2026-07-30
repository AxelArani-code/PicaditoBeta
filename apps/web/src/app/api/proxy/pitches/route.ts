import { NextResponse } from "next/server";
import { backendUrl } from "@/config/api";

const BACKEND_BASE_URL = backendUrl("Pitches");

export async function GET(request: Request) {
  const url = new URL(request.url);
  const backendUrl = new URL(BACKEND_BASE_URL);

  url.searchParams.forEach((value, key) => {
    backendUrl.searchParams.append(key, value);
  });

  const authorization = request.headers.get("authorization");
  console.log("🔵 proxy/pitches: REQUEST RECIBIDO");
  console.log("🔵 proxy/pitches: authorization header presente?", authorization ? "✓ SÍ" : "✗ NO");
  console.log("🔵 proxy/pitches: backendUrl:", backendUrl.toString());

  const requestHeaders = {
    Accept: "*/*",
    "Content-Type": "application/json",
    ...(authorization ? { Authorization: authorization } : {}),
  };

  try {
    const response = await fetch(backendUrl.toString(), {
      method: "GET",
      headers: requestHeaders,
    });

    console.log("🔵 proxy/pitches: RESPUESTA DEL BACKEND", {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    });

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
    console.error("❌ proxy/pitches: error en fetch:", error);
    return new NextResponse(JSON.stringify({ error: "No se pudo conectar al backend" }), {
      status: 502,
      headers: { "content-type": "application/json" },
    });
  }
}
