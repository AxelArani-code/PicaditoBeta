import { z } from "zod";

export const matchPlayerSchema = z.object({
  user_id:      z.string().uuid().nullable().optional(),
  guest_name:   z.string().max(80).nullable().optional(),
  team_id:      z.string().uuid().nullable().optional(),
  team:         z.enum(["a", "b"]).optional(),
  goals:        z.number().min(0).default(0),
  assists:      z.number().min(0).default(0),
  yellow_cards: z.number().min(0).default(0),
  red_cards:    z.number().min(0).default(0),
}).refine(
  (data) => data.user_id || data.guest_name,
  { message: "Debe tener user_id o guest_name" }
);

export const updateMatchResultSchema = z.object({
  match_id:       z.string().uuid(),
  score_a:        z.number().min(0),
  score_b:        z.number().min(0),
  players:        z.array(matchPlayerSchema),
  mvp_user_id:    z.string().uuid().nullable().optional(),
  mvp_guest_name: z.string().nullable().optional(),
});

export type MatchPlayerInput    = z.infer<typeof matchPlayerSchema>;
export type UpdateMatchResultInput = z.infer<typeof updateMatchResultSchema>;
