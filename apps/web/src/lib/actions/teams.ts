"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createTeamSchema, addTeamMemberSchema } from "@/lib/validators/team";
import type { CreateTeamInput, AddTeamMemberInput } from "@/lib/validators/team";

export async function createTeam(input: CreateTeamInput) {
  const parsed = createTeamSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten() };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { data, error } = await supabase
    .from("teams")
    .insert({ ...parsed.data, created_by: user.id })
    .select()
    .single();

  if (error) return { error: error.message };

  // El creador es capitán automáticamente
  await supabase.from("team_members").insert({
    team_id: data.id,
    user_id: user.id,
    role: "captain",
  });

  revalidatePath("/dashboard/equipos");
  return { data };
}

export async function addTeamMember(input: AddTeamMemberInput) {
  const parsed = addTeamMemberSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten() };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { data, error } = await supabase
    .from("team_members")
    .insert(parsed.data)
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/equipos`);
  return { data };
}

export async function removeTeamMember(teamId: string, userId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { error } = await supabase
    .from("team_members")
    .delete()
    .eq("team_id", teamId)
    .eq("user_id", userId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/equipos");
  return { success: true };
}
