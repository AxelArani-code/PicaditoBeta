import { createClient } from "@/lib/supabase/server";

export async function getAvailableSlots(pitchId: string, date: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("time_slots")
    .select("*")
    .eq("pitch_id", pitchId)
    .eq("date", date)
    .eq("status", "available")
    .order("start_time");

  if (error) throw error;
  return data ?? [];
}

export async function getSlotsForRange(pitchId: string, dateFrom: string, dateTo: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("time_slots")
    .select("*")
    .eq("pitch_id", pitchId)
    .gte("date", dateFrom)
    .lte("date", dateTo)
    .order("date")
    .order("start_time");

  if (error) throw error;
  return data ?? [];
}

export async function getAvailabilityRules(pitchId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("availability_rules")
    .select("*")
    .eq("pitch_id", pitchId)
    .order("day_of_week");

  if (error) throw error;
  return data ?? [];
}
