// ─────────────────────────────────────────────────────────────────────────────
// app/api/bookings/[id]/cancel/route.ts
// PATCH /api/bookings/{id}/cancel
//
// Auth flow — mirrors /api/bookings POST exactly:
//   1. Read Bearer token from Authorization header.
//   2. Fallback: read from cookie "picadito_access_token".
//   3. Validate token with supabaseValidator.auth.getUser(token).
//   4. Create an authenticated Supabase client that sends the JWT on every
//      request so auth.uid() is set correctly for RLS.
//   5. Perform the UPDATE — state guard enforced inline via .in("status", [...])
//      to avoid a separate SELECT that could trigger RLS recursion.
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient }                        from "@supabase/supabase-js";

const CANCELLABLE_STATUSES = ["pending", "confirmed"] as const;

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const sep = "─────────────────────────────────────────────────────────";

  console.log(sep);

  // ── 1. Validate route param ───────────────────────────────────────────────
  const { id } = await params;

  if (!id || id.trim() === "") {
    console.error("[PATCH cancel] ❌ id param is empty");
    return NextResponse.json({ error: "ID requerido" }, { status: 400 });
  }

  // ── 2. Extract Bearer token (same strategy as POST /api/bookings) ─────────
  const authHeader  = req.headers.get("Authorization");
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  console.log(
    "[PATCH cancel] Authorization header:",
    bearerToken
      ? "Bearer " + bearerToken.slice(0, 40) + "…"
      : "❌ NO PRESENTE"
  );

  // Fallback: try cookie "picadito_access_token"
  let resolvedToken = bearerToken;

  if (!resolvedToken) {
    const { cookies } = await import("next/headers");
    const cookieStore  = await cookies();
    resolvedToken      = cookieStore.get("picadito_access_token")?.value ?? null;
    console.log(
      "[PATCH cancel] Fallback cookie token:",
      resolvedToken ? "✅ presente" : "❌ ausente"
    );
  }

  if (!resolvedToken) {
    console.warn("[PATCH cancel] ❌ Sin token — no autenticado");
    return NextResponse.json(
      { error: "Debes iniciar sesión para realizar esta acción" },
      { status: 401 }
    );
  }

  try {
    // ── 3. Validate token → get user ──────────────────────────────────────────
    const supabaseValidator = await createServerClient();
    const { data: { user }, error: authError } =
      await supabaseValidator.auth.getUser(resolvedToken);

    console.log("[PATCH cancel] getUser(token) →", {
      userId: user?.id    ?? null,
      email:  user?.email ?? null,
      error:  authError?.message ?? null,
    });

    if (authError || !user) {
      return NextResponse.json(
        { error: "Token inválido o expirado. Iniciá sesión nuevamente." },
        { status: 401 }
      );
    }

    // ── 4. Create authenticated Supabase client (JWT in every request) ────────
    const authedSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: { Authorization: `Bearer ${resolvedToken}` },
        },
        auth: {
          persistSession:   false,
          autoRefreshToken: false,
        },
      }
    );

    // ── 5. UPDATE directly with inline state guard (.in status cancellable) ───
    // We skip a separate SELECT to avoid triggering self-referencing RLS
    // SELECT policies. The .in("status", [...]) acts as the state guard:
    // if the booking is already cancelled/rejected, 0 rows are affected.
    const { data: updated, error: updateError } = await authedSupabase
      .from("bookings")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("id", id)
      .in("status", CANCELLABLE_STATUSES)   // ← inline state guard
      .select("id, status, updated_at")
      .single();

    console.log("[PATCH cancel] UPDATE →", {
      bookingId: updated?.id     ?? null,
      newStatus: updated?.status ?? null,
      error:     updateError?.message ?? null,
    });

    if (updateError) {
      // PGRST116 = no rows returned by .single() → state guard rejected it
      if (updateError.code === "PGRST116") {
        return NextResponse.json(
          { error: "La reserva no existe o ya fue cancelada/rechazada." },
          { status: 422 }
        );
      }
      console.error("[PATCH cancel] updateError:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    if (!updated) {
      return NextResponse.json(
        { error: "Reserva no encontrada o ya estaba cancelada." },
        { status: 422 }
      );
    }

    console.log(`[PATCH cancel] ✅ Booking ${id} cancelled`);
    console.log(sep);

    return NextResponse.json({
      id:        updated.id,
      status:    updated.status,
      updatedAt: updated.updated_at,
    });

  } catch (err) {
    console.error("[PATCH cancel] ❌ Unexpected error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
