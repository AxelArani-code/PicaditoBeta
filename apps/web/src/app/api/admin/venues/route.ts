// ─────────────────────────────────────────────────────────────────────────────
// app/api/admin/venues/route.ts
// GET /api/admin/venues
// FIX: usa createClient() (anon key)
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { AdminVenue } from "@/types/admin";

export async function GET() {
  try {
    const supabase = await createClient();

    // Fetch venues
    const { data: venues, error: venuesError } = await supabase
      .from("venues")
      .select("id, owner_id, name, address, city, phone, email, whatsapp")
      .order("name", { ascending: true });

    if (venuesError) {
      console.error("[/api/admin/venues] venues error:", venuesError.message);
      return NextResponse.json({ error: venuesError.message }, { status: 400 });
    }

    if (!venues || venues.length === 0) {
      return NextResponse.json({ items: [], totalCount: 0 });
    }

    // Fetch pitches for all venues
    const venueIds = venues.map((v: any) => v.id as string);
    const { data: pitches, error: pitchesError } = await supabase
      .from("pitches")
      .select("id, venue_id, name, type, surface, price_per_hour, is_active")
      .in("venue_id", venueIds);

    if (pitchesError) {
      console.warn("[/api/admin/venues] pitches error (non-fatal):", pitchesError.message);
    }

    // Group pitches by venue_id
    const pitchesByVenue = new Map<string, any[]>();
    for (const p of pitches ?? []) {
      const list = pitchesByVenue.get(p.venue_id) ?? [];
      list.push(p);
      pitchesByVenue.set(p.venue_id, list);
    }

    const result: AdminVenue[] = (venues as any[]).map((v) => {
      const venuePitches = pitchesByVenue.get(v.id) ?? [];
      return {
        id:          v.id,
        ownerId:     v.owner_id,
        name:        v.name,
        address:     v.address ?? "",
        city:        v.city ?? "",
        phone:       v.phone ?? null,
        email:       v.email ?? null,
        whatsapp:    v.whatsapp ?? null,
        pitchCount:  venuePitches.length,
        pitches:     venuePitches.map((p) => ({
          id:           p.id,
          venueId:      p.venue_id,
          name:         p.name,
          type:         p.type,
          surface:      p.surface ?? null,
          pricePerHour: p.price_per_hour ?? 0,
          isActive:     p.is_active ?? true,
        })),
      };
    });

    return NextResponse.json({ items: result, totalCount: result.length });
  } catch (err) {
    console.error("[/api/admin/venues] unexpected error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
