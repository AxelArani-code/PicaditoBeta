"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createPitchSchema, availabilityRuleSchema } from "@/lib/validators/pitch";
import type { CreatePitchInput, AvailabilityRuleInput } from "@/lib/validators/pitch";

export async function createPitch(input: CreatePitchInput) {
  const parsed = createPitchSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten() };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  // Verificar que el owner sea dueño del venue
  const { data: venue } = await supabase
    .from("venues")
    .select("id")
    .eq("id", parsed.data.venue_id)
    .eq("owner_id", user.id)
    .single();

  if (!venue) return { error: "No tienes permiso para agregar canchas a este complejo" };

  const { data, error } = await supabase
    .from("pitches")
    .insert(parsed.data)
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/venues/${parsed.data.venue_id}`);
  return { data };
}

export async function createAvailabilityRule(input: AvailabilityRuleInput) {
  const parsed = availabilityRuleSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten() };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { data, error } = await supabase
    .from("availability_rules")
    .insert(parsed.data)
    .select()
    .single();

  if (error) return { error: error.message };
  return { data };
}

export async function deleteAvailabilityRule(ruleId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { error } = await supabase
    .from("availability_rules")
    .delete()
    .eq("id", ruleId);

  if (error) return { error: error.message };
  return { success: true };
}

/**
 * Genera slots para una pitch en un rango de fechas
 * según sus availability_rules.
 */
export async function generateSlotsForPitch(pitchId: string, dateFrom: string, dateTo: string) {
  const supabase = await createClient();

  const { data: rules } = await supabase
    .from("availability_rules")
    .select("*")
    .eq("pitch_id", pitchId);

  if (!rules?.length) return { error: "No hay reglas de disponibilidad" };

  const slots: {
    pitch_id: string;
    date: string;
    start_time: string;
    end_time: string;
    status: string;
  }[] = [];

  const from = new Date(dateFrom);
  const to   = new Date(dateTo);

  for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
    const dow = d.getDay();
    const dateStr = d.toISOString().split("T")[0];
    const dayRules = rules.filter((r) => r.day_of_week === dow);

    for (const rule of dayRules) {
      const [oh, om] = rule.open_time.split(":").map(Number);
      const [ch, cm] = rule.close_time.split(":").map(Number);
      let startMin = oh * 60 + om;
      const endMin = ch * 60 + cm;

      while (startMin + rule.slot_minutes <= endMin) {
        const sh = String(Math.floor(startMin / 60)).padStart(2, "0");
        const sm = String(startMin % 60).padStart(2, "0");
        const eh = String(Math.floor((startMin + rule.slot_minutes) / 60)).padStart(2, "0");
        const em = String((startMin + rule.slot_minutes) % 60).padStart(2, "0");

        slots.push({
          pitch_id:   pitchId,
          date:       dateStr,
          start_time: `${sh}:${sm}`,
          end_time:   `${eh}:${em}`,
          status:     "available",
        });

        startMin += rule.slot_minutes;
      }
    }
  }

  if (slots.length === 0) return { error: "No se generaron slots para ese rango" };

  const { error } = await supabase
    .from("time_slots")
    .upsert(slots, { onConflict: "pitch_id,date,start_time", ignoreDuplicates: true });

  if (error) return { error: error.message };
  return { success: true, count: slots.length };
}
