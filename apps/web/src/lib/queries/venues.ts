import { createClient } from "@/lib/supabase/server";

export async function getVenues(city?: string) {
  const supabase = await createClient();
  let query = supabase
    .from("venues")
    .select("*, pitches(count)")
    .order("created_at", { ascending: false });

  if (city) query = query.ilike("city", `%${city}%`);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getVenueBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("venues")
    .select(`
      *,
      pitches(*),
      profiles!owner_id(username, full_name),
      venue_ratings(rating, comment, user_id, profiles!user_id(username, avatar_url))
    `)
    .eq("slug", slug)
    .single();

  if (error) return null;
  return data;
}

export async function getVenuesByOwner(ownerId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("venues")
    .select("*, pitches(*)")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getVenueById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("venues")
    .select("*, pitches(*)")
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}
