"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  updateMatchResultSchema,
} from "@/lib/validators/match";
import type {
  UpdateMatchResultInput,
} from "@/lib/validators/match";

/**
 * El match se crea automáticamente vía trigger cuando se confirma el booking.
 * Esta action actualiza resultado y jugadores.
 */
export async function submitMatchResult(input: UpdateMatchResultInput) {
  const parsed = updateMatchResultSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten() };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { match_id, score_a, score_b, players, mvp_user_id, mvp_guest_name } = parsed.data;

  // Actualizar resultado del match
  const { error: matchError } = await supabase
    .from("matches")
    .update({ score_a, score_b, status: "played" })
    .eq("id", match_id);

  if (matchError) return { error: matchError.message };

  // Eliminar jugadores previos y reinsertar
  await supabase.from("match_players").delete().eq("match_id", match_id);

  const playersToInsert = players.map((p) => ({
    match_id,
    team_id:    p.team_id ?? null,
    user_id:    p.user_id ?? null,
    guest_name: p.guest_name ?? null,
    goals:      p.goals ?? 0,
    assists:    p.assists ?? 0,
    yellow_cards: p.yellow_cards ?? 0,
    red_cards:  p.red_cards ?? 0,
    is_mvp:
      (mvp_user_id && p.user_id === mvp_user_id) ||
      (mvp_guest_name && p.guest_name === mvp_guest_name) ||
      false,
  }));

  const { error: playersError } = await supabase
    .from("match_players")
    .insert(playersToInsert);

  if (playersError) return { error: playersError.message };

  revalidatePath(`/dashboard/partidos/${match_id}`);
  revalidatePath("/dashboard/partidos");
  return { success: true };
}

export async function addMatchPlayers(
  matchId: string,
  players: UpdateMatchResultInput["players"]
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const toInsert = players.map((p) => ({
    match_id:     matchId,
    team_id:      p.team_id ?? null,
    user_id:      p.user_id ?? null,
    guest_name:   p.guest_name ?? null,
    goals:        p.goals ?? 0,
    assists:      p.assists ?? 0,
    yellow_cards: p.yellow_cards ?? 0,
    red_cards:    p.red_cards ?? 0,
  }));

  const { error } = await supabase.from("match_players").insert(toInsert);
  if (error) return { error: error.message };

  revalidatePath(`/dashboard/partidos/${matchId}`);
  return { success: true };
}

export async function voteMVP(matchId: string, targetUserId: string | null, targetGuestName: string | null) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  // Verificar que el votante participó
  const { data: participation } = await supabase
    .from("match_players")
    .select("id")
    .eq("match_id", matchId)
    .eq("user_id", user.id)
    .single();

  if (!participation) return { error: "Solo pueden votar jugadores que participaron en el partido" };

  // Quitar MVP previo
  await supabase
    .from("match_players")
    .update({ is_mvp: false })
    .eq("match_id", matchId);

  // Asignar nuevo MVP
  const query = supabase
    .from("match_players")
    .update({ is_mvp: true })
    .eq("match_id", matchId);

  if (targetUserId) {
    query.eq("user_id", targetUserId);
  } else if (targetGuestName) {
    query.eq("guest_name", targetGuestName);
  }

  const { error } = await query;
  if (error) return { error: error.message };

  revalidatePath(`/dashboard/partidos/${matchId}`);
  return { success: true };
}
