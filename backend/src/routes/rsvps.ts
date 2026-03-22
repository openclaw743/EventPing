import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../db/client.js';
import { rsvpRateLimit } from '../middleware/rateLimit.js';
import { listRsvps, createRsvp, updateRsvp } from '../services/rsvpService.js';

const rsvpStatusSchema = z.enum(['yes', 'no', 'tentative']);

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: rsvpStatusSchema.optional(),
});

const createRsvpSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email().optional().nullable(),
  status: rsvpStatusSchema,
});

const updateRsvpSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  email: z.string().email().optional().nullable(),
  status: rsvpStatusSchema,
});

function toErrorMessage(error: z.ZodError): string {
  return error.issues.map((i) => i.message).join(', ');
}

function formatRsvp(rsvp: { id: string; eventId: string; name: string; email: string | null; status: string; createdAt: Date; updatedAt: Date }) {
  return { id: rsvp.id, eventId: rsvp.eventId, name: rsvp.name, email: rsvp.email, status: rsvp.status, createdAt: rsvp.createdAt.toISOString(), updatedAt: rsvp.updatedAt.toISOString() };
}

const router = Router({ mergeParams: true });

router.get('/', async (req: Request, res: Response) => {
  const queryResult = listQuerySchema.safeParse(req.query);
  if (!queryResult.success) {
    res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: toErrorMessage(queryResult.error) } });
    return;
  }
  const { page, limit, status } = queryResult.data;
  const result = await listRsvps(db, String(req.params.slug), { page, limit }, status);
  if (!result) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Event not found.' } });
    return;
  }
  res.status(200).json({ data: result.data.map(formatRsvp), pagination: result.pagination });
});

router.post('/', rsvpRateLimit, async (req: Request, res: Response) => {
  const bodyResult = createRsvpSchema.safeParse(req.body);
  if (!bodyResult.success) {
    res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: toErrorMessage(bodyResult.error) } });
    return;
  }
  const result = await createRsvp(db, String(req.params.slug), bodyResult.data);
  if ('error' in result) {
    if (result.error === 'EVENT_NOT_FOUND') {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Event not found.' } });
      return;
    }
    res.status(409).json({ error: { code: 'DUPLICATE_RSVP', message: 'An RSVP with this email already exists for this event.' } });
    return;
  }
  res.setHeader('Location', `/api/events/${String(req.params.slug)}/rsvps/${result.rsvp.id}`);
  res.status(201).json({ data: formatRsvp(result.rsvp) });
});

router.put('/:id', async (req: Request, res: Response) => {
  const bodyResult = updateRsvpSchema.safeParse(req.body);
  if (!bodyResult.success) {
    res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: toErrorMessage(bodyResult.error) } });
    return;
  }
  const result = await updateRsvp(db, String(req.params.slug), String(req.params.id), bodyResult.data);
  if ('error' in result) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: result.error === 'EVENT_NOT_FOUND' ? 'Event not found.' : 'RSVP not found.' } });
    return;
  }
  res.status(200).json({ data: formatRsvp(result.rsvp) });
});

export default router;
