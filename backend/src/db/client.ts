import { drizzle } from 'drizzle-orm/node-postgres';
import pool from './index.js';

export const db = drizzle(pool);
