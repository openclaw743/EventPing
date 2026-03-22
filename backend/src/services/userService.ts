import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import pool from '../db/index';
import { users } from '../db/schema';

const db = drizzle(pool);

export interface UpsertUserParams {
  googleId: string;
  email: string;
  name: string;
  avatarUrl: string | null;
}

export async function upsertUser(params: UpsertUserParams) {
  const { googleId, email, name, avatarUrl } = params;

  const [user] = await db
    .insert(users)
    .values({ googleId, email, name, avatarUrl })
    .onConflictDoUpdate({
      target: users.googleId,
      set: { email, name, avatarUrl },
    })
    .returning();

  if (!user) {
    throw new Error('Failed to upsert user');
  }

  return user;
}

export async function findById(id: string) {
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return user ?? null;
}
