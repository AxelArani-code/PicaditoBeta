import { NextResponse } from "next/server";

const BACKEND_HEALTH_URL = "http://localhost:5000/health";

export async function GET() {
  try {
    const response = await fetch(BACKEND_HEALTH_URL, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
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
    return new NextResponse(JSON.stringify({ error: "No se pudo conectar al backend" }), {
      status: 502,
      headers: { "content-type": "application/json" },
    });
  }
}
