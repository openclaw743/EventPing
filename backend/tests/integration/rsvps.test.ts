/**
 * Integration tests — RSVPs routes
 *
 * POST /api/events/:slug/rsvps              → 201
 * POST /api/events/:slug/rsvps (duplicate)  → 409
 * GET  /api/events/:slug/rsvps              → paginated list
 * PUT  /api/events/:slug/rsvps/:id          → 200 updated status
 * PUT  /api/events/:slug/rsvps/:id (bad)    → 400 invalid status
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
import { createTestEvent, createTestUser } from './helpers.js';

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

describe('POST /api/events/:slug/rsvps', () => {
  it('creates an RSVP and returns 201', async () => {
    const user = await createTestUser(pool);
    const event = await createTestEvent(pool, user.id);

    const res = await request(app)
      .post(`/api/events/${event.slug}/rsvps`)
      .send({ name: 'Alice', email: 'alice@example.com', status: 'yes' });

    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({
      name: 'Alice',
      status: 'yes',
      email: 'alice@example.com',
    });
    expect(typeof res.body.data.id).toBe('string');
  });

  it('returns 409 for a duplicate email on the same event', async () => {
    const user = await createTestUser(pool);
    const event = await createTestEvent(pool, user.id);

    await request(app)
      .post(`/api/events/${event.slug}/rsvps`)
      .send({ name: 'Alice', email: 'alice@example.com', status: 'yes' });

    const res = await request(app)
      .post(`/api/events/${event.slug}/rsvps`)
      .send({ name: 'Alice Again', email: 'alice@example.com', status: 'no' });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('DUPLICATE_RSVP');
  });
});

describe('GET /api/events/:slug/rsvps', () => {
  it('returns a paginated list of RSVPs', async () => {
    const user = await createTestUser(pool);
    const event = await createTestEvent(pool, user.id);

    // Create 3 RSVPs (no email, so no duplicates possible)
    for (let i = 0; i < 3; i++) {
      await request(app)
        .post(`/api/events/${event.slug}/rsvps`)
        .send({ name: `Guest ${i}`, status: 'yes' });
    }

    const res = await request(app).get(`/api/events/${event.slug}/rsvps`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(3);
    expect(res.body.pagination).toMatchObject({ page: 1 });
  });
});

describe('PUT /api/events/:slug/rsvps/:id', () => {
  it('updates an RSVP status and returns 200', async () => {
    const user = await createTestUser(pool);
    const event = await createTestEvent(pool, user.id);

    const createRes = await request(app)
      .post(`/api/events/${event.slug}/rsvps`)
      .send({ name: 'Bob', email: 'bob@example.com', status: 'yes' });

    const rsvpId: string = createRes.body.data.id;

    const updateRes = await request(app)
      .put(`/api/events/${event.slug}/rsvps/${rsvpId}`)
      .send({ status: 'no' });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.status).toBe('no');
  });

  it('returns 400 for an invalid status value', async () => {
    const user = await createTestUser(pool);
    const event = await createTestEvent(pool, user.id);

    const createRes = await request(app)
      .post(`/api/events/${event.slug}/rsvps`)
      .send({ name: 'Charlie', status: 'yes' });

    const rsvpId: string = createRes.body.data.id;

    const res = await request(app)
      .put(`/api/events/${event.slug}/rsvps/${rsvpId}`)
      .send({ status: 'maybe' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});
