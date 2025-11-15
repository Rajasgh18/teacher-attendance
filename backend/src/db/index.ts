import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from '@/config';
import * as schema from './schema';

// Create postgres connection
const connectionString = config.database.url;

const client = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

// Create drizzle instance
export const db = drizzle(client, { schema });

// Export for use in models
export { schema };
export type Database = typeof db; 