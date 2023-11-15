import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
	console.log('no database URL');
}

const client = postgres(process.env.DATABASE_URL as string, { max: 1, prepare: false });

export const db = drizzle(client);
