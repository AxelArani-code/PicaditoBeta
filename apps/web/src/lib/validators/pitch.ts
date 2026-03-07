import { z } from "zod";

export const pitchTypeEnum = z.enum(["f5", "f7", "f9", "f11"]);

export const createPitchSchema = z.object({
  venue_id: z.string().uuid(),
  name: z.string().min(2).max(80),
  pitch_type: pitchTypeEnum,
  price_per_hour: z.number().positive("El precio debe ser mayor a 0"),
  description: z.string().max(300).optional(),
});

export const availabilityRuleSchema = z.object({
  pitch_id: z.string().uuid(),
  day_of_week: z.number().min(0).max(6),
  open_time: z.string().regex(/^\d{2}:\d{2}$/),
  close_time: z.string().regex(/^\d{2}:\d{2}$/),
});

export type CreatePitchInput = z.infer<typeof createPitchSchema>;
export type AvailabilityRuleInput = z.infer<typeof availabilityRuleSchema>;
