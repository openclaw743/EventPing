/**
 * Integration tests — Events routes
 *
 * POST   /api/events           (no auth)   → 401
 * POST   /api/events           (auth)      → 201 + event with slug
 * GET    /api/events/:slug                 → 200 (public)
 * GET    /api/events           (auth)      → 200 creator's events
 * PUT    /api/events/:slug     (creator)   → 200
 * PUT    /api/events/:slug     (other)     → 403
 * DELETE /api/events/:slug     (creator)   → 204
 * GET    /api/events/:slug     (deleted)   → 404
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
import { authCookie, createTestEvent, createTestUser } from './helpers.js';

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

const validPayload = {
  title: 'Integration Test Party',
  date: '2027-07-20',
  time: '19:00',
  description: 'A test event',
};

describe('POST /api/events', () => {
  it('returns 401 when not authenticated', async () => {
    const res = await request(app).post('/api/events').send(validPayload);
    expect(res.status).toBe(401);
  });

  it('returns 201 with an event including a slug when authenticated', async () => {
    const user = await createTestUser(pool);
    const res = await request(app)
      .post('/api/events')
      .set('Cookie', authCookie(user))
      .send(validPayload);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ title: validPayload.title });
    expect(typeof res.body.slug).toBe('string');
    expect(res.body.slug.length).toBeGreaterThan(0);
  });
});

describe('GET /api/events/:slug', () => {
  it('returns the event publicly (no auth needed)', async () => {
    const user = await createTestUser(pool);
    const event = await createTestEvent(pool, user.id);

    const res = await request(app).get(`/api/events/${event.slug}`);
    expect(res.status).toBe(200);
    expect(res.body.slug).toBe(event.slug);
  });

  it('returns 404 for a non-existent slug', async () => {
    const res = await request(app).get('/api/events/no-such-event-xyz');
    expect(res.status).toBe(404);
  });
});

describe('GET /api/events (authenticated list)', () => {
  it("returns only the authenticated user's events", async () => {
    const alice = await createTestUser(pool, { email: 'alice@example.com' });
    const bob = await createTestUser(pool, { email: 'bob@example.com' });

    await createTestEvent(pool, alice.id, { slug: 'alice-event' });
    await createTestEvent(pool, bob.id, { slug: 'bob-event' });

    const res = await request(app)
      .get('/api/events')
      .set('Cookie', authCookie(alice));

    expect(res.status).toBe(200);
    const slugs: string[] = (res.body.data ?? []).map((e: { slug: string }) => e.slug);
    expect(slugs).toContain('alice-event');
    expect(slugs).not.toContain('bob-event');
  });
});

describe('PUT /api/events/:slug', () => {
  it('returns 200 when the creator updates their event', async () => {
    const user = await createTestUser(pool);
    const event = await createTestEvent(pool, user.id);

    const res = await request(app)
      .put(`/api/events/${event.slug}`)
      .set('Cookie', authCookie(user))
      .send({ title: 'Updated Title' });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Updated Title');
  });

  it('returns 403 when a non-creator tries to update the event', async () => {
    const owner = await createTestUser(pool, { email: 'owner@example.com' });
    const other = await createTestUser(pool, { email: 'other@example.com' });
    const event = await createTestEvent(pool, owner.id);

    const res = await request(app)
      .put(`/api/events/${event.slug}`)
      .set('Cookie', authCookie(other))
      .send({ title: 'Hacked Title' });

    expect(res.status).toBe(403);
  });
});

describe('DELETE /api/events/:slug', () => {
  it('returns 204 and the event is gone afterwards', async () => {
    const user = await createTestUser(pool);
    const event = await createTestEvent(pool, user.id);

    const del = await request(app)
      .delete(`/api/events/${event.slug}`)
      .set('Cookie', authCookie(user));
    expect(del.status).toBe(204);

    const get = await request(app).get(`/api/events/${event.slug}`);
    expect(get.status).toBe(404);
  });
});
