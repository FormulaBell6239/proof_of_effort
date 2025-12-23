import { query } from '../../db/query';
import { AppError } from '../../middleware/errorHandler';
import type { RiskAssessment } from '../riskScoring';

export const DEFAULT_BADGES: Array<{
  code: string;
  name: string;
  description: string;
  tier: string;
}> = [
  {
    code: 'FIRST_VERIFIED_EFFORT',
    name: 'First Verified Effort',
    description: 'Your first effort was verified by the community.',
    tier: 'bronze'
  },
  {
    code: 'SEVEN_DAY_STREAK',
    name: '7-Day Streak',
    description: 'Seven verified-effort days in a row.',
    tier: 'silver'
  }
];

export type GamificationEvent =
  | {
      type: 'EFFORT_SUBMITTED';
      userId: string;
      effortId: string;
      estimatedHours?: number | null;
      risk?: RiskAssessment;
      occurredAt?: Date;
    }
  | {
      type: 'EFFORT_VERIFIED';
      userId: string; // effort owner
      effortId: string;
      estimatedHours?: number | null;
      risk?: RiskAssessment;
      occurredAt?: Date;
    }
  | {
      type: 'VERIFICATION_SUBMITTED';
      userId: string; // verifier
      effortId: string;
      occurredAt?: Date;
    };

export function levelFromXp(xp: number): number {
  // Level curve: floor(sqrt(xp/100)) + 1
  if (!Number.isFinite(xp) || xp < 0) return 1;
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

export function computeXpDelta(event: GamificationEvent): number {
  switch (event.type) {
    case 'EFFORT_SUBMITTED':
      return 5;

    case 'VERIFICATION_SUBMITTED':
      return 15;

    case 'EFFORT_VERIFIED': {
      const hours = Math.max(0, Math.min(Number(event.estimatedHours ?? 0), 8));
      const base = 50 + Math.round(hours * 10);

      const level = event.risk?.level;
      const multiplier = level === 'high' || level === 'critical' ? 0.5 : 1;
      return Math.max(0, Math.round(base * multiplier));
    }

    default:
      return 0;
  }
}

async function ensureProgressRow(userId: string) {
  await query(
    `INSERT INTO user_progress (user_id)
     VALUES ($1)
     ON CONFLICT (user_id) DO NOTHING`,
    [userId]
  );
}

export async function applyGamificationEvent(event: GamificationEvent) {
  const occurredAt = event.occurredAt ?? new Date();
  await ensureProgressRow(event.userId);

  const xpDelta = computeXpDelta(event);

  const updated = await query<{ xp: number; level: number; verified_streak_days: number }>(
    `UPDATE user_progress
     SET xp = xp + $2,
         level = GREATEST(1, FLOOR(SQRT((xp + $2) / 100.0))::int + 1),
         updated_at = CURRENT_TIMESTAMP
     WHERE user_id = $1
     RETURNING xp, level, verified_streak_days`,
    [event.userId, xpDelta]
  );

  const row = updated.rows[0];
  if (!row) throw new AppError('Failed to update user progression', 500);

  // Verified streak update only on verified events.
  if (event.type === 'EFFORT_VERIFIED') {
    const streakRes = await query<{ verified_streak_days: number }>(
      `UPDATE user_progress
       SET verified_streak_days = CASE
             WHEN last_verified_effort_at IS NULL THEN 1
             WHEN ($2::timestamp - last_verified_effort_at) <= INTERVAL '36 hours' THEN verified_streak_days + 1
             ELSE 1
           END,
           last_verified_effort_at = $2
       WHERE user_id = $1
       RETURNING verified_streak_days`,
      [event.userId, occurredAt]
    );

    const streak = streakRes.rows[0]?.verified_streak_days;

    // Lightweight badge triggers.
    if (streak === 1) {
      await awardBadgeIfMissing(event.userId, 'FIRST_VERIFIED_EFFORT', 'First verified effort');
    }
    if (streak === 7) {
      await awardBadgeIfMissing(event.userId, 'SEVEN_DAY_STREAK', '7-day verified streak');
    }
  }

  return { xpDelta, xp: row.xp, level: row.level };
}

export async function seedDefaultBadges() {
  for (const b of DEFAULT_BADGES) {
    await query(
      `INSERT INTO badges (code, name, description, tier)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (code) DO NOTHING`,
      [b.code, b.name, b.description, b.tier]
    );
  }
}

export async function awardBadgeIfMissing(userId: string, badgeCode: string, reason?: string) {
  // Ensure badge exists.
  const badge = await query<{ id: string }>(`SELECT id FROM badges WHERE code = $1`, [badgeCode]);
  const badgeId = badge.rows[0]?.id;
  if (!badgeId) {
    // In case seed hasn't been run.
    await seedDefaultBadges();
  }

  const badge2 = await query<{ id: string }>(`SELECT id FROM badges WHERE code = $1`, [badgeCode]);
  const resolvedId = badge2.rows[0]?.id;
  if (!resolvedId) return;

  await query(
    `INSERT INTO user_badges (user_id, badge_id, reason)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, badge_id) DO NOTHING`,
    [userId, resolvedId, reason ?? null]
  );
}
