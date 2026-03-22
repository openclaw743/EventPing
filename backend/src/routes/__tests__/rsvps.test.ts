import { describe, it, expect, vi, beforeEach } from 'vitest';
import express, { Express } from 'express';
import request from 'supertest';

// Mock the DB client before importing routes
vi.mock('../../db/client', () => ({ db: {} }));

// Mock the rsvpService
vi.mock('../../services/rsvpService', () => ({
  listRsvps: vi.fn(),
  createRsvp: vi.fn(),
  updateRsvp: vi.fn(),
}));

import * as rsvpService from '../../services/rsvpService';
import rsvpRouter from '../rsvps';

function makeApp(): Express {
  const app = express();
  app.use(express.json());
  app.use('/api/events/:slug/rsvps', rsvpRouter);
  return app;
}

const mockRsvp = {
  id: 'aaaaaaaa-0000-0000-0000-000000000001',
  eventId: 'bbbbbbbb-0000-0000-0000-000000000001',
  name: 'Bob Jones',
  email: 'bob@example.com',
  status: 'yes',
  createdAt: new Date('2026-01-01T12:00:00Z'),
  updatedAt: new Date('2026-01-01T12:00:00Z'),
};

const mockPagination = { page: 1, limit: 20, total: 1, totalPages: 1 };

describe('GET /api/events/:slug/rsvps', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 200 with paginated data', async () => {
    vi.mocked(rsvpService.listRsvps).mockResolvedValue({
      data: [mockRsvp],
      pagination: mockPagination,
    });

    const res = await request(makeApp()).get('/api/events/my-event/rsvps');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].name).toBe('Bob Jones');
    expect(res.body.pagination).toMatchObject(mockPagination);
  });

  it('returns 404 when event not found', async () => {
    vi.mocked(rsvpService.listRsvps).mockResolvedValue(null);

    const res = await request(makeApp()).get('/api/events/no-event/rsvps');

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('returns 400 for invalid pagination', async () => {
    vi.mocked(rsvpService.listRsvps).mockResolvedValue(null);

    const res = await request(makeApp()).get('/api/events/my-event/rsvps?page=-1');

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('passes status filter through', async () => {
    vi.mocked(rsvpService.listRsvps).mockResolvedValue({ data: [], pagination: { ...mockPagination, total: 0, totalPages: 0 } });

    await request(makeApp()).get('/api/events/my-event/rsvps?status=yes');

    expect(rsvpService.listRsvps).toHaveBeenCalledWith(
      expect.anything(),
      'my-event',
      expect.objectContaining({ page: 1, limit: 20 }),
      'yes',
    );
  });
});

describe('POST /api/events/:slug/rsvps', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 201 with created RSVP', async () => {
    vi.mocked(rsvpService.createRsvp).mockResolvedValue({ rsvp: mockRsvp });

    const res = await request(makeApp())
      .post('/api/events/my-event/rsvps')
      .send({ name: 'Bob Jones', email: 'bob@example.com', status: 'yes' });

    expect(res.status).toBe(201);
    expect(res.body.data.id).toBe(mockRsvp.id);
    expect(res.headers.location).toBe(`/api/events/my-event/rsvps/${mockRsvp.id}`);
  });

  it('returns 400 when name is missing', async () => {
    const res = await request(makeApp())
      .post('/api/events/my-event/rsvps')
      .send({ status: 'yes' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when status is invalid', async () => {
    const res = await request(makeApp())
      .post('/api/events/my-event/rsvps')
      .send({ name: 'Bob', status: 'maybe' });

    expect(res.status).toBe(400);
  });

  it('returns 404 when event not found', async () => {
    vi.mocked(rsvpService.createRsvp).mockResolvedValue({ error: 'EVENT_NOT_FOUND' });

    const res = await request(makeApp())
      .post('/api/events/no-event/rsvps')
      .send({ name: 'Bob', status: 'yes' });

    expect(res.status).toBe(404);
  });

  it('returns 409 for duplicate email on same event', async () => {
    vi.mocked(rsvpService.createRsvp).mockResolvedValue({ error: 'DUPLICATE_RSVP' });

    const res = await request(makeApp())
      .post('/api/events/my-event/rsvps')
      .send({ name: 'Bob', email: 'bob@example.com', status: 'yes' });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('DUPLICATE_RSVP');
  });

  it('applies rate limiting after 10 requests', async () => {
    vi.mocked(rsvpService.createRsvp).mockResolvedValue({ rsvp: mockRsvp });

    const app = makeApp();
    // Make 11 requests from the same IP (loopback)
    const responses = await Promise.all(
      Array.from({ length: 11 }, () =>
        request(app).post('/api/events/my-event/rsvps').send({ name: 'Bob', status: 'yes' }),
      ),
    );

    const tooMany = responses.filter((r) => r.status === 429);
    expect(tooMany.length).toBeGreaterThanOrEqual(1);
  });
});

describe('PUT /api/events/:slug/rsvps/:id', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 200 with updated RSVP', async () => {
    const updated = { ...mockRsvp, status: 'no', updatedAt: new Date() };
    vi.mocked(rsvpService.updateRsvp).mockResolvedValue({ rsvp: updated });

    const res = await request(makeApp())
      .put(`/api/events/my-event/rsvps/${mockRsvp.id}`)
      .send({ status: 'no' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('no');
  });

  it('returns 400 for invalid status', async () => {
    const res = await request(makeApp())
      .put(`/api/events/my-event/rsvps/${mockRsvp.id}`)
      .send({ status: 'invalid' });

    expect(res.status).toBe(400);
  });

  it('returns 404 when RSVP not found', async () => {
    vi.mocked(rsvpService.updateRsvp).mockResolvedValue({ error: 'RSVP_NOT_FOUND' });

    const res = await request(makeApp())
      .put('/api/events/my-event/rsvps/nonexistent-id')
      .send({ status: 'no' });

    expect(res.status).toBe(404);
  });

  it('returns 404 when event not found', async () => {
    vi.mocked(rsvpService.updateRsvp).mockResolvedValue({ error: 'EVENT_NOT_FOUND' });

    const res = await request(makeApp())
      .put('/api/events/no-event/rsvps/some-id')
      .send({ status: 'tentative' });

    expect(res.status).toBe(404);
  });
});
