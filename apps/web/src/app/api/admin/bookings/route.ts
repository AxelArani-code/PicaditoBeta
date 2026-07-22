// ─────────────────────────────────────────────────────────────────────────────
// app/api/admin/bookings/route.ts
// GET /api/admin/bookings?status=&date=&page=&pageSize=
// FIX: usa createClient() (anon key)
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { AdminBooking, AdminBookingsPage } from "@/types/admin";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status     = searchParams.get("status") ?? "";
    const date       = searchParams.get("date")   ?? "";
    const pageNumber = Math.max(1, Number(searchParams.get("page")     ?? 1));
    const pageSize   = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") ?? 20)));
    const from       = (pageNumber - 1) * pageSize;
    const to         = from + pageSize - 1;

    const supabase = await createClient();

    let query = supabase
      .from("bookings")
      .select(
        "id, pitch_id, user_id, status, date, start_time, end_time, total_price, payment_status, created_at, updated_at",
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(from, to);

    if (status) query = query.eq("status", status);
    if (date)   query = query.eq("date", date);

    const { data: bookingsRaw, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!bookingsRaw || bookingsRaw.length === 0) {
      return NextResponse.json({
        items: [],
        totalCount: count ?? 0,
        totalPages: 1,
        pageNumber,
        pageSize,
      } satisfies AdminBookingsPage);
    }

    // Fetch pitch names
    const pitchIds = [...new Set(bookingsRaw.map((b: any) => b.pitch_id as string).filter(Boolean))];
    const { data: pitches } = await supabase
      .from("pitches")
      .select("id, name, venue_id")
      .in("id", pitchIds);

    const pitchMap = new Map<string, { name: string; venueId: string }>();
    for (const p of pitches ?? []) {
      pitchMap.set(p.id, { name: p.name, venueId: p.venue_id });
    }

    // Fetch venue names
    const venueIds = [...new Set((pitches ?? []).map((p: any) => p.venue_id as string).filter(Boolean))];
    const { data: venues } = venueIds.length > 0
      ? await supabase.from("venues").select("id, name").in("id", venueIds)
      : { data: [] };

    const venueMap = new Map<string, string>();
    for (const v of venues ?? []) venueMap.set(v.id, v.name);

    const items: AdminBooking[] = (bookingsRaw as any[]).map((row) => {
      const pitchInfo = pitchMap.get(row.pitch_id);
      const startNorm = (row.start_time as string)?.slice(0, 5) ?? "—";
      const endNorm   = (row.end_time   as string)?.slice(0, 5) ?? "—";

      return {
        id:            row.id,
        pitchId:       row.pitch_id,
        pitchName:     pitchInfo?.name ?? "—",
        venueId:       pitchInfo?.venueId ?? "",
        venueName:     pitchInfo ? (venueMap.get(pitchInfo.venueId) ?? "—") : "—",
        userId:        row.user_id ?? "",
        userName:      "Cliente",
        userEmail:     "—",
        userPhone:     null,
        date:          row.date,
        startTime:     startNorm,
        endTime:       endNorm,
        totalPrice:    Number(row.total_price) || 0,
        status:        row.status,
        paymentStatus: row.payment_status ?? "pending",
        createdAt:     row.created_at,
        updatedAt:     row.updated_at,
      };
    });

    const totalCount = count ?? items.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

    return NextResponse.json({ items, totalCount, totalPages, pageNumber, pageSize } satisfies AdminBookingsPage);
  } catch (err) {
    console.error("[/api/admin/bookings] unexpected error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
