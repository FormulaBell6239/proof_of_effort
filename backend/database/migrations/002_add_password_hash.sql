-- Migration: 002_add_password_hash
-- Created: 2026-04-26
-- Description: Add password_hash column to users for email/password auth

ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
