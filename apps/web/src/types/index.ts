// ── Enums ──────────────────────────────────────────────────────────────────
export type UserRole = "player" | "venue_owner" | "admin";
export type BookingStatus = "pending" | "confirmed" | "rejected" | "cancelled";
export type PitchType = "f5" | "f7" | "f9" | "f11";
export type TeamMemberRole = "captain" | "player";
export type SlotStatus = "available" | "blocked" | "booked";
export type MatchStatus = "scheduled" | "played" | "cancelled";
export type NotificationType =
  | "booking_confirmed"
  | "booking_rejected"
  | "match_created"
  | "team_invite"
  | "general";

// ── Core tables ────────────────────────────────────────────────────────────
export interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  city: string | null;
  created_at: string;
}

export interface Venue {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string | null;
  city: string;
  address: string;
  whatsapp: string | null;
  created_at: string;
}

export interface Pitch {
  id: string;
  venue_id: string;
  name: string;
  pitch_type: PitchType;
  price_per_hour: number;
  created_at: string;
}

export interface AvailabilityRule {
  id: string;
  pitch_id: string;
  day_of_week: number; // 0=Sun … 6=Sat
  open_time: string;   // HH:MM
  close_time: string;  // HH:MM
  slot_minutes: number;
}

export interface TimeSlot {
  id: string;
  pitch_id: string;
  date: string;        // YYYY-MM-DD
  start_time: string;  // HH:MM
  end_time: string;    // HH:MM
  status: SlotStatus;
  booking_id: string | null;
}

export interface Booking {
  id: string;
  pitch_id: string;
  date: string;
  start_time: string;
  end_time: string;
  created_by: string;
  status: BookingStatus;
  players_count: number;
  confirmed_at: string | null;
  cancelled_at: string | null;
  created_at: string;
}

export interface Match {
  id: string;
  booking_id: string | null;
  venue_id: string;
  pitch_id: string;
  team_a_id: string | null;
  team_b_id: string | null;
  score_a: number | null;
  score_b: number | null;
  status: MatchStatus;
  date: string;
  start_time: string;
}

export interface Team {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  city: string | null;
  created_by: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: TeamMemberRole;
}

export interface MatchPlayer {
  id: string;
  match_id: string;
  team_id: string | null;
  user_id: string | null;
  guest_name: string | null;
  goals: number;
  assists: number;
  yellow_cards: number;
  red_cards: number;
}

export interface VenueRating {
  id: string;
  venue_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

// ── Computed / Views ────────────────────────────────────────────────────────
export interface PlayerStats {
  user_id: string;
  matches_played: number;
  goals: number;
  assists: number;
  yellow_cards: number;
  red_cards: number;
}

// ── Enriched / joined types ─────────────────────────────────────────────────
export interface VenueWithPitches extends Venue {
  pitches: Pitch[];
}

export interface BookingWithDetails extends Booking {
  pitch: Pitch & { venue: Venue };
  profile: Profile;
}

export interface MatchWithDetails extends Match {
  pitch: Pitch & { venue: Venue };
  match_players: (MatchPlayer & { profile?: Profile })[];
  team_a?: Team;
  team_b?: Team;
}

export interface TeamWithMembers extends Team {
  team_members: (TeamMember & { profile: Profile })[];
}

export interface ProfileWithStats extends Profile {
  stats: PlayerStats;
  teams: Team[];
  recent_matches: MatchWithDetails[];
}
