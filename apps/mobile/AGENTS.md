# Mobile Application Agent Guide

Stack:

Expo
React Native
TypeScript

Location:

apps/mobile

---

# Responsibilities

The mobile app provides the experience for players.

Features may include:

* finding matches
* joining teams
* booking venues
* player profiles

---

# Backend Communication

The mobile app must communicate only with the API.

Correct architecture:

Mobile → API → Supabase

Direct database access is not allowed.

---

# Environment Variables

.env.local
.env.development
.env.production

Example:

EXPO_PUBLIC_API_URL=http://localhost:5000
