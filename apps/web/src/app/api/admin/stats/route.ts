// ─────────────────────────────────────────────────────────────────────────────
// app/api/admin/stats/route.ts
// GET /api/admin/stats — KPIs del día
// FIX: usa createClient() (anon key) en lugar de createAdminClient()
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { DashboardStats } from "@/types/admin";

export async function GET() {
  try {
    const supabase = await createClient();

    const todayISO = new Date().toLocaleDateString("en-CA"); // "YYYY-MM-DD"

    console.log(`[/api/admin/stats] date="${todayISO}"`);

    const [todayRes, pendingRes, allBookingsRes] = await Promise.all([
      supabase
        .from("bookings")
        .select("id, status, total_price")
        .eq("date", todayISO),

      supabase
        .from("bookings")
        .select("id")
        .eq("status", "pending"),

      supabase
        .from("bookings")
        .select("user_id"),
    ]);

    console.log("[/api/admin/stats]", {
      todayCount:   todayRes.data?.length ?? 0,
      todayError:   todayRes.error?.message ?? null,
      pendingCount: pendingRes.data?.length ?? 0,
      totalRows:    allBookingsRes.data?.length ?? 0,
    });

    const todayRows   = todayRes.data   ?? [];
    const pendingRows = pendingRes.data  ?? [];
    const allRows     = allBookingsRes.data ?? [];

    const todayConfirmed = todayRows.filter((b) => b.status === "confirmed").length;
    const todayPending   = todayRows.filter((b) => b.status === "pending").length;
    const todayCancelled = todayRows.filter((b) => b.status === "cancelled" || b.status === "rejected").length;
    const todayRevenue   = todayRows
      .filter((b) => b.status === "confirmed")
      .reduce((sum, b) => sum + (Number(b.total_price) || 0), 0);

    const uniqueClients = new Set(allRows.map((r: { user_id: string }) => r.user_id)).size;

    const stats: DashboardStats = {
      todayBookings:    todayRows.length,
      todayConfirmed,
      todayPending,
      todayCancelled,
      todayRevenue,
      pendingToConfirm: pendingRows.length,
      totalClients:     uniqueClients,
    };

    return NextResponse.json(stats);
  } catch (err) {
    console.error("[/api/admin/stats] unexpected error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
