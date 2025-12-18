import { Pool } from 'pg';

let pool: Pool | null = null;

export function getPool(): Pool {
  if (pool) return pool;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not configured');
  }

  pool = new Pool({
    connectionString,
    // Managed providers often require SSL in production.
    ssl: process.env.PGSSLMODE === 'disable' ? false : process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  return pool;
}
