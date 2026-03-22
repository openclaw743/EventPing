import { and, count, desc, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import pool from '../db/index.js';
import { events, type Event, type NewEvent } from '../db/schema.js';
import { generateSlug as _generateSlug } from '../lib/slug.js';

const db = drizzle(pool);

// ---------------------------------------------------------------------------
// Re-export generateSlug so tests can import it from this module
// ---------------------------------------------------------------------------
export { generateSlug } from '../lib/slug.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface EventResponse {
  id: string;
  slug: string;
  title: string;
  date: string;
  time: string;
  description: string | null;
  creatorId: string;
  rsvpCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface EventListResponse {
  data: EventResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateEventInput {
  title: string;
  date: string;
  time: string;
  description?: string | null;
  creatorId: string;
}

export interface UpdateEventInput {
  title?: string;
  date?: string;
  time?: string;
  description?: string | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mapEvent(row: Event): EventResponse {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    date: row.eventDate,
    time: typeof row.eventTime === 'string' ? row.eventTime.slice(0, 5) : String(row.eventTime).slice(0, 5),
    description: row.description ?? null,
    creatorId: row.creatorId,
    rsvpCount: 0, // populated by separate query if needed; 0 default for CRUD responses
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

async function ensureUniqueSlug(title: string): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const slug = _generateSlug(title);
    const existing = await db.select({ id: events.id }).from(events).where(eq(events.slug, slug)).limit(1);
    if (existing.length === 0) return slug;
  }
  throw new Error('Failed to generate a unique slug after 10 attempts');
}

// ---------------------------------------------------------------------------
// Service functions
// ---------------------------------------------------------------------------

/** List events belonging to a creator with pagination. */
export async function listEvents(
  creatorId: string,
  page: number,
  limit: number,
): Promise<EventListResponse> {
  const offset = (page - 1) * limit;

  const [rows, totalRows] = await Promise.all([
    db
      .select()
      .from(events)
      .where(eq(events.creatorId, creatorId))
      .orderBy(desc(events.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ count: count(events.id) }).from(events).where(eq(events.creatorId, creatorId)),
  ]);

  const total = Number(totalRows[0]?.count ?? 0);

  return {
    data: rows.map(mapEvent),
    pagination: {
      page,
      limit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / limit),
    },
  };
}

/** Create a new event. Generates a unique slug from the title. */
export async function createEvent(input: CreateEventInput): Promise<EventResponse> {
  const slug = await ensureUniqueSlug(input.title);

  const values: NewEvent = {
    slug,
    title: input.title,
    eventDate: input.date,
    eventTime: input.time,
    description: input.description ?? null,
    creatorId: input.creatorId,
  };

  const [created] = await db.insert(events).values(values).returning();
  if (!created) throw new Error('Insert returned no rows');

  return mapEvent(created);
}

/** Fetch a single event by slug (public). Returns null if not found. */
export async function getEventBySlug(slug: string): Promise<EventResponse | null> {
  const [row] = await db.select().from(events).where(eq(events.slug, slug)).limit(1);
  return row ? mapEvent(row) : null;
}

/**
 * Update an event by slug.
 * Returns the updated event, null if not found, or 'forbidden' if wrong creator.
 */
export async function updateEvent(
  slug: string,
  creatorId: string,
  input: UpdateEventInput,
): Promise<EventResponse | null | 'forbidden'> {
  const [existing] = await db
    .select({ creatorId: events.creatorId })
    .from(events)
    .where(eq(events.slug, slug))
    .limit(1);

  if (!existing) return null;
  if (existing.creatorId !== creatorId) return 'forbidden';

  const [updated] = await db
    .update(events)
    .set({
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.date !== undefined ? { eventDate: input.date } : {}),
      ...(input.time !== undefined ? { eventTime: input.time } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      updatedAt: new Date(),
    })
    .where(eq(events.slug, slug))
    .returning();

  return updated ? mapEvent(updated) : null;
}

/**
 * Delete an event by slug.
 * Returns 'ok', 'not_found', or 'forbidden'.
 */
export async function deleteEvent(
  slug: string,
  creatorId: string,
): Promise<'ok' | 'not_found' | 'forbidden'> {
  const [existing] = await db
    .select({ creatorId: events.creatorId })
    .from(events)
    .where(eq(events.slug, slug))
    .limit(1);

  if (!existing) return 'not_found';
  if (existing.creatorId !== creatorId) return 'forbidden';

  await db.delete(events).where(and(eq(events.slug, slug), eq(events.creatorId, creatorId)));
  return 'ok';
}
