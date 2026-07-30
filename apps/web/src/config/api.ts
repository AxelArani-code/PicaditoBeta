/**
 * config/api.ts
 *
 * Single source of truth for the backend API base URL.
 *
 * Set NEXT_PUBLIC_API_URL in your .env.local / .env.development / .env.production:
 *   NEXT_PUBLIC_API_URL=http://localhost:5000
 *
 * Architecture:
 *   Frontend → /api/proxy/* (Next.js Route Handlers) → Backend → Supabase
 *
 * ⚠️  This file is used ONLY by server-side Route Handlers (proxy layer).
 *     Client components must never call the backend directly — always go
 *     through the internal /api/proxy/* routes.
 */

/** Base URL of the .NET backend, e.g. "http://localhost:5000" */
export const BACKEND_ORIGIN =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

/** Full API prefix, e.g. "http://localhost:5000/api" */
export const BACKEND_API_BASE = `${BACKEND_ORIGIN}/api`;

/**
 * Build the full URL for a given backend resource path.
 *
 * @example
 *   backendUrl("VenueClosures")        // → "http://localhost:5000/api/VenueClosures"
 *   backendUrl("Bookings/123/confirm") // → "http://localhost:5000/api/Bookings/123/confirm"
 */
export function backendUrl(path: string): string {
  // Strip any leading slash from path to avoid double-slash
  return `${BACKEND_API_BASE}/${path.replace(/^\//, "")}`;
}
