-- Migration: 001_initial_schema
-- Created: 2026-04-26
-- Description: Initial database schema for Proof-of-Effort Network

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address VARCHAR(42) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    trust_score INTEGER DEFAULT 0,
    reputation_level INTEGER DEFAULT 1,
    total_efforts INTEGER DEFAULT 0,
    verified_efforts INTEGER DEFAULT 0,
    total_verifications INTEGER DEFAULT 0,
    verification_accuracy DECIMAL(5,2) DEFAULT 0,
    profile_data JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP
);

CREATE TABLE IF NOT EXISTS effort_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    effort_type VARCHAR(50) NOT NULL,
    estimated_hours DECIMAL(10,2),
    proof_ipfs_hash VARCHAR(100),
    proof_files TEXT[],
    location JSONB,
    verification_level VARCHAR(50) DEFAULT 'self_reported',
    verification_count INTEGER DEFAULT 0,
    points_earned INTEGER DEFAULT 10,
    blockchain_tx_hash VARCHAR(66),
    status VARCHAR(50) DEFAULT 'pending',
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    effort_id UUID NOT NULL REFERENCES effort_records(id) ON DELETE CASCADE,
    verifier_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    verification_type VARCHAR(50) DEFAULT 'peer_review',
    status VARCHAR(50) DEFAULT 'pending',
    confidence_score DECIMAL(5,2) DEFAULT 0,
    comments TEXT,
    is_fraudulent BOOLEAN DEFAULT false,
    fraud_indicators TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(effort_id, verifier_id)
);

CREATE TABLE IF NOT EXISTS trust_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    total_score INTEGER DEFAULT 0,
    effort_score INTEGER DEFAULT 0,
    verification_score INTEGER DEFAULT 0,
    consistency_score INTEGER DEFAULT 0,
    longevity_score INTEGER DEFAULT 0,
    peer_endorsement_score INTEGER DEFAULT 0,
    fraud_penalty INTEGER DEFAULT 0,
    score_history JSONB DEFAULT '[]',
    last_calculated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fraud_detection_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    effort_id UUID REFERENCES effort_records(id) ON DELETE SET NULL,
    detection_type VARCHAR(50) NOT NULL,
    risk_level VARCHAR(20) NOT NULL,
    indicators TEXT[],
    details JSONB,
    action_taken TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(256) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_progress (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    xp INTEGER NOT NULL DEFAULT 0,
    level INTEGER NOT NULL DEFAULT 1,
    verified_streak_days INTEGER NOT NULL DEFAULT 0,
    last_verified_effort_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(120) NOT NULL,
    description TEXT,
    tier VARCHAR(24) DEFAULT 'bronze',
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    awarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reason TEXT,
    UNIQUE(user_id, badge_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_efforts_user ON effort_records(user_id);
CREATE INDEX IF NOT EXISTS idx_efforts_status ON effort_records(status);
CREATE INDEX IF NOT EXISTS idx_efforts_category ON effort_records(category);
CREATE INDEX IF NOT EXISTS idx_efforts_created ON effort_records(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_verifications_effort ON verifications(effort_id);
CREATE INDEX IF NOT EXISTS idx_verifications_verifier ON verifications(verifier_id);
CREATE INDEX IF NOT EXISTS idx_trust_scores_user ON trust_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_trust_scores_total ON trust_scores(total_score DESC);
CREATE INDEX IF NOT EXISTS idx_fraud_logs_user ON fraud_detection_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_fraud_logs_effort ON fraud_detection_logs(effort_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge ON user_badges(badge_id);

-- Triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$ BEGIN
  CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER update_efforts_updated_at BEFORE UPDATE ON effort_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER update_verifications_updated_at BEFORE UPDATE ON verifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER update_trust_scores_updated_at BEFORE UPDATE ON trust_scores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
