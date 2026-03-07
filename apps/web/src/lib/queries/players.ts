import { createClient } from "@/lib/supabase/server";

export async function getPlayerProfile(username: string) {
  const supabase = await createClient();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (error) return null;

  // Stats del jugador
  const { data: stats } = await supabase
    .from("player_stats")
    .select("*")
    .eq("user_id", profile.id)
    .single();

  // Teams del jugador
  const { data: teams } = await supabase
    .from("team_members")
    .select("role, teams!inner(id, name, slug, logo_url, city)")
    .eq("user_id", profile.id);

  // Últimos 10 partidos
  const { data: recentMatches } = await supabase
    .from("match_players")
    .select(`
      goals, assists, is_mvp, yellow_cards, red_cards,
      matches!inner(id, date, score_a, score_b, status,
        pitches!inner(name, venues!inner(name, slug)))
    `)
    .eq("user_id", profile.id)
    .order("matches.date", { ascending: false })
    .limit(10);

  return { profile, stats, teams, recentMatches };
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile;
}

export async function getNotifications(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) throw error;
  return data ?? [];
}
