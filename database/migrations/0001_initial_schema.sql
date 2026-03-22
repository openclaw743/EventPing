-- =============================================================
-- Migration: 0001_initial_schema
-- Created: 2026-03-22
-- Description: Initial schema — users, events, rsvps
-- =============================================================

-- ======================== UP ==================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- TABLE: users
CREATE TABLE users (
  id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  google_id  VARCHAR(255) UNIQUE NOT NULL,
  email      VARCHAR(255) UNIQUE NOT NULL,
  name       VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- TABLE: events
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

-- TABLE: rsvps
CREATE TABLE rsvps (
  id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id   UUID         NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name       VARCHAR(255) NOT NULL,
  email      VARCHAR(255),
  status     VARCHAR(20)  NOT NULL CHECK (status IN ('yes', 'no', 'tentative')),
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_rsvp_event_email UNIQUE NULLS NOT DISTINCT (event_id, email)
);

-- INDEXES
CREATE INDEX idx_events_slug    ON events(slug);
CREATE INDEX idx_events_creator ON events(creator_id);
CREATE INDEX idx_rsvps_event    ON rsvps(event_id);

-- ======================== DOWN ================================

-- DROP INDEXES
DROP INDEX IF EXISTS idx_rsvps_event;
DROP INDEX IF EXISTS idx_events_creator;
DROP INDEX IF EXISTS idx_events_slug;

-- DROP TABLES (reverse dependency order)
DROP TABLE IF EXISTS rsvps;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS users;
