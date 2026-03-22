/**
 * Integration tests — Auth routes
 *
 * GET  /api/auth/me  (no cookie)   → 401
 * GET  /api/auth/me  (valid JWT)   → returns user
 * POST /api/auth/logout            → clears cookie
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { Pool } from 'pg';
import {
  buildTestApp,
  createTables,
  createTestPool,
  dropTables,
  truncateTables,
} from './setup.js';
import { authCookie, createTestUser } from './helpers.js';

let pool: Pool;
const app = buildTestApp();

beforeAll(async () => {
  pool = createTestPool();
  await createTables(pool);
});

afterAll(async () => {
  await dropTables(pool);
  await pool.end();
});

beforeEach(async () => {
  await truncateTables(pool);
});

// ---------------------------------------------------------------------------

describe('GET /api/auth/me', () => {
  it('returns 401 when no cookie is present', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('returns the user when a valid JWT cookie is sent', async () => {
    const user = await createTestUser(pool);
    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', authCookie(user));

    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({
      email: user.email,
      name: user.name,
    });
  });
});

describe('POST /api/auth/logout', () => {
  it('responds 200 and clears the session cookie', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(200);

    // The Set-Cookie header should expire / clear the session cookie
    const setCookie = (res.headers['set-cookie'] as string[] | string | undefined) ?? [];
    const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
    const sessionCookie = cookies.find((c) => c.startsWith('eventping_session='));
    expect(sessionCookie).toBeDefined();
    // Max-Age=0 or Expires in the past signals clearing
    expect(sessionCookie).toMatch(/Max-Age=0|Expires=Thu, 01 Jan 1970/i);
  });
});
