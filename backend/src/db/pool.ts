import { Pool } from 'pg';

let pool: Pool | null = null;

export function getPool(): Pool {
  if (pool) return pool;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not configured');
  }

  const sslDisabled = process.env.PGSSLMODE === 'disable';
  const isProduction = process.env.NODE_ENV === 'production';

  pool = new Pool({
    connectionString,
    ssl: sslDisabled
      ? false
      : isProduction
      ? { rejectUnauthorized: true }   // enforce valid certs in production
      : false,
  });

  return pool;
}
