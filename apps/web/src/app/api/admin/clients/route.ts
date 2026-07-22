// ─────────────────────────────────────────────────────────────────────────────
// app/api/admin/clients/route.ts
// GET /api/admin/clients
// FIX: usa createClient() (anon key)
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { AdminClient } from "@/types/admin";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: bookingStats, error: statsError } = await supabase
      .from("bookings")
      .select("user_id, date, total_price, status");

    if (statsError) {
      return NextResponse.json({ error: statsError.message }, { status: 400 });
    }

    // Group by user_id
    const userMap = new Map<string, { bookingsCount: number; lastBookingDate: string | null; totalSpent: number }>();
    for (const b of bookingStats ?? []) {
      const uid = b.user_id as string;
      if (!uid) continue;
      const e = userMap.get(uid) ?? { bookingsCount: 0, lastBookingDate: null, totalSpent: 0 };
      e.bookingsCount += 1;
      e.totalSpent += Number(b.total_price) || 0;
      if (b.date && (!e.lastBookingDate || b.date > e.lastBookingDate)) e.lastBookingDate = b.date;
      userMap.set(uid, e);
    }

    if (userMap.size === 0) return NextResponse.json({ items: [], totalCount: 0 });

    const userIds = Array.from(userMap.keys());
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, email, phone")
      .in("id", userIds);

    const clients: AdminClient[] = (profiles ?? []).map((p: any) => {
      const stats = userMap.get(p.id) ?? { bookingsCount: 0, lastBookingDate: null, totalSpent: 0 };
      return {
        id:              p.id,
        name:            p.full_name ?? "Cliente",
        email:           p.email ?? "—",
        phone:           p.phone ?? null,
        bookingsCount:   stats.bookingsCount,
        lastBookingDate: stats.lastBookingDate,
        totalSpent:      stats.totalSpent,
      };
    });

    clients.sort((a, b) => b.bookingsCount - a.bookingsCount);
    return NextResponse.json({ items: clients, totalCount: clients.length });
  } catch (err) {
    console.error("[/api/admin/clients]:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
