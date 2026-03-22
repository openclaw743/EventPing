import { pgTable, uuid, varchar, text, date, time, timestamp, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const users = pgTable('users', {
  id:        uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  googleId:  varchar('google_id', { length: 255 }).unique().notNull(),
  email:     varchar('email', { length: 255 }).unique().notNull(),
  name:      varchar('name', { length: 255 }).notNull(),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().default(sql`NOW()`),
});

export const events = pgTable('events', {
  id:          uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  slug:        varchar('slug', { length: 100 }).unique().notNull(),
  title:       varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  eventDate:   date('event_date').notNull(),
  eventTime:   time('event_time').notNull(),
  creatorId:   uuid('creator_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt:   timestamp('created_at', { withTimezone: true }).notNull().default(sql`NOW()`),
  updatedAt:   timestamp('updated_at', { withTimezone: true }).notNull().default(sql`NOW()`),
});

export const rsvps = pgTable(
  'rsvps',
  {
    id:        uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    eventId:   uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
    name:      varchar('name', { length: 255 }).notNull(),
    email:     varchar('email', { length: 255 }),
    status:    varchar('status', { length: 20 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().default(sql`NOW()`),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().default(sql`NOW()`),
  },
  (table) => ({
    statusCheck: check('chk_rsvps_status', sql`${table.status} IN ('yes', 'no', 'tentative')`),
  }),
);

export type User   = typeof users.$inferSelect;
export type Event  = typeof events.$inferSelect;
export type Rsvp   = typeof rsvps.$inferSelect;

export type NewUser  = typeof users.$inferInsert;
export type NewEvent = typeof events.$inferInsert;
export type NewRsvp  = typeof rsvps.$inferInsert;
