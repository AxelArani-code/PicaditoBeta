import { z } from "zod";

export const createVenueSchema = z.object({
  name:        z.string().min(3, "Mínimo 3 caracteres").max(100),
  description: z.string().max(500).optional(),
  address:     z.string().min(5),
  city:        z.string().min(2),
  whatsapp:    z.string().optional(),
});

export const updateVenueSchema = createVenueSchema.partial();

export type CreateVenueInput = z.infer<typeof createVenueSchema>;
export type UpdateVenueInput = z.infer<typeof updateVenueSchema>;
