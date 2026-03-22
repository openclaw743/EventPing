# Architecture — EventPing

## Overview

EventPing is a full-stack event RSVP application. Users authenticate via Google to create events, then share a unique link. Anyone with the link can RSVP (Yes/No/Tentative) without logging in and see all responses.

## System Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌──────────────┐
│   React SPA     │────▶│  Express API    │────▶│  PostgreSQL  │
│  (Static Web    │     │  (Container App)│     │  (Flexible   │
│   App - WE)     │     │                 │     │   Server)    │
└─────────────────┘     └─────────────────┘     └──────────────┘
        │                       │
        │                       │
        ▼                       ▼
   Tailwind CSS          Google OAuth 2.0
```

## Components

### Frontend (React + Vite + TypeScript)
- **Pages:** Landing, Create Event, Event Detail (with RSVP form), Dashboard (my events)
- **Auth:** Google OAuth via backend — stores JWT in httpOnly cookie
- **State:** React Context for auth state; React Query for server state
- **Routing:** React Router v6

### Backend (Express + TypeScript)
- **Auth routes:** `/api/auth/google`, `/api/auth/callback`, `/api/auth/me`, `/api/auth/logout`
- **Event routes:** `/api/events` (CRUD, creator-only for write ops)
- **RSVP routes:** `/api/events/:slug/rsvps` (public read/write, no auth required)
- **Middleware:** auth (JWT verification), error handling, request validation (zod)
- **Session:** JWT in httpOnly cookie, refresh token rotation

### Database (PostgreSQL)
- Tables: `users`, `events`, `rsvps`
- See `database/schema/ERD.md` for full schema

### Infrastructure
- **Frontend:** Azure Static Web Apps (westeurope)
- **Backend:** Azure Container App (swedencentral)
- **Database:** Azure Database for PostgreSQL Flexible Server (swedencentral)
- **IaC:** Terraform in `infra/terraform/`
- **CI/CD:** GitHub Actions — lint, test, build, deploy

## Security

- Google OAuth 2.0 for authentication
- JWT tokens in httpOnly, secure, sameSite cookies
- CORS restricted to frontend origin
- Input validation with zod on all endpoints
- Parameterized queries (no raw SQL concatenation)
- Rate limiting on auth and RSVP endpoints

## Key Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Auth provider | Google only | Simplest for MVP, covers most users |
| RSVP without login | Yes | Reduces friction for respondents |
| Event URLs | Slug-based (`/e/:slug`) | Readable, shareable |
| State management | React Query + Context | Minimal boilerplate, good caching |
| CSS | Tailwind | Fast iteration, consistent design |
