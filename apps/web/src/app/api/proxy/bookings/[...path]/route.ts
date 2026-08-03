import { NextResponse } from "next/server";
import { backendUrl } from "@/config/api";

const BACKEND_BASE_URL = backendUrl("Bookings");

// ── Next.js 14 App Router: params is a Promise for dynamic routes ──────────
type CatchAllParams = { params: Promise<{ path: string[] }> };

const buildBackendUrl = (pathSegments: string[] = [], searchParams: URLSearchParams) => {
  const backendUrl = new URL(BACKEND_BASE_URL);

  if (pathSegments.length > 0) {
    backendUrl.pathname += "/" + pathSegments.map(encodeURIComponent).join("/");
  }

  searchParams.forEach((value, key) => {
    backendUrl.searchParams.append(key, value);
  });

  return backendUrl.toString();
};

const buildHeaders = (request: Request) => {
  const authorization = request.headers.get("authorization");
  return {
    Accept: "*/*",
    "Content-Type": "application/json",
    ...(authorization ? { Authorization: authorization } : {}),
  };
};

const proxyRequest = async (request: Request, pathSegments: string[]) => {
  const url        = new URL(request.url);
  const backendUrl = buildBackendUrl(pathSegments, url.searchParams);
  const headers    = buildHeaders(request);

  console.log(`🔵 proxy/bookings → ${request.method} ${backendUrl}`);

  const init: RequestInit = { method: request.method, headers };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.text();
  }

  try {
    const response = await fetch(backendUrl, init);
    const body     = await response.text();

    console.log(`🔵 proxy/bookings ← ${response.status} ${backendUrl}`);

    // 204 No Content — no body
    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const responseHeaders = new Headers();
    const contentType = response.headers.get("content-type");
    if (contentType) responseHeaders.set("content-type", contentType);

    return new NextResponse(body, { status: response.status, headers: responseHeaders });
  } catch (error) {
    console.error("❌ proxy/bookings/[...path] fetch error:", { url: backendUrl, error });
    return new NextResponse(
      JSON.stringify({ error: "No se pudo conectar al backend" }),
      { status: 502, headers: { "content-type": "application/json" } }
    );
  }
};

// ── Route handlers — params is awaited for Next.js 14 compatibility ───────

export async function PATCH(request: Request, { params }: CatchAllParams) {
  const { path } = await params;
  return proxyRequest(request, path);
}

export async function GET(request: Request, { params }: CatchAllParams) {
  const { path } = await params;
  return proxyRequest(request, path);
}

export async function POST(request: Request, { params }: CatchAllParams) {
  const { path } = await params;
  return proxyRequest(request, path);
}

export async function DELETE(request: Request, { params }: CatchAllParams) {
  const { path } = await params;
  return proxyRequest(request, path);
}

export async function PUT(request: Request, { params }: CatchAllParams) {
  const { path } = await params;
  return proxyRequest(request, path);
}
