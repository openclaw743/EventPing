-- EventPing Database Schema
-- PostgreSQL 15+
-- Migration strategy: Drizzle Kit (see docs below)

-- Enable pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- TABLE: users
-- ============================================================
CREATE TABLE users (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  google_id  VARCHAR(255) UNIQUE NOT NULL,
  email      VARCHAR(255) UNIQUE NOT NULL,
  name       VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: events
-- ============================================================
CREATE TABLE events (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        VARCHAR(100) UNIQUE NOT NULL,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  event_date  DATE         NOT NULL,
  event_time  TIME         NOT NULL,
  creator_id  UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: rsvps
-- ============================================================
CREATE TABLE rsvps (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id   UUID        NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name       VARCHAR(255) NOT NULL,
  email      VARCHAR(255),
  status     VARCHAR(20) NOT NULL CHECK (status IN ('yes', 'no', 'tentative')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_rsvp_event_email UNIQUE NULLS NOT DISTINCT (event_id, email)
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_events_slug    ON events(slug);
CREATE INDEX idx_events_creator ON events(creator_id);
CREATE INDEX idx_rsvps_event    ON rsvps(event_id);

-- ============================================================
-- MIGRATION STRATEGY
-- ============================================================
-- Tool: Drizzle Kit (https://orm.drizzle.team/docs/migrations)
--
-- Setup:
--   npm install drizzle-orm drizzle-kit pg
--
-- Workflow:
--   1. Define schema in TypeScript: backend/src/db/schema.ts
--   2. Generate migration:  npx drizzle-kit generate
--   3. Apply migration:     npx drizzle-kit migrate
--   4. Every migration produces a timestamped SQL file in
--      database/migrations/ with both up and rollback scripts.
--
-- Migration file naming convention:
--   database/migrations/0001_<short_description>.sql
--
-- Rollback strategy:
--   Each migration file includes a corresponding down script.
--   To roll back: apply the down section of the target migration.
--
-- Environments:
--   development  — local Docker PostgreSQL (see docker-compose.yml)
--   staging      — Azure Flexible Server (anonymized seed data)
--   production   — Azure Flexible Server (live data, manual promotion)
--
-- Seed data:
--   database/seeds/dev.sql  — development fixtures
