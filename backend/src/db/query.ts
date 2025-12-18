import type { QueryResultRow } from 'pg';
import { getPool } from './pool';

export async function query<T extends QueryResultRow = any>(text: string, params?: any[]) {
  const pool = getPool();
  return pool.query<T>(text, params);
}
