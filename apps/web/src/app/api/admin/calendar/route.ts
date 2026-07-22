// ─────────────────────────────────────────────────────────────────────────────
// app/api/admin/calendar/route.ts
// GET /api/admin/calendar?date=YYYY-MM-DD
//
// FIX: usa createClient() (anon key) en lugar de createAdminClient()
// porque SUPABASE_SERVICE_ROLE_KEY no está configurada.
// Coincide exactamente con el enfoque que funciona en useAvailableSlots.
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { CalendarDayData, CalendarSlot } from "@/types/admin";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: "Parámetro 'date' requerido en formato YYYY-MM-DD" },
        { status: 400 }
      );
    }

    console.log(`[/api/admin/calendar] date="${date}"`);

    const supabase = await createClient();

    // ── 1. Fetch time_slots (sin join — más seguro, evita errores de FK name) ─
    const { data: slots, error: slotsError } = await supabase
      .from("time_slots")
      .select("id, pitch_id, date, start_time, end_time, price, status")
      .eq("date", date)
      .order("start_time", { ascending: true });

    console.log("[/api/admin/calendar] time_slots:", {
      count: slots?.length ?? 0,
      error: slotsError?.message ?? null,
      first: slots?.[0] ?? null,
    });

    if (slotsError) {
      return NextResponse.json({ error: slotsError.message }, { status: 400 });
    }

    if (!slots || slots.length === 0) {
      return NextResponse.json({
        date,
        slots: [],
        summary: { total: 0, booked: 0, available: 0 },
      } satisfies CalendarDayData);
    }

    // ── 2. Fetch pitch names for the unique pitch_ids found ───────────────────
    const pitchIds = [...new Set(slots.map((s: any) => s.pitch_id as string))];

    const { data: pitches, error: pitchesError } = await supabase
      .from("pitches")
      .select("id, name")
      .in("id", pitchIds);

    console.log("[/api/admin/calendar] pitches:", {
      count: pitches?.length ?? 0,
      error: pitchesError?.message ?? null,
    });

    // Build pitch name lookup
    const pitchNameMap = new Map<string, string>();
    for (const p of pitches ?? []) {
      pitchNameMap.set(p.id, p.name ?? `Cancha ${p.id.slice(0, 6)}`);
    }

    // ── 3. Fetch bookings for that date (best-effort, non-fatal) ──────────────
    const { data: bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select("id, pitch_id, start_time, end_time, status, total_price")
      .eq("date", date)
      .in("status", ["pending", "confirmed"]);

    console.log("[/api/admin/calendar] bookings:", {
      count: bookings?.length ?? 0,
      error: bookingsError?.message ?? null,
    });

    // Build booking lookup: "pitch_id:start_time" → booking row
    const bookingLookup = new Map<string, (typeof bookings)[number]>();
    for (const b of bookings ?? []) {
      // Normalise time to HH:MM in case DB returns "HH:MM:SS"
      const tKey = (b.start_time as string).slice(0, 5);
      bookingLookup.set(`${b.pitch_id}:${tKey}`, b);
    }

    // ── 4. Map to CalendarSlot ─────────────────────────────────────────────────
    const calendarSlots: CalendarSlot[] = (slots as any[]).map((s) => {
      const startNorm = (s.start_time as string).slice(0, 5); // "HH:MM"
      const endNorm   = (s.end_time   as string).slice(0, 5);
      const key       = `${s.pitch_id}:${startNorm}`;
      const booking   = bookingLookup.get(key);

      return {
        id:        s.id,
        pitchId:   s.pitch_id,
        pitchName: pitchNameMap.get(s.pitch_id) ?? `Cancha ${(s.pitch_id as string).slice(0, 6)}`,
        startTime: startNorm,
        endTime:   endNorm,
        status:    s.status,
        price:     Number(s.price) || 0,
        ...(booking
          ? {
              booking: {
                id:            booking.id,
                userName:      "Cliente",
                totalPrice:    Number(booking.total_price) || 0,
                bookingStatus: booking.status as any,
              },
            }
          : {}),
      } satisfies CalendarSlot;
    });

    const result: CalendarDayData = {
      date,
      slots: calendarSlots,
      summary: {
        total:     calendarSlots.length,
        booked:    calendarSlots.filter((s) => s.status === "booked").length,
        available: calendarSlots.filter((s) => s.status === "available").length,
      },
    };

    console.log("[/api/admin/calendar] OK →", result.summary);

    return NextResponse.json(result);
  } catch (err) {
    console.error("[/api/admin/calendar] unexpected error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
