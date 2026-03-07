# API Agent Guide

Backend service for the Picadito platform.

Location:

apps/api

---

# Architecture

The backend follows **Clean Architecture**.

Layers:

Domain
Application
Infrastructure
Api

Dependency rule:

Api → Application → Domain
Infrastructure → Application → Domain

Domain must not depend on other layers.

---

# Responsibilities

The API is responsible for:

* business logic
* authentication
* data validation
* database access
* integrations

All client applications must communicate through this API.

---

# Database

The system uses **Supabase PostgreSQL**.

Database migrations are stored in:

/supabase/migrations

---

# Running the API

cd apps/api
dotnet run
