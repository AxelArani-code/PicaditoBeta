import { createClient } from "@/lib/supabase/server";

export async function getBookingsByPlayer(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bookings")
    .select(`
      *,
      pitches!inner(*, venues!inner(name, city, slug, address))
    `)
    .eq("created_by", userId)
    .order("date", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getBookingsByVenueOwner(ownerId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bookings")
    .select(`
      *,
      pitches!inner(*, venues!inner(owner_id, name, slug)),
      profiles!created_by(username, full_name, avatar_url)
    `)
    .eq("pitches.venues.owner_id", ownerId)
    .order("date", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getBookingById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bookings")
    .select(`
      *,
      pitches!inner(*, venues!inner(*)),
      profiles!created_by(username, full_name, avatar_url, phone)
    `)
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}

export async function getPendingBookingsForOwner(ownerId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bookings")
    .select(`
      *,
      pitches!inner(name, venues!inner(owner_id, name)),
      profiles!created_by(username, full_name)
    `)
    .eq("pitches.venues.owner_id", ownerId)
    .eq("status", "pending")
    .order("created_at");

  if (error) throw error;
  return data ?? [];
}
