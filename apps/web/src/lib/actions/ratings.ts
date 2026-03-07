"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function rateVenue(venueId: string, rating: number, comment?: string) {
  if (rating < 1 || rating > 5) return { error: "Rating inválido (1-5)" };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Debes iniciar sesión para calificar" };

  const { data, error } = await supabase
    .from("venue_ratings")
    .upsert(
      { venue_id: venueId, user_id: user.id, rating, comment: comment ?? null },
      { onConflict: "venue_id,user_id" }
    )
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath(`/canchas`);
  return { data };
}

export async function markNotificationRead(notificationId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", notificationId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  return { success: true };
}

export async function markAllNotificationsRead() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", user.id)
    .eq("read", false);

  if (error) return { error: error.message };
  return { success: true };
}
