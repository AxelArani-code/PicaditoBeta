import { z } from "zod";

export const createBookingSchema = z.object({
  pitch_id: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  start_time: z.string().regex(/^\d{2}:\d{2}$/),
  end_time: z.string().regex(/^\d{2}:\d{2}$/),
  notes: z.string().max(300).optional(),
});

export const updateBookingStatusSchema = z.object({
  booking_id: z.string().uuid(),
  status: z.enum(["confirmed", "rejected", "cancelled"]),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>;
