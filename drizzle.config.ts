import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' })
if (!process.env.DATABASE_URL) {
	throw new Error('DATABASE_URL is missing');
}

export default {
	schema: './db/schema/*',
	out: './db/migrations',
	driver: 'pg',
	verbose: true,
	dbCredentials: {
		connectionString: process.env.DATABASE_URL,
	},
} satisfies Config;
