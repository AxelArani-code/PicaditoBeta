import { NextResponse } from "next/server";

const BACKEND_BASE_URL = "http://localhost:5000/api/Pitches";

const proxyRequest = async (
  request: Request,
  id: string,
  subPath?: string
) => {
  let backendUrl = `${BACKEND_BASE_URL}/${encodeURIComponent(id)}`;
  if (subPath) {
    backendUrl += `/${subPath}`;
  }

  const url = new URL(request.url);
  const backendUrlObj = new URL(backendUrl);
  url.searchParams.forEach((value, key) => {
    backendUrlObj.searchParams.append(key, value);
  });

  const authorization = request.headers.get("authorization");

  console.log("🔵 proxy/pitches/[id]: REQUEST RECIBIDO", {
    method: request.method,
    id,
    subPath,
    backendUrl: backendUrlObj.toString(),
  });

  const requestHeaders: Record<string, string> = {
    Accept: "*/*",
    "Content-Type": "application/json",
    ...(authorization ? { Authorization: authorization } : {}),
  };

  const init: RequestInit = {
    method: request.method,
    headers: requestHeaders,
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.text();
  }

  try {
    const response = await fetch(backendUrlObj.toString(), init);

    console.log("🔵 proxy/pitches/[id]: RESPUESTA DEL BACKEND", {
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
    console.error("❌ proxy/pitches/[id]: error en fetch:", error);
    return new NextResponse(
      JSON.stringify({ error: "No se pudo conectar al backend" }),
      {
        status: 502,
        headers: { "content-type": "application/json" },
      }
    );
  }
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyRequest(request, id);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyRequest(request, id);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyRequest(request, id);
}
