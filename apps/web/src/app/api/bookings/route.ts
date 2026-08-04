import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

type BookingRequestBody = {
  slot_id?: string;
};

export async function POST(request: Request) {
  // ── Parse body ───────────────────────────────────────────────────────────────
  let body: BookingRequestBody;
  try {
    body = (await request.json()) as BookingRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { slot_id } = body;

  if (!slot_id) {
    return NextResponse.json({ error: "slot_id is required" }, { status: 400 });
  }

  // ── Extract Bearer token from Authorization header ────────────────────────
  const authHeader = request.headers.get("Authorization");
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  console.log("─────────────────────────────────────────────────────────");
  console.log("[POST /api/bookings] Authorization header:", authHeader
    ? "Bearer " + authHeader.slice(7, 47) + "…"
    : "❌ NO PRESENTE"
  );

  // ── Fallback: try cookies if no Bearer ────────────────────────────────────
  let resolvedToken = bearerToken;

  if (!resolvedToken) {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    resolvedToken =
      cookieStore.get("picadito_access_token")?.value ?? null;
    console.log("[POST /api/bookings] Fallback cookie token:", resolvedToken ? "✅ presente" : "❌ ausente");
  }

  if (!resolvedToken) {
    console.warn("[POST /api/bookings] ❌ Sin token — no autenticado");
    return NextResponse.json(
      { error: "Debes iniciar sesión para reservar un turno" },
      { status: 401 }
    );
  }

  try {
    // ── Validate token and get user_id ────────────────────────────────────────
    const supabaseValidator = await createServerClient();
    const { data: { user }, error: authError } = await supabaseValidator.auth.getUser(resolvedToken);

    console.log("[POST /api/bookings] getUser(token) →", {
      userId: user?.id ?? null,
      email:  user?.email ?? null,
      error:  authError?.message ?? null,
    });

    if (authError || !user) {
      return NextResponse.json(
        { error: "Token inválido o expirado. Iniciá sesión nuevamente." },
        { status: 401 }
      );
    }

    // ── Create an AUTHENTICATED Supabase client with the Bearer token ─────────
    const authedSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${resolvedToken}`,
          },
        },
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    // ── Fetch time_slot data: price, pitch_id, date ───────────────────────────
    // The bookings table has NOT NULL columns: pitch_id and date,
    // which must be populated from the time_slot row.
    const { data: slot, error: slotError } = await authedSupabase
      .from("time_slots")
      .select("price, pitch_id, date")
      .eq("id", slot_id)
      .single();

    if (slotError || !slot) {
      console.error("[POST /api/bookings] Slot no encontrado:", slotError);
      return NextResponse.json(
        { error: "El turno seleccionado no existe o ya no está disponible" },
        { status: 404 }
      );
    }

    console.log("[POST /api/bookings] 📋 Slot data:", {
      price:    slot.price,
      pitch_id: slot.pitch_id,
      date:     slot.date,
    });

    // ── Check for existing active booking on this slot (before INSERT) ────────
    // Prevents the 23505 unique_active_booking_slot constraint error.
    const { data: existingBooking } = await authedSupabase
      .from("bookings")
      .select("id, status")
      .eq("time_slot_id", slot_id)
      .in("status", ["pending", "confirmed"])
      .is("deleted_at", null)
      .maybeSingle();

    if (existingBooking) {
      console.warn("[POST /api/bookings] ⚠️ Slot ya reservado:", existingBooking);
      return NextResponse.json(
        { error: "Este turno ya fue reservado. Por favor seleccioná otro horario." },
        { status: 409 }
      );
    }

    // ── INSERT booking (con auth.uid() activo por el Bearer token) ────────────
    const { data, error } = await authedSupabase
      .from("bookings")
      .insert({
        time_slot_id: slot_id,
        pitch_id:     slot.pitch_id,   // ← required NOT NULL field
        date:         slot.date,        // ← required NOT NULL field
        user_id:      user.id,
        status:       "pending",
        total_price:  slot.price,
      })
      .select()
      .single();

    console.log("[POST /api/bookings] INSERT →", {
      bookingId: data?.id ?? null,
      error:     error?.message ?? null,
    });

    if (error) {
      console.error("[POST /api/bookings] Error en INSERT:", {
        code:    error.code,
        message: error.message,
        details: error.details,
        hint:    error.hint,
      });

      // PostgreSQL unique constraint violation
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Este turno ya fue reservado. Por favor seleccioná otro horario." },
          { status: 409 }
        );
      }

      // PostgreSQL not-null constraint violation
      if (error.code === "23502") {
        return NextResponse.json(
          { error: `Campo requerido faltante: ${error.details ?? error.message}` },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: error.message ?? "Error al crear la reserva" },
        { status: 500 }
      );
    }

    console.log("[POST /api/bookings] ✅ Reserva creada:", data.id);
    console.log("─────────────────────────────────────────────────────────");

    return NextResponse.json({ booking: data }, { status: 200 });
  } catch (err) {
    console.error("[POST /api/bookings] Unexpected error:", err);
    return NextResponse.json(
      { error: "Error inesperado al procesar la reserva" },
      { status: 500 }
    );
  }
}

