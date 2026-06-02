import { NextResponse } from "next/server";

const BACKEND_BASE_URL = "http://localhost:5000/api/Bookings";

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
  const url = new URL(request.url);
  const backendUrl = buildBackendUrl(pathSegments, url.searchParams);
  const headers = buildHeaders(request);

  const init: RequestInit = {
    method: request.method,
    headers,
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.text();
  }

  try {
    const response = await fetch(backendUrl, init);
    const body = await response.text();

    const responseHeaders = new Headers();
    const contentType = response.headers.get("content-type");
    if (contentType) responseHeaders.set("content-type", contentType);

    return new NextResponse(body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("❌ proxy/bookings/[...path]: error en fetch:", error);
    return new NextResponse(
      JSON.stringify({ error: "No se pudo conectar al backend" }),
      {
        status: 502,
        headers: { "content-type": "application/json" },
      }
    );
  }
};

export async function PATCH(request: Request, { params }: { params: { path: string[] } }) {
  return proxyRequest(request, params.path);
}

export async function GET(request: Request, { params }: { params: { path: string[] } }) {
  return proxyRequest(request, params.path);
}

export async function POST(request: Request, { params }: { params: { path: string[] } }) {
  return proxyRequest(request, params.path);
}

export async function DELETE(request: Request, { params }: { params: { path: string[] } }) {
  return proxyRequest(request, params.path);
}
