import { NextResponse } from "next/server";

const BACKEND_BASE_URL = "http://localhost:5000/api/Venues";

export async function GET(request: Request, { params }) {
  const { id } = params;
  const backendUrl = `${BACKEND_BASE_URL}/${id}`;
  const authorization = request.headers.get("authorization");

  const requestHeaders = {
    Accept: "*/*",
    "Content-Type": "application/json",
    ...(authorization ? { Authorization: authorization } : {}),
  };

  try {
    const response = await fetch(backendUrl, {
      method: "GET",
      headers: requestHeaders,
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
    console.error("❌ proxy/venues/[id]: error en fetch:", error);
    return new NextResponse(JSON.stringify({ error: "No se pudo conectar al backend" }), {
      status: 502,
      headers: { "content-type": "application/json" },
    });
  }
}
