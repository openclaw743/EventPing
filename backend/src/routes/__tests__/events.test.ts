import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';

// ---------------------------------------------------------------------------
// Mock the service layer so tests don't need a real DB
// ---------------------------------------------------------------------------
vi.mock('../../services/eventService.js', () => ({
  listEvents: vi.fn(),
  createEvent: vi.fn(),
  getEventBySlug: vi.fn(),
  updateEvent: vi.fn(),
  deleteEvent: vi.fn(),
}));

// Mock auth middleware — injects req.user when header x-test-auth is set
vi.mock('../../middleware/auth.js', () => ({
  requireAuth: (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.headers['x-test-auth']) {
      (req as express.Request & { user: unknown }).user = { id: 'user-1', email: 'alice@example.com', name: 'Alice' };
      next();
    } else {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required.' } });
    }
  },
}));

import eventsRouter from '../events.js';
import * as eventService from '../../services/eventService.js';
import { generateSlug } from '../../services/eventService.js';

// ---------------------------------------------------------------------------
// Test app setup
// ---------------------------------------------------------------------------
function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/events', eventsRouter);
  return app;
}

const MOCK_EVENT = {
  id: 'evt-uuid-1',
  slug: 'test-party-x7k2',
  title: 'Test Party',
  date: '2026-06-15',
  time: '18:30',
  description: null,
  creatorId: 'user-1',
  rsvpCount: 0,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

// ---------------------------------------------------------------------------
// generateSlug unit tests
// ---------------------------------------------------------------------------
describe('generateSlug', () => {
  it('lowercases the title', () => {
    const slug = generateSlug('Hello World');
    expect(slug).toMatch(/^hello-world-[a-z0-9]{4}$/);
  });

  it('strips special characters', () => {
    const slug = generateSlug("Alice's Birthday!");
    expect(slug).toMatch(/^alices-birthday-[a-z0-9]{4}$/);
  });

  it('replaces multiple spaces with single hyphen', () => {
    const slug = generateSlug('A   B');
    expect(slug).toMatch(/^a-b-[a-z0-9]{4}$/);
  });

  it('appends a 4-char suffix', () => {
    const slug = generateSlug('party');
    const parts = slug.split('-');
    expect(parts[parts.length - 1]).toHaveLength(4);
  });
});

// ---------------------------------------------------------------------------
// GET /api/events
// ---------------------------------------------------------------------------
describe('GET /api/events', () => {
  const app = buildApp();

  it('returns 401 when not authenticated', async () => {
    const res = await request(app).get('/api/events');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('returns paginated events list', async () => {
    vi.mocked(eventService.listEvents).mockResolvedValue({
      data: [MOCK_EVENT],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    });

    const res = await request(app)
      .get('/api/events')
      .set('x-test-auth', '1');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination.total).toBe(1);
    expect(eventService.listEvents).toHaveBeenCalledWith('user-1', 1, 20);
  });

  it('passes page and limit query params', async () => {
    vi.mocked(eventService.listEvents).mockResolvedValue({
      data: [],
      pagination: { page: 2, limit: 5, total: 0, totalPages: 0 },
    });

    await request(app)
      .get('/api/events?page=2&limit=5')
      .set('x-test-auth', '1');

    expect(eventService.listEvents).toHaveBeenCalledWith('user-1', 2, 5);
  });
});

// ---------------------------------------------------------------------------
// POST /api/events
// ---------------------------------------------------------------------------
describe('POST /api/events', () => {
  const app = buildApp();

  it('returns 401 when not authenticated', async () => {
    const res = await request(app).post('/api/events').send({ title: 'T', date: '2026-06-15', time: '18:00' });
    expect(res.status).toBe(401);
  });

  it('returns 400 when title is missing', async () => {
    const res = await request(app)
      .post('/api/events')
      .set('x-test-auth', '1')
      .send({ date: '2026-06-15', time: '18:00' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when date format is wrong', async () => {
    const res = await request(app)
      .post('/api/events')
      .set('x-test-auth', '1')
      .send({ title: 'Party', date: '15-06-2026', time: '18:00' });
    expect(res.status).toBe(400);
  });

  it('returns 400 when time format is wrong', async () => {
    const res = await request(app)
      .post('/api/events')
      .set('x-test-auth', '1')
      .send({ title: 'Party', date: '2026-06-15', time: '6pm' });
    expect(res.status).toBe(400);
  });

  it('returns 400 when title exceeds 200 chars', async () => {
    const res = await request(app)
      .post('/api/events')
      .set('x-test-auth', '1')
      .send({ title: 'a'.repeat(201), date: '2026-06-15', time: '18:00' });
    expect(res.status).toBe(400);
  });

  it('returns 400 when description exceeds 5000 chars', async () => {
    const res = await request(app)
      .post('/api/events')
      .set('x-test-auth', '1')
      .send({ title: 'Party', date: '2026-06-15', time: '18:00', description: 'x'.repeat(5001) });
    expect(res.status).toBe(400);
  });

  it('creates an event and returns 201', async () => {
    vi.mocked(eventService.createEvent).mockResolvedValue(MOCK_EVENT);

    const res = await request(app)
      .post('/api/events')
      .set('x-test-auth', '1')
      .send({ title: 'Test Party', date: '2026-06-15', time: '18:30' });

    expect(res.status).toBe(201);
    expect(res.body.slug).toBe('test-party-x7k2');
    expect(eventService.createEvent).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Test Party', creatorId: 'user-1' }),
    );
  });
});

// ---------------------------------------------------------------------------
// GET /api/events/:slug
// ---------------------------------------------------------------------------
describe('GET /api/events/:slug', () => {
  const app = buildApp();

  it('returns 404 when event not found', async () => {
    vi.mocked(eventService.getEventBySlug).mockResolvedValue(null);
    const res = await request(app).get('/api/events/not-found-slug');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('returns event without auth (public)', async () => {
    vi.mocked(eventService.getEventBySlug).mockResolvedValue(MOCK_EVENT);
    const res = await request(app).get('/api/events/test-party-x7k2');
    expect(res.status).toBe(200);
    expect(res.body.slug).toBe('test-party-x7k2');
  });
});

// ---------------------------------------------------------------------------
// PUT /api/events/:slug
// ---------------------------------------------------------------------------
describe('PUT /api/events/:slug', () => {
  const app = buildApp();

  it('returns 401 when not authenticated', async () => {
    const res = await request(app).put('/api/events/test-party-x7k2').send({ title: 'New' });
    expect(res.status).toBe(401);
  });

  it('returns 400 when body is empty', async () => {
    const res = await request(app)
      .put('/api/events/test-party-x7k2')
      .set('x-test-auth', '1')
      .send({});
    expect(res.status).toBe(400);
  });

  it('returns 404 when event not found', async () => {
    vi.mocked(eventService.updateEvent).mockResolvedValue(null);
    const res = await request(app)
      .put('/api/events/no-slug')
      .set('x-test-auth', '1')
      .send({ title: 'New Title' });
    expect(res.status).toBe(404);
  });

  it('returns 403 when not creator', async () => {
    vi.mocked(eventService.updateEvent).mockResolvedValue('forbidden');
    const res = await request(app)
      .put('/api/events/test-party-x7k2')
      .set('x-test-auth', '1')
      .send({ title: 'New Title' });
    expect(res.status).toBe(403);
  });

  it('updates event successfully', async () => {
    const updated = { ...MOCK_EVENT, title: 'New Title' };
    vi.mocked(eventService.updateEvent).mockResolvedValue(updated);

    const res = await request(app)
      .put('/api/events/test-party-x7k2')
      .set('x-test-auth', '1')
      .send({ title: 'New Title' });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('New Title');
  });
});

// ---------------------------------------------------------------------------
// DELETE /api/events/:slug
// ---------------------------------------------------------------------------
describe('DELETE /api/events/:slug', () => {
  const app = buildApp();

  it('returns 401 when not authenticated', async () => {
    const res = await request(app).delete('/api/events/test-party-x7k2');
    expect(res.status).toBe(401);
  });

  it('returns 404 when event not found', async () => {
    vi.mocked(eventService.deleteEvent).mockResolvedValue('not_found');
    const res = await request(app)
      .delete('/api/events/no-slug')
      .set('x-test-auth', '1');
    expect(res.status).toBe(404);
  });

  it('returns 403 when not creator', async () => {
    vi.mocked(eventService.deleteEvent).mockResolvedValue('forbidden');
    const res = await request(app)
      .delete('/api/events/test-party-x7k2')
      .set('x-test-auth', '1');
    expect(res.status).toBe(403);
  });

  it('deletes event and returns 204', async () => {
    vi.mocked(eventService.deleteEvent).mockResolvedValue('ok');
    const res = await request(app)
      .delete('/api/events/test-party-x7k2')
      .set('x-test-auth', '1');
    expect(res.status).toBe(204);
  });
});
