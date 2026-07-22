// app/api/owner/pitches/route.ts
// GET /api/owner/pitches
//
// Devuelve las canchas (pitches) del complejo que pertenece al usuario
// autenticado. El user.id (auth.uid) == venues.owner_id.
//
// Auth: Bearer token del header Authorization o cookie picadito_access_token.

import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

async function resolveToken(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get("Authorization");
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;
  if (bearerToken) {
    console.log("[GET /api/owner/pitches] token from Bearer header");
    return bearerToken;
  }

  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get("picadito_access_token")?.value ?? null;
  if (cookieToken) {
    console.log("[GET /api/owner/pitches] token from cookie picadito_access_token");
  } else {
    console.log("[GET /api/owner/pitches] NO token found (no header, no cookie)");
  }
  return cookieToken;
}

export async function GET(req: NextRequest) {
  console.log("=== [GET /api/owner/pitches] START ===");

  const token = await resolveToken(req);

  if (!token) {
    console.error("[GET /api/owner/pitches] 401 - No token");
    return NextResponse.json(
      { error: "No autenticado" },
      { status: 401 }
    );
  }

  try {
    // Validar token y obtener user.id
    const validator = await createServerClient();
    const {
      data: { user },
      error: authError,
    } = await validator.auth.getUser(token);

    if (authError || !user) {
      console.error("[GET /api/owner/pitches] 401 - Invalid token:", authError?.message);
      return NextResponse.json(
        { error: "Token invalido o expirado" },
        { status: 401 }
      );
    }

    console.log("[GET /api/owner/pitches] user.id:", user.id, "email:", user.email);

    // Cliente autenticado con JWT para respetar RLS
    const authedClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: { headers: { Authorization: `Bearer ${token}` } },
        auth: { persistSession: false, autoRefreshToken: false },
      }
    );

    // Traer el venue del dueno usando owner_id = user.id
    const { data: venues, error: venueError } = await authedClient
      .from("venues")
      .select("id, name, city, address, slug")
      .eq("owner_id", user.id)
      .order("name", { ascending: true });

    if (venueError) {
      console.error("[GET /api/owner/pitches] venues Supabase error:", {
        message: venueError.message,
        code:    venueError.code,
        details: venueError.details,
        hint:    venueError.hint,
      });
      return NextResponse.json(
        { error: venueError.message, code: venueError.code, hint: venueError.hint },
        { status: 400 }
      );
    }

    console.log("[GET /api/owner/pitches] venues found:", venues?.length ?? 0);

    if (!venues || venues.length === 0) {
      return NextResponse.json({ venues: [], pitches: [] });
    }

    // Traer los pitches de todos los venues del dueno
    const venueIds = venues.map((v) => v.id as string);
    console.log("[GET /api/owner/pitches] venueIds:", venueIds);

    const { data: pitches, error: pitchError } = await authedClient
      .from("pitches")
      .select("id, venue_id, name, type, price_per_hour, surface, is_active")
      .in("venue_id", venueIds)
      .order("name", { ascending: true });

    if (pitchError) {
      console.error("[GET /api/owner/pitches] pitches Supabase error:", {
        message: pitchError.message,
        code:    pitchError.code,
        details: pitchError.details,
        hint:    pitchError.hint,
      });
      return NextResponse.json(
        { error: pitchError.message, code: pitchError.code, hint: pitchError.hint },
        { status: 400 }
      );
    }

    console.log(`[GET /api/owner/pitches] OK - user=${user.id} | ${venues.length} venue(s), ${pitches?.length ?? 0} pitch(es)`);
    console.log("=== [GET /api/owner/pitches] END ===");

    return NextResponse.json({
      venues,
      pitches: pitches ?? [],
    });
  } catch (err) {
    console.error("[GET /api/owner/pitches] unexpected error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
