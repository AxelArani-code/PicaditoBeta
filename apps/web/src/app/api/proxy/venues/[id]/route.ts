import { NextRequest, NextResponse } from "next/server";
import { backendUrl } from "@/config/api";

const BACKEND_BASE_URL = backendUrl("Venues");

interface RouteParams {
  params: Promise<{ id: string }>;
}

async function proxyRequest(request: Request | NextRequest, id: string, method: string) {
  const targetUrl = `${BACKEND_BASE_URL}/${encodeURIComponent(id)}`;
  const authorization = request.headers.get("authorization");

  const requestHeaders: HeadersInit = {
    Accept: "*/*",
    "Content-Type": "application/json",
    ...(authorization ? { Authorization: authorization } : {}),
  };

  console.log(`🔵 proxy/venues/[id]: ${method} REQUEST`, { id, url: targetUrl });

  const hasBody = method === "PUT" || method === "PATCH";

  try {
    const response = await fetch(targetUrl, {
      method,
      headers: requestHeaders,
      body: hasBody ? await request.text() : undefined,
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
    console.error(`❌ proxy/venues/[id]: error en fetch (${method}):`, error);
    return new NextResponse(JSON.stringify({ error: "No se pudo conectar al backend" }), {
      status: 502,
      headers: { "content-type": "application/json" },
    });
  }
}

export async function GET(request: Request, { params }: RouteParams) {
  const { id } = await params;
  return proxyRequest(request, id, "GET");
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return proxyRequest(request, id, "PUT");
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return proxyRequest(request, id, "PATCH");
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return proxyRequest(request, id, "DELETE");
}

