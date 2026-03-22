import { and, asc, count, eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { events, rsvps } from '../db/schema.js';
import type { NewRsvp, Rsvp } from '../db/schema.js';

export type RsvpStatus = 'yes' | 'no' | 'tentative';

export interface ListRsvpsResult {
  data: Rsvp[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface CreateRsvpInput { name: string; email?: string | null; status: RsvpStatus }
export interface UpdateRsvpInput { status: RsvpStatus }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = NodePgDatabase<any>;

export async function listRsvps(
  db: Db, slug: string, opts: { page: number; limit: number }, statusFilter?: RsvpStatus,
): Promise<ListRsvpsResult | null> {
  const eventRow = await db.select({ id: events.id }).from(events).where(eq(events.slug, slug)).limit(1);
  if (!eventRow[0]) return null;

  const conditions = [eq(rsvps.eventId, eventRow[0].id)];
  if (statusFilter) conditions.push(eq(rsvps.status, statusFilter));
  const where = and(...conditions);

  const totalResult = await db.select({ total: count() }).from(rsvps).where(where);
  const total = Number(totalResult[0]?.total ?? 0);
  const offset = (opts.page - 1) * opts.limit;
  const data = await db.select().from(rsvps).where(where).orderBy(asc(rsvps.createdAt)).limit(opts.limit).offset(offset);

  return { data, pagination: { page: opts.page, limit: opts.limit, total, totalPages: total === 0 ? 0 : Math.ceil(total / opts.limit) } };
}

export async function createRsvp(
  db: Db, slug: string, input: CreateRsvpInput,
): Promise<{ rsvp: Rsvp } | { error: 'EVENT_NOT_FOUND' | 'DUPLICATE_RSVP' }> {
  const eventRow = await db.select({ id: events.id }).from(events).where(eq(events.slug, slug)).limit(1);
  if (!eventRow[0]) return { error: 'EVENT_NOT_FOUND' };

  if (input.email) {
    const dup = await db.select({ id: rsvps.id }).from(rsvps)
      .where(and(eq(rsvps.eventId, eventRow[0].id), eq(rsvps.email, input.email))).limit(1);
    if (dup[0]) return { error: 'DUPLICATE_RSVP' };
  }

  const values: NewRsvp = { eventId: eventRow[0].id, name: input.name, email: input.email ?? null, status: input.status };
  const result = await db.insert(rsvps).values(values).returning();
  return { rsvp: result[0] };
}

export async function updateRsvp(
  db: Db, slug: string, rsvpId: string, input: UpdateRsvpInput,
): Promise<{ rsvp: Rsvp } | { error: 'EVENT_NOT_FOUND' | 'RSVP_NOT_FOUND' }> {
  const eventRow = await db.select({ id: events.id }).from(events).where(eq(events.slug, slug)).limit(1);
  if (!eventRow[0]) return { error: 'EVENT_NOT_FOUND' };

  const result = await db.update(rsvps)
    .set({ status: input.status, updatedAt: new Date() })
    .where(and(eq(rsvps.id, rsvpId), eq(rsvps.eventId, eventRow[0].id)))
    .returning();

  if (!result[0]) return { error: 'RSVP_NOT_FOUND' };
  return { rsvp: result[0] };
}
