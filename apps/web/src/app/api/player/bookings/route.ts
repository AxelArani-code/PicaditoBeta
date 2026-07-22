// ─────────────────────────────────────────────────────────────────────────────
// app/api/player/bookings/route.ts
// GET /api/player/bookings
//   Query params: status, date, venueId, search, page, pageSize
//
// Architecture: Frontend → this handler → Supabase (RLS enforced)
// Auth: Bearer token from Authorization header, fallback to picadito_access_token cookie
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import {
  deriveBookingCode,
  computeDuration,
} from "@/types/player-bookings";
import type {
  PlayerBooking,
  PlayerBookingStats,
  PlayerBookingsPage,
} from "@/types/player-bookings";

// ── Helper: resolve auth token ────────────────────────────────────────────────
async function resolveToken(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) return authHeader.slice(7);

  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  return cookieStore.get("picadito_access_token")?.value ?? null;
}

// ── GET /api/player/bookings ──────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    // ── 1. Auth ───────────────────────────────────────────────────────────────
    const token = await resolveToken(request);
    if (!token) {
      return NextResponse.json(
        { error: "No autenticado. Iniciá sesión para ver tus reservas." },
        { status: 401 }
      );
    }

    const supabaseValidator = await createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabaseValidator.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Token inválido o expirado." },
        { status: 401 }
      );
    }

    // ── 2. Parse query params ─────────────────────────────────────────────────
    const { searchParams } = new URL(request.url);
    const statusParam  = searchParams.get("status")  ?? "";
    const dateParam    = searchParams.get("date")    ?? "";
    const venueIdParam = searchParams.get("venueId") ?? "";
    const searchParam  = (searchParams.get("search") ?? "").trim();
    const pageNumber   = Math.max(1, Number(searchParams.get("page")     ?? 1));
    const pageSize     = Math.min(50, Math.max(1, Number(searchParams.get("pageSize") ?? 20)));
    const from         = (pageNumber - 1) * pageSize;
    const to           = from + pageSize - 1;

    // ── 3. Create authenticated client (so RLS sees auth.uid()) ──────────────
    const authed = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: { headers: { Authorization: `Bearer ${token}` } },
        auth: { persistSession: false, autoRefreshToken: false },
      }
    );

    // ── 4. Build base query ────────────────────────────────────────────────────
    // NOTE: We fetch all matching rows first (without range) when search/venueId
    // filters are active since those must be applied in-memory after the join.
    // For plain status/date filters we can rely on DB-level pagination.
    const needsPostFilter = !!(searchParam || venueIdParam);

    let query = authed
      .from("bookings")
      .select(
        `
        id,
        status,
        date,
        total_price,
        created_at,
        time_slot_id,
        pitch_id,
        time_slots ( start_time, end_time ),
        pitches    ( id, name, type, surface, venue_id,
                     venues ( id, name, address, city, phone, description, images )
                   )
        `,
        { count: "exact" }
      )
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    // ── 5. Apply DB-level filters (reliable columns) ──────────────────────────
    if (statusParam) query = query.eq("status", statusParam);
    if (dateParam)   query = query.eq("date", dateParam);

    // Apply range only when we don't need post-filtering
    if (!needsPostFilter) {
      query = query.range(from, to);
    }

    const { data: raw, error: queryError, count } = await query;

    if (queryError) {
      console.error("[GET /api/player/bookings] query error:", queryError);
      return NextResponse.json({ error: queryError.message }, { status: 400 });
    }

    // ── 6. Map raw rows → PlayerBooking ───────────────────────────────────────
    let items: PlayerBooking[] = (raw ?? []).map((row: any) => {
      const slot    = row.time_slots   as { start_time: string; end_time: string } | null;
      const pitch   = row.pitches      as any | null;
      const venue   = pitch?.venues    as any | null;

      const startTime = (slot?.start_time ?? "00:00").slice(0, 5);
      const endTime   = (slot?.end_time   ?? "00:00").slice(0, 5);

      const imageUrl: string | null =
        Array.isArray(venue?.images) && venue.images.length > 0
          ? venue.images[0]
          : null;

      return {
        id:              row.id,
        code:            deriveBookingCode(row.id),
        status:          row.status,
        date:            row.date,
        startTime,
        endTime,
        durationMinutes: computeDuration(startTime, endTime),
        totalAmount:     Number(row.total_price) || 0,
        createdAt:       row.created_at,
        pitch: {
          id:      pitch?.id      ?? "",
          name:    pitch?.name    ?? "—",
          type:    pitch?.type    ?? "5v5",
          surface: pitch?.surface ?? "sintetico",
        },
        venue: {
          id:       venue?.id          ?? "",
          name:     venue?.name        ?? "—",
          address:  venue?.address     ?? "—",
          city:     venue?.city        ?? "",
          phone:    venue?.phone       ?? null,
          notes:    venue?.description ?? null,
          imageUrl,
        },
      } satisfies PlayerBooking;
    });

    // ── 7. Apply post-join text search (venue/pitch name / code) ─────────────
    if (searchParam) {
      const q = searchParam.toLowerCase();
      items = items.filter(
        (b) =>
          b.venue.name.toLowerCase().includes(q) ||
          b.pitch.name.toLowerCase().includes(q) ||
          b.code.toLowerCase().includes(q)
      );
    }

    // ── 8. Apply venueId filter (post-join) ───────────────────────────────────
    if (venueIdParam) {
      items = items.filter((b) => b.venue.id === venueIdParam);
    }

    // ── 9. Manual pagination when post-filtering was applied ──────────────────
    const totalFiltered = needsPostFilter ? items.length : (count ?? items.length);
    if (needsPostFilter) {
      items = items.slice(from, from + pageSize);
    }

    // ── 10. Compute stats across ALL user bookings (not just current page) ────
    const { data: allRaw } = await authed
      .from("bookings")
      .select("status")
      .eq("user_id", user.id)
      .is("deleted_at", null);

    const stats: PlayerBookingStats = {
      total:     allRaw?.length ?? 0,
      confirmed: allRaw?.filter((b: any) => b.status === "confirmed").length  ?? 0,
      pending:   allRaw?.filter((b: any) => b.status === "pending").length    ?? 0,
      cancelled: allRaw?.filter((b: any) => b.status === "cancelled" || b.status === "rejected").length ?? 0,
    };

    const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));

    return NextResponse.json({
      items,
      stats,
      totalCount: totalFiltered,
      totalPages,
      pageNumber,
      pageSize,
    } satisfies PlayerBookingsPage);
  } catch (err) {
    console.error("[GET /api/player/bookings] unexpected error:", err);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
