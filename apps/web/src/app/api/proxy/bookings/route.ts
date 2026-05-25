import { NextResponse } from "next/server";

const BACKEND_BASE_URL = "http://localhost:5000/api/Bookings";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const backendUrl = new URL(BACKEND_BASE_URL);

  url.searchParams.forEach((value, key) => {
    backendUrl.searchParams.append(key, value);
  });

  const authorization = request.headers.get("authorization");
  console.log("🔵 proxy/bookings: REQUEST RECIBIDO");
  console.log("🔵 proxy/bookings: authorization header presente?", authorization ? "✓ SÍ" : "✗ NO");
  console.log("🔵 proxy/bookings: authorization value:", authorization ? authorization.substring(0, 50) + "..." : "VACÍO");
  console.log("🔵 proxy/bookings: backendUrl:", backendUrl.toString());

  const requestHeaders = {
    Accept: "*/*",
    "Content-Type": "application/json",
    ...(authorization ? { Authorization: authorization } : {}),
  };

  console.log("🔵 proxy/bookings: headers que se enviarán al backend:", {
    Accept: requestHeaders.Accept,
    "Content-Type": requestHeaders["Content-Type"],
    "Authorization": requestHeaders.Authorization ? requestHeaders.Authorization.substring(0, 50) + "..." : "NO INCLUIDO",
  });

  try {
    const response = await fetch(backendUrl.toString(), {
      method: "GET",
      headers: requestHeaders,
    });

    console.log("🔵 proxy/bookings: RESPUESTA DEL BACKEND", {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    });

    const body = await response.text();
    console.log("🔵 proxy/bookings: body length:", body.length, "bytes");
    if (body.length < 500) {
      console.log("🔵 proxy/bookings: body content:", body);
    }

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
    console.error("❌ proxy/bookings: error en fetch:", error);
    return new NextResponse(JSON.stringify({ error: "No se pudo conectar al backend" }), {
      status: 502,
      headers: { "content-type": "application/json" },
    });
  }
}
