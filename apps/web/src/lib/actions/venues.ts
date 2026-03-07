"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createVenueSchema, updateVenueSchema } from "@/lib/validators/venue";
import type { CreateVenueInput, UpdateVenueInput } from "@/lib/validators/venue";

export async function createVenue(input: CreateVenueInput) {
  const parsed = createVenueSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten() };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { data, error } = await supabase
    .from("venues")
    .insert({ ...parsed.data, owner_id: user.id })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/dashboard/venues");
  return { data };
}

export async function updateVenue(id: string, input: UpdateVenueInput) {
  const parsed = updateVenueSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten() };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { data, error } = await supabase
    .from("venues")
    .update(parsed.data)
    .eq("id", id)
    .eq("owner_id", user.id)
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/dashboard/venues");
  revalidatePath(`/canchas/${data.slug}`);
  return { data };
}

export async function deleteVenue(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { error } = await supabase
    .from("venues")
    .delete()
    .eq("id", id)
    .eq("owner_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/venues");
  redirect("/dashboard/venues");
}
