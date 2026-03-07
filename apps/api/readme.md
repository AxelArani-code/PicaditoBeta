# Picadito API

Backend service for the **Picadito SaaS platform**.

This API centralizes all business logic and data access for the system.
It will be consumed by:

* **Web application** → `apps/web` (Next.js)
* **Mobile application** → `apps/mobile` (Expo / React Native)

The API communicates with **Supabase PostgreSQL** as the primary database.

---

# Architecture

This backend follows **Clean Architecture** principles.

Clean Architecture separates the system into layers with clear responsibilities and dependency rules.

## Layers

### Domain

Core business rules and entities.

Contains:

* Entities
* Value Objects
* Domain rules
* Business invariants

The **Domain layer must not depend on any other layer**.

---

### Application

Contains the application's **use cases**.

Responsibilities:

* Application services
* Business workflows
* DTOs
* Interfaces for repositories and external services

The Application layer depends only on **Domain**.

---

### Infrastructure

Implements the interfaces defined in Application.

Responsibilities:

* Database access
* Supabase integration
* External services
* Repository implementations

Infrastructure depends on **Application and Domain**.

---

### API

Entry point of the application.

Responsibilities:

* HTTP controllers
* Request validation
* Authentication
* Routing

API depends on **Application**.

---

# Dependency Direction

The dependency flow must always follow this rule:

```
API → Application → Domain
Infrastructure → Application → Domain
```

The **Domain layer must never depend on Infrastructure or API**.

---

# Proposed Project Structure

```
apps/api
│
├ Picadito.sln
│
├ src
│   ├ Picadito.Api
│   │
│   ├ Picadito.Application
│   │
│   ├ Picadito.Domain
│   │
│   └ Picadito.Infrastructure
│
└ tests
```

---

# Tech Stack

The backend will use the following technologies:

* **.NET 10**
* **ASP.NET Core Web API**
* **PostgreSQL (Supabase)**
* **JWT Authentication**
* **Entity Framework Core** or **Dapper**

---

# Running the API Locally

From the repository root:

```
cd apps/api
dotnet run
```

The API will start on something like:

```
http://localhost:5000
```

---

# Environment Variables

The API will connect to Supabase PostgreSQL and other services.

Example configuration:

```
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-secret-key
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
```

These values should be stored in a local `.env` file or system environment variables.

---

# Development Guidelines

To keep the project maintainable:

* Controllers must be **thin**
* Business logic belongs in **Application**
* Domain contains **pure business rules**
* Infrastructure handles **database and external services**
* Avoid placing business logic inside controllers

---

# Communication with Frontend

The **Next.js frontend (`apps/web`) must communicate only with this API**, not directly with Supabase.

Correct flow:

```
Frontend → API → Database
```

This ensures:

* centralized business logic
* security
* maintainability

---

# Future Extensions

The API will eventually support:

* Team management
* Match organization
* Venue reservations
* Player profiles
* Payments and subscriptions
* Statistics and analytics

---

# Contributing

Before adding new features:

1. Identify the **Domain entities**
2. Create the **Application use cases**
3. Implement infrastructure if needed
4. Expose functionality via the API layer
