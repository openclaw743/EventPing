/**
 * Integration test helpers — create users, sign JWTs, create events.
 */
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';

const COOKIE_NAME = 'eventping_session';
const JWT_SECRET = process.env.JWT_SECRET ?? 'integration-test-secret-32-chars!!';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface TestUser {
  id: string;
  googleId: string;
  email: string;
  name: string;
}

export interface TestEvent {
  id: string;
  slug: string;
  title: string;
}

// ---------------------------------------------------------------------------
// User helpers
// ---------------------------------------------------------------------------
export async function createTestUser(
  pool: Pool,
  overrides: Partial<{ email: string; name: string; googleId: string }> = {},
): Promise<TestUser> {
  const unique = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const email = overrides.email ?? `test-${unique}@example.com`;
  const name = overrides.name ?? `Test User ${unique}`;
  const googleId = overrides.googleId ?? `google-${unique}`;

  const { rows } = await pool.query<TestUser>(
    `INSERT INTO users (google_id, email, name)
     VALUES ($1, $2, $3)
     RETURNING id, google_id AS "googleId", email, name`,
    [googleId, email, name],
  );
  return rows[0]!;
}

// ---------------------------------------------------------------------------
// JWT helpers
// ---------------------------------------------------------------------------
export function signJwt(user: TestUser): string {
  return jwt.sign(
    { sub: user.id, email: user.email, name: user.name, avatarUrl: null },
    JWT_SECRET,
    { expiresIn: '1h' },
  );
}

/**
 * Returns a `Cookie` header string suitable for supertest `.set('Cookie', ...)`.
 */
export function authCookie(user: TestUser): string {
  return `${COOKIE_NAME}=${signJwt(user)}`;
}

// ---------------------------------------------------------------------------
// Event helpers
// ---------------------------------------------------------------------------
export async function createTestEvent(
  pool: Pool,
  creatorId: string,
  overrides: Partial<{ title: string; slug: string; date: string; time: string }> = {},
): Promise<TestEvent> {
  const unique = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const title = overrides.title ?? `Test Event ${unique}`;
  const slug = overrides.slug ?? `test-event-${unique}`;
  const date = overrides.date ?? '2027-06-15';
  const time = overrides.time ?? '18:00';

  const { rows } = await pool.query<TestEvent>(
    `INSERT INTO events (slug, title, event_date, event_time, creator_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, slug, title`,
    [slug, title, date, time, creatorId],
  );
  return rows[0]!;
}
