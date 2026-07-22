// ─────────────────────────────────────────────────────────────────────────────
// app/api/owner/profile/route.ts
// GET /api/owner/profile
//
// Devuelve el perfil del usuario autenticado + el venue que le pertenece.
// Usado por el DashboardShell para mostrar nombre, rol y complejo en el nav.
//
// Auth: Bearer token del header Authorization ó cookie picadito_access_token.
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

async function resolveToken(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get("Authorization");
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;
  if (bearerToken) return bearerToken;

  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  return cookieStore.get("picadito_access_token")?.value ?? null;
}

export async function GET(req: NextRequest) {
  const token = await resolveToken(req);

  if (!token) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    // ── Validar token → obtener user ─────────────────────────────────────────
    const validator = await createServerClient();
    const {
      data: { user },
      error: authError,
    } = await validator.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Token inválido o expirado" }, { status: 401 });
    }

    // ── Cliente autenticado con JWT ──────────────────────────────────────────
    const authedClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: { headers: { Authorization: `Bearer ${token}` } },
        auth:   { persistSession: false, autoRefreshToken: false },
      }
    );

    // ── Perfil del usuario ───────────────────────────────────────────────────
    const { data: profile } = await authedClient
      .from("profiles")
      .select("id, full_name, username, avatar_url, role, city")
      .eq("id", user.id)
      .single();

    // ── Venue del dueño (solo si es venue_owner) ─────────────────────────────
    let venue: { id: string; name: string; city: string | null } | null = null;

    if (profile?.role === "venue_owner") {
      const { data: venueData } = await authedClient
        .from("venues")
        .select("id, name, city")
        .eq("owner_id", user.id)
        .order("name", { ascending: true })
        .limit(1)
        .single();

      venue = venueData ?? null;
    }

    console.log(
      `[GET /api/owner/profile] ✅ user=${user.id} role=${profile?.role} venue=${venue?.name ?? "—"}`
    );

    return NextResponse.json({
      user: {
        id:        user.id,
        email:     user.email ?? null,
      },
      profile: profile
        ? {
            fullName:  profile.full_name,
            username:  profile.username,
            avatarUrl: profile.avatar_url,
            role:      profile.role,       // "player" | "venue_owner" | "admin"
            city:      profile.city,
          }
        : null,
      venue,
    });
  } catch (err) {
    console.error("[GET /api/owner/profile] unexpected error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
