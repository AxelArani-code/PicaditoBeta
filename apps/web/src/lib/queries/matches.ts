import { createClient } from "@/lib/supabase/server";

export async function getMatchById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("matches")
    .select(`
      *,
      pitches!inner(name, pitch_type, venues!inner(name, slug, city)),
      match_players(*, profiles!user_id(username, full_name, avatar_url)),
      teams!team_a_id(id, name, slug, logo_url),
      teams!team_b_id(id, name, slug, logo_url)
    `)
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}

export async function getMatchesByVenue(venueId: string, limit = 20) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("matches")
    .select("*, pitches!inner(name)")
    .eq("venue_id", venueId)
    .order("date", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

export async function getMatchesByUser(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("matches")
    .select(`
      *,
      pitches!inner(name, venues!inner(name, slug)),
      match_players!inner(user_id, goals, assists, is_mvp)
    `)
    .eq("match_players.user_id", userId)
    .order("date", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getPlayerRanking(limit = 50) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("player_ranking")
    .select("*")
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}
