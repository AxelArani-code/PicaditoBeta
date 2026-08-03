import { NextResponse } from "next/server";
import { backendUrl } from "@/config/api";

const BACKEND_BASE_URL = backendUrl("Bookings");

const forwardRequest = async (request, method) => {
  const url = new URL(request.url);
  const backendUrl = new URL(BACKEND_BASE_URL);

  url.searchParams.forEach((value, key) => {
    backendUrl.searchParams.append(key, value);
  });

  const authorization = request.headers.get("authorization");
  console.log("🔵 proxy/bookings: REQUEST RECIBIDO", { method, backendUrl: backendUrl.toString() });

  const requestHeaders = {
    Accept: "*/*",
    "Content-Type": "application/json",
    ...(authorization ? { Authorization: authorization } : {}),
  };

  try {
    const response = await fetch(backendUrl.toString(), {
      method,
      headers: requestHeaders,
      body: method === "POST" || method === "PATCH" ? await request.text() : undefined,
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
    console.error("❌ proxy/bookings: error en fetch:", error);
    return new NextResponse(JSON.stringify({ error: "No se pudo conectar al backend" }), {
      status: 502,
      headers: { "content-type": "application/json" },
    });
  }
};

export async function GET(request: Request) {
  return forwardRequest(request, "GET");
}

export async function POST(request: Request) {
  return forwardRequest(request, "POST");
}
