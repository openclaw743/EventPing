import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import {
  createEvent,
  deleteEvent,
  getEventBySlug,
  listEvents,
  updateEvent,
} from '../services/eventService.js';

const router = Router();

// ---------------------------------------------------------------------------
// Validation schemas
// ---------------------------------------------------------------------------

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const timeRegex = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const createEventSchema = z.object({
  title: z.string().min(1).max(200),
  date: z.string().regex(dateRegex, 'date must be YYYY-MM-DD'),
  time: z.string().regex(timeRegex, 'time must be HH:MM'),
  description: z.string().max(5000).nullable().optional(),
});

const updateEventSchema = z
  .object({
    title: z.string().min(1).max(200).optional(),
    date: z.string().regex(dateRegex, 'date must be YYYY-MM-DD').optional(),
    time: z.string().regex(timeRegex, 'time must be HH:MM').optional(),
    description: z.string().max(5000).nullable().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: 'At least one field is required.' });

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function validationError(message: string) {
  return { error: { code: 'VALIDATION_ERROR', message } };
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

/**
 * GET /events
 * List the authenticated user's events with pagination.
 */
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const parsed = paginationSchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json(validationError(parsed.error.issues[0]?.message ?? 'Validation error.'));
    }

    const { page, limit } = parsed.data;
    const result = await listEvents(req.user!.id, page, limit);
    return res.json(result);
  } catch (err) {
    return next(err);
  }
});

/**
 * POST /events
 * Create a new event for the authenticated user. Returns 201 + EventResponse.
 */
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const parsed = createEventSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(validationError(parsed.error.issues[0]?.message ?? 'Validation error.'));
    }

    const event = await createEvent({ ...parsed.data, creatorId: req.user!.id });
    res.setHeader('Location', `/api/events/${event.slug}`);
    return res.status(201).json(event);
  } catch (err) {
    return next(err);
  }
});

/**
 * GET /events/:slug
 * Get a single event by slug (public endpoint).
 */
router.get('/:slug', async (req, res, next) => {
  try {
    const event = await getEventBySlug(req.params.slug);
    if (!event) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Resource not found.' } });
    }
    return res.json(event);
  } catch (err) {
    return next(err);
  }
});

/**
 * PUT /events/:slug
 * Update an event (creator only).
 */
router.put('/:slug', requireAuth, async (req, res, next) => {
  try {
    const parsed = updateEventSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(validationError(parsed.error.issues[0]?.message ?? 'Validation error.'));
    }

    const result = await updateEvent(req.params.slug, req.user!.id, parsed.data);
    if (result === null) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Resource not found.' } });
    }
    if (result === 'forbidden') {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'You do not have permission to perform this action.' } });
    }
    return res.json(result);
  } catch (err) {
    return next(err);
  }
});

/**
 * DELETE /events/:slug
 * Delete an event (creator only). Returns 204 on success.
 */
router.delete('/:slug', requireAuth, async (req, res, next) => {
  try {
    const result = await deleteEvent(req.params.slug, req.user!.id);
    if (result === 'not_found') {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Resource not found.' } });
    }
    if (result === 'forbidden') {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'You do not have permission to perform this action.' } });
    }
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
});

export default router;
