/**
 * server-fetch.ts
 *
 * Helper para hacer fetch autenticado desde Server Components.
 *
 * Lee el JWT desde la COOKIE `picadito_access_token` (que establece el
 * endpoint /api/auth/login), NO desde Supabase. Esto evita que llamar a
 * supabase.auth.getSession() desde Server Components cause re-renders
 * infinitos al actualizar las cookies de sesión de Supabase.
 *
 * Arquitectura:
 *   Server Component → fetchFromApi() → /api/proxy/* → .NET API → Supabase
 */

import { cookies } from "next/headers";

const API_BASE = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

/**
 * Obtiene el JWT desde la cookie `picadito_access_token`.
 * El middleware ya garantiza que esta cookie existe si llegamos aquí.
 */
async function getServerAccessToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get("picadito_access_token")?.value ?? null;
  } catch {
    return null;
  }
}

/**
 * Realiza un fetch autenticado desde el servidor hacia el proxy local.
 *
 * @param path  - Ruta relativa, ej: "/api/proxy/pitches" o "/api/proxy/pitches/some-id"
 * @param init  - Opciones adicionales de fetch (method, body, etc.)
 * @returns     - La respuesta JSON ya parseada, o lanza un error
 */
export async function fetchFromApi<T = unknown>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const token = await getServerAccessToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(init.headers as Record<string, string>),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const url = `${API_BASE}${path}`;

  const response = await fetch(url, {
    ...init,
    headers,
    cache: "no-store",
  });

  const text = await response.text();

  if (!response.ok) {
    let message = `Error ${response.status}: ${response.statusText}`;
    try {
      const json = JSON.parse(text);
      // .NET ProblemDetails format: { title, detail, errors }
      if (json?.detail)      message = json.detail;
      else if (json?.title)  message = json.title;
      else if (json?.error)  message = json.error;
    } catch {
      // ignore parse error
    }
    throw new Error(message);
  }

  if (!text) return null as T;

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}
