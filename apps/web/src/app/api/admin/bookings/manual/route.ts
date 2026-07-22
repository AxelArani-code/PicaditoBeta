// ─────────────────────────────────────────────────────────────────────────────
// app/api/admin/bookings/manual/route.ts
// POST /api/admin/bookings/manual
// FIX: usa createClient() (anon key)
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface ManualBookingBody {
  pitchId:     string;
  slotId:      string;
  date:        string;
  startTime:   string;
  endTime:     string;
  totalPrice:  number;
  clientName:  string;
  clientEmail?: string;
  clientPhone?: string;
}

export async function POST(request: NextRequest) {
  try {
    let body: ManualBookingBody;
    try { body = await request.json(); }
    catch { return NextResponse.json({ error: "Body JSON inválido" }, { status: 400 }); }

    const { pitchId, slotId, date, startTime, endTime, totalPrice, clientName, clientEmail, clientPhone } = body;

    if (!pitchId || !slotId || !date || !startTime || !endTime || !clientName) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    const supabase = await createClient();

    // 1. Verify slot is still available
    const { data: slot, error: slotError } = await supabase
      .from("time_slots")
      .select("id, status")
      .eq("id", slotId)
      .single();

    if (slotError || !slot) return NextResponse.json({ error: "Turno no encontrado" }, { status: 404 });
    if (slot.status !== "available") {
      return NextResponse.json({ error: `El turno ya no está disponible (estado: ${slot.status})` }, { status: 409 });
    }

    // 2. Find or create guest profile
    let userId: string | null = null;
    if (clientEmail) {
      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", clientEmail)
        .maybeSingle();
      if (existing) userId = existing.id;
    }

    if (!userId) {
      const { data: newProfile } = await supabase
        .from("profiles")
        .insert({ full_name: clientName, email: clientEmail ?? null, phone: clientPhone ?? null, role: "player" })
        .select("id")
        .single();
      userId = newProfile?.id ?? null;
    }

    // 3. Create booking
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        pitch_id:       pitchId,
        user_id:        userId,
        date,
        start_time:     startTime,
        end_time:       endTime,
        total_price:    totalPrice,
        status:         "confirmed",
        payment_status: "pending",
        created_at:     new Date().toISOString(),
        updated_at:     new Date().toISOString(),
      })
      .select("id, status, date, start_time, end_time, total_price")
      .single();

    if (bookingError) {
      console.error("[manual booking] insert error:", bookingError.message);
      return NextResponse.json({ error: bookingError.message }, { status: 400 });
    }

    // 4. Mark slot as booked (fallback if no Supabase trigger)
    await supabase.from("time_slots").update({ status: "booked" }).eq("id", slotId);

    return NextResponse.json(
      { id: booking.id, status: booking.status, date: booking.date, startTime: booking.start_time, endTime: booking.end_time, totalPrice: booking.total_price, message: "Reserva creada correctamente" },
      { status: 201 }
    );
  } catch (err) {
    console.error("[/api/admin/bookings/manual]:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
