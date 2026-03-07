"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  createBookingSchema,
  updateBookingStatusSchema,
} from "@/lib/validators/booking";
import type {
  CreateBookingInput,
  UpdateBookingStatusInput,
} from "@/lib/validators/booking";

export async function createBooking(input: CreateBookingInput) {
  const parsed = createBookingSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten() };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Debes iniciar sesión para reservar" };

  // Verificar que el slot esté disponible
  const { data: slot } = await supabase
    .from("time_slots")
    .select("id, status")
    .eq("pitch_id", parsed.data.pitch_id)
    .eq("date", parsed.data.date)
    .eq("start_time", parsed.data.start_time)
    .single();

  if (slot && slot.status !== "available") {
    return { error: "Este horario ya no está disponible" };
  }

  const { data, error } = await supabase
    .from("bookings")
    .insert({ ...parsed.data, created_by: user.id })
    .select()
    .single();

  if (error) return { error: error.message };

  // Marcar slot como booked temporalmente si existe
  if (slot) {
    await supabase
      .from("time_slots")
      .update({ status: "booked", booking_id: data.id })
      .eq("id", slot.id);
  }

  // Notificar al owner del venue
  const { data: pitch } = await supabase
    .from("pitches")
    .select("venue_id, name, venues!inner(owner_id, name)")
    .eq("id", parsed.data.pitch_id)
    .single();

  if (pitch) {
    const venue = pitch.venues as unknown as { owner_id: string; name: string };
    await supabase.from("notifications").insert({
      user_id: venue.owner_id,
      type: "general",
      title: "Nueva reserva pendiente 📅",
      message: `Reserva en ${pitch.name} para el ${parsed.data.date} a las ${parsed.data.start_time}`,
      related_id: data.id,
    });
  }

  revalidatePath("/dashboard/reservas");
  return { data };
}

export async function confirmBooking(bookingId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { data, error } = await supabase
    .from("bookings")
    .update({ status: "confirmed" })
    .eq("id", bookingId)
    .select("*, pitches!inner(venue_id, venues!inner(owner_id))")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/dashboard/reservas");
  return { data };
}

export async function rejectBooking(bookingId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { data, error } = await supabase
    .from("bookings")
    .update({ status: "rejected" })
    .eq("id", bookingId)
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/dashboard/reservas");
  return { data };
}

export async function cancelBooking(bookingId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { data, error } = await supabase
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", bookingId)
    .eq("created_by", user.id) // solo el propio jugador puede cancelar
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/dashboard/reservas");
  return { data };
}
