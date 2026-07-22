// ─────────────────────────────────────────────────────────────────────────────
// app/api/player/bookings/[id]/cancel/route.ts
// PATCH /api/player/bookings/[id]/cancel
//
// Allows an authenticated player to cancel their OWN pending booking.
//
// Strategy: validate auth with the anon client (RLS), then perform the actual
// UPDATE with the service-role client (bypasses RLS) to avoid the
// "infinite recursion detected in policy for relation bookings" bug
// caused by the self-referencing subquery in the UPDATE WITH CHECK policy.
//
// Security is still enforced in application code:
//   1. Token is validated with auth.getUser()
//   2. We verify booking.user_id === auth user before updating
//   3. We verify booking.status === 'pending' before updating
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

// ── Helper: resolve auth token ────────────────────────────────────────────────
async function resolveToken(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) return authHeader.slice(7);

  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  return cookieStore.get("picadito_access_token")?.value ?? null;
}

// ── PATCH /api/player/bookings/[id]/cancel ────────────────────────────────────
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "ID de reserva requerido." }, { status: 400 });
    }

    // ── 1. Validate auth token ────────────────────────────────────────────────
    const token = await resolveToken(request);
    if (!token) {
      return NextResponse.json({ error: "No autenticado." }, { status: 401 });
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

    // ── 2. Service-role client (bypasses RLS — workaround for the recursive
    //        policy bug until 002_fix_bookings_rls.sql is applied in Supabase)
    const serviceClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );

    // ── 3. Fetch the booking — enforce ownership & status in app layer ────────
    const { data: booking, error: fetchError } = await serviceClient
      .from("bookings")
      .select("id, status, user_id")
      .eq("id", id)
      .single();

    if (fetchError || !booking) {
      return NextResponse.json(
        { error: "Reserva no encontrada." },
        { status: 404 }
      );
    }

    // Ownership check (replaces RLS USING clause)
    if (booking.user_id !== user.id) {
      return NextResponse.json(
        { error: "Esta reserva no te pertenece." },
        { status: 403 }
      );
    }

    // Status check
    if (booking.status !== "pending") {
      return NextResponse.json(
        {
          error:
            booking.status === "confirmed"
              ? "Solo podés cancelar reservas pendientes. Para cancelar una reserva confirmada, contactá al complejo."
              : "Esta reserva ya fue cancelada o rechazada.",
        },
        { status: 422 }
      );
    }

    // ── 4. Update status to 'cancelled' (service-role bypasses RLS) ───────────
    const { data: updated, error: updateError } = await serviceClient
      .from("bookings")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", user.id)   // extra safety
      .select("id, status, updated_at")
      .single();

    if (updateError) {
      console.error("[PATCH /api/player/bookings/cancel] update error:", updateError);
      return NextResponse.json(
        { error: updateError.message ?? "No se pudo cancelar la reserva." },
        { status: 500 }
      );
    }

    console.log(`[PATCH /api/player/bookings/cancel] ✅ Booking ${id} cancelled by user ${user.id}`);

    return NextResponse.json(
      { message: "Reserva cancelada correctamente.", booking: updated },
      { status: 200 }
    );
  } catch (err) {
    console.error("[PATCH /api/player/bookings/cancel] unexpected error:", err);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
