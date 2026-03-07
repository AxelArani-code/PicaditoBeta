import { createClient } from "@/lib/supabase/server";

export async function getTeamBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("teams")
    .select(`
      *,
      team_members(role, profiles!user_id(id, username, full_name, avatar_url, city)),
      profiles!created_by(username)
    `)
    .eq("slug", slug)
    .single();

  if (error) return null;
  return data;
}

export async function getTeamsByUser(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("team_members")
    .select("role, teams!inner(id, name, slug, logo_url, city, created_by)")
    .eq("user_id", userId);

  if (error) throw error;
  return data ?? [];
}

export async function searchTeams(query: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("teams")
    .select("id, name, slug, logo_url, city")
    .ilike("name", `%${query}%`)
    .limit(10);

  if (error) throw error;
  return data ?? [];
}
