#!/usr/bin/env node
/**
 * Simple migration runner.
 * Usage: node scripts/migrate.js
 *
 * Reads all *.sql files from database/migrations/ in filename order,
 * tracks applied migrations in a `schema_migrations` table, and
 * runs only new ones.
 */

'use strict';

const path = require('path');
const fs = require('fs');
const { Client } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const MIGRATIONS_DIR = path.join(__dirname, '../database/migrations');

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    // Ensure migrations tracking table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename TEXT PRIMARY KEY,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Read applied migrations
    const { rows: applied } = await client.query('SELECT filename FROM schema_migrations');
    const appliedSet = new Set(applied.map((r) => r.filename));

    // Find pending migrations
    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    const pending = files.filter((f) => !appliedSet.has(f));
    if (pending.length === 0) {
      console.log('No pending migrations.');
      return;
    }

    for (const file of pending) {
      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
      console.log(`Applying migration: ${file}`);
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
        await client.query('COMMIT');
        console.log(`  ✓ ${file}`);
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`  ✗ ${file} failed:`, err.message);
        process.exit(1);
      }
    }

    console.log('All migrations applied.');
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('Migration runner error:', err);
  process.exit(1);
});
