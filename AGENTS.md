# Repository Agents Guide

This repository follows a **monorepo architecture**.

Structure:

apps/
web      → Next.js frontend
api      → .NET backend (Clean Architecture)
mobile   → Expo / React Native mobile app

supabase/
Database schema, migrations and seed data.

---

# Development Rules

1. Each application inside `apps/` must be independent.
2. Shared infrastructure lives at the repository root.
3. Frontend and mobile **must not access Supabase directly**.
4. All business logic must go through the **API layer**.

Correct architecture:

Frontend / Mobile → API → Supabase

---

# Environment Variables

Environment variables must follow this pattern:

.env.local
.env.development
.env.production

Sensitive files must **never be committed to git**.

---

# Git Ignore Policy

The following must always be ignored:

.env*
node_modules
.next
dist
build
coverage

Each application may also define its own `.gitignore`.

---

# Monorepo Commands

Install dependencies:

npm install

Run web application:

npm run dev:web

Future commands:

npm run dev:api
npm run dev:mobile
