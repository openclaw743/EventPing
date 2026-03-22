/**
 * Integration test setup — creates a fresh Express app backed by a real test DB.
 *
 * Requires DATABASE_URL to point to a test PostgreSQL database.
 * Tables are created before the suite and dropped after.
 */
import cookieParser from 'cookie-parser';
import express from 'express';
import { Pool } from 'pg';
import { errorHandler } from '../../src/middleware/errorHandler.js';
import { authRouter } from '../../src/routes/auth.js';
import eventsRouter from '../../src/routes/events.js';
import rsvpsRouter from '../../src/routes/rsvps.js';

// ---------------------------------------------------------------------------
// Environment defaults for tests
// ---------------------------------------------------------------------------
process.env.JWT_SECRET ??= 'integration-test-secret-32-chars!!';
process.env.NODE_ENV = 'test';

// ---------------------------------------------------------------------------
// Shared DB pool (created once, torn down in afterAll)
// ---------------------------------------------------------------------------
export function createTestPool(): Pool {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is required for integration tests');
  return new Pool({ connectionString: url });
}

// ---------------------------------------------------------------------------
// DDL helpers
// ---------------------------------------------------------------------------
export async function createTables(pool: Pool): Promise<void> {
  await pool.query(`
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";

    CREATE TABLE IF NOT EXISTS users (
      id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      google_id   VARCHAR(255) UNIQUE NOT NULL,
      email       VARCHAR(255) UNIQUE NOT NULL,
      name        VARCHAR(255) NOT NULL,
      avatar_url  TEXT,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS events (
      id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      slug        VARCHAR(100) UNIQUE NOT NULL,
      title       VARCHAR(255) NOT NULL,
      description TEXT,
      event_date  DATE NOT NULL,
      event_time  TIME NOT NULL,
      creator_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS rsvps (
      id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      event_id   UUID        NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      name       VARCHAR(255) NOT NULL,
      email      VARCHAR(255),
      status     VARCHAR(20) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT chk_rsvps_status CHECK (status IN ('yes', 'no', 'tentative'))
    );
  `);
}

export async function dropTables(pool: Pool): Promise<void> {
  await pool.query(`
    DROP TABLE IF EXISTS rsvps CASCADE;
    DROP TABLE IF EXISTS events CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
  `);
}

export async function truncateTables(pool: Pool): Promise<void> {
  await pool.query('TRUNCATE rsvps, events, users RESTART IDENTITY CASCADE');
}

// ---------------------------------------------------------------------------
// App factory — wires all real routes (no mocks)
// ---------------------------------------------------------------------------
export function buildTestApp() {
  const app = express();
  app.use(cookieParser());
  app.use(express.json());

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api/auth', authRouter);
  app.use('/api/events', eventsRouter);
  // Mount rsvps with mergeParams so :slug is visible
  app.use('/api/events/:slug/rsvps', rsvpsRouter);

  app.use(errorHandler);
  return app;
}
