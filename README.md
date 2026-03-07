
# Picadito — Amateur Football Platform

Platform to organize amateur football matches, book pitches, and build a local football community.

Picadito connects **players, teams, and venues** in a single platform to simplify match organization.

---

# Tech Stack

| Layer | Technology |
|------|-------------|
| Frontend | Next.js 15 (App Router) + TypeScript |
| UI | TailwindCSS + shadcn/ui + Radix UI |
| Mobile | Expo / React Native (future) |
| Backend API | ASP.NET Core (.NET) |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth |
| Validation | Zod |
| Notifications | Sonner |
| QR | qrcode.react |

---

# Monorepo Architecture

```
saasFutbol/
│
├ apps/
│   ├ web/             # Next.js application
│   ├ api/             # .NET backend API (Clean Architecture)
│   └ mobile/          # Expo / React Native application
│
├ supabase/            # Shared database infrastructure
│   ├ migrations/
│   └ seed_data.sql
│
├ package.json         # Workspace configuration
└ README.md
```

---

# System Architecture

```
Frontend (Next.js)
        │
        ▼
Backend API (.NET)
        │
        ▼
Supabase (PostgreSQL + Auth + Storage)
```

All business logic flows through the backend API.

Benefits:
- centralized business logic
- stronger security
- reusable backend for web and mobile
- easier scalability

---

# Core Features

## Players

- search available pitches
- create bookings
- join matches
- view player statistics
- rate venues
- track match history

## Teams

- create teams
- invite members
- manage team roster
- participate in matches

## Venues

- manage football complexes
- configure pitches
- manage availability
- confirm or reject bookings

---

# Database Overview

The system uses **Supabase PostgreSQL**.

Schema migrations are stored in:

```
/supabase/migrations
```

## Core Tables

| Table | Description |
|------|-------------|
| profiles | User profile linked to auth.users |
| venues | Sports complexes |
| pitches | Individual pitches |
| availability_rules | Opening hours |
| time_slots | Bookable time slots |
| bookings | Reservations |
| matches | Football matches |
| match_players | Match participants |
| teams | Teams |
| team_members | Team memberships |
| venue_ratings | Venue reviews |
| notifications | Realtime notifications |
| audit_logs | System audit events |

---

# Key Relationships

```
venue → pitches
pitch → time_slots
time_slot → bookings
booking → match
match → match_players
team → team_members
venue → venue_ratings
```

---

# Domain Rules

- Only venue owners can manage pitches.
- Only venue owners can confirm bookings.
- Confirmed bookings automatically generate matches.
- Matches support registered players or guest players.
- Only match participants can vote MVP.
- Only match participants can rate venues.

---

# System Flows

## Booking Flow

```
player → search pitch → select slot → create booking (pending)
owner → confirm booking
trigger → match created automatically
```

## Match Flow

```
booking confirmed
      ↓
match created
      ↓
captain updates score and players
      ↓
match status = played
```

---

# Roles

| Role | Permissions |
|-----|-------------|
| player | book pitches, join matches |
| venue_owner | manage venues and bookings |
| admin | full platform access |

---

# Development

Install dependencies:

```
npm install
```

Run web application:

```
npm run dev:web
```

Future commands:

```
npm run dev:api
npm run dev:mobile
```

Application will run at:

```
http://localhost:3000
```

---

# Environment Variables

Example variables:

| Variable | Description |
|----------|-------------|
| NEXT_PUBLIC_SUPABASE_URL | Supabase project URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Public anon key |
| SUPABASE_SERVICE_ROLE_KEY | Server key |
| NEXT_PUBLIC_APP_URL | App base URL |

---

# Future Roadmap

- Mobile application
- Payments integration
- Match statistics
- Ranking system
- League / tournament support

