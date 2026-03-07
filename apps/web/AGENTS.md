# Web Application Agent Guide

Stack:

Next.js 15
TypeScript
TailwindCSS

Location:

apps/web

---

# Responsibilities

The web application handles:

* user interface
* authentication flows
* dashboards
* public pages

The frontend must **never contain business logic**.

Business logic belongs in the API.

---

# API Communication

All data must be retrieved through the backend API.

Incorrect:

Frontend → Supabase

Correct:

Frontend → API → Supabase

---

# Environment Variables

Environment variables must follow:

.env.local
.env.development
.env.production

Example:

NEXT_PUBLIC_API_URL=http://localhost:5000

Only variables prefixed with `NEXT_PUBLIC_` can be exposed to the browser.

---

# Development

Run locally:

npm run dev:web
