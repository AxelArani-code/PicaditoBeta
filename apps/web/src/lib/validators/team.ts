import { z } from "zod";

export const createTeamSchema = z.object({
  name:     z.string().min(2).max(80),
  city:     z.string().optional(),
  logo_url: z.string().url().optional(),
});

export const addTeamMemberSchema = z.object({
  team_id: z.string().uuid(),
  user_id: z.string().uuid(),
  role:    z.enum(["captain", "player"]).default("player"),
});

export type CreateTeamInput    = z.infer<typeof createTeamSchema>;
export type AddTeamMemberInput = z.infer<typeof addTeamMemberSchema>;
