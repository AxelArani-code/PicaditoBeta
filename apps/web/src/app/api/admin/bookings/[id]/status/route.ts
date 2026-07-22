// ─────────────────────────────────────────────────────────────────────────────
// app/api/admin/bookings/[id]/status/route.ts
// PATCH /api/admin/bookings/{id}/status
// FIX: usa createClient() (anon key)
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { BookingStatus } from "@/types/admin";

const ALLOWED_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  pending:   ["confirmed", "rejected", "cancelled"],
  confirmed: ["cancelled"],
  rejected:  [],
  cancelled: [],
};

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

    let body: { status?: string };
    try { body = await request.json(); }
    catch { return NextResponse.json({ error: "Body JSON inválido" }, { status: 400 }); }

    const newStatus = body.status as BookingStatus;
    const validStatuses: BookingStatus[] = ["confirmed", "rejected", "cancelled"];
    if (!validStatuses.includes(newStatus)) {
      return NextResponse.json({ error: `Estado inválido. Permitidos: ${validStatuses.join(", ")}` }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: current, error: fetchError } = await supabase
      .from("bookings")
      .select("id, status")
      .eq("id", id)
      .single();

    if (fetchError || !current) return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });

    const allowed = ALLOWED_TRANSITIONS[current.status as BookingStatus] ?? [];
    if (!allowed.includes(newStatus)) {
      return NextResponse.json({ error: `No se puede cambiar de "${current.status}" a "${newStatus}"` }, { status: 422 });
    }

    const { data: updated, error: updateError } = await supabase
      .from("bookings")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("id, status, updated_at")
      .single();

    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 400 });

    return NextResponse.json({ id: updated.id, status: updated.status, updatedAt: updated.updated_at });
  } catch (err) {
    console.error("[/api/admin/bookings/[id]/status]:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
