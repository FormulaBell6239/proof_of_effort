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
    code: 'FIRST_VERIFICATION_GIVEN',
    name: 'Community Reviewer',
    description: 'You verified someone else\'s effort for the first time.',
    tier: 'bronze'
  },
  {
    code: 'SEVEN_DAY_STREAK',
    name: '7-Day Streak',
    description: 'Seven verified-effort days in a row.',
    tier: 'silver'
  },
  {
    code: 'TEN_VERIFICATIONS_GIVEN',
    name: 'Trusted Reviewer',
    description: 'Submitted 10 verifications for other users\' efforts.',
    tier: 'silver'
  },
  {
    code: 'XP_500',
    name: 'Gold Contributor',
    description: 'Accumulated 500 XP through verified efforts and community participation.',
    tier: 'gold'
  },
  {
    code: 'THIRTY_DAY_STREAK',
    name: 'Streak Legend',
    description: 'Maintained a 30-day verified-effort streak.',
    tier: 'gold'
  },
  {
    code: 'XP_2000',
    name: 'Platinum Contributor',
    description: 'Accumulated 2000 XP — a true pillar of the Proof of Effort community.',
    tier: 'platinum'
  },
  {
    code: 'HUNDRED_DAY_STREAK',
    name: 'Century Streak',
    description: '100 verified-effort days in a row. Legendary consistency.',
    tier: 'platinum'
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
    if (streak === 30) {
      await awardBadgeIfMissing(event.userId, 'THIRTY_DAY_STREAK', '30-day verified streak');
    }
    if (streak === 100) {
      await awardBadgeIfMissing(event.userId, 'HUNDRED_DAY_STREAK', '100-day verified streak');
    }
  }

  // XP milestone badges (check after every event).
  if (row.xp >= 500) {
    await awardBadgeIfMissing(event.userId, 'XP_500', '500 XP milestone');
  }
  if (row.xp >= 2000) {
    await awardBadgeIfMissing(event.userId, 'XP_2000', '2000 XP milestone');
  }

  // Verification-count badges.
  if (event.type === 'VERIFICATION_SUBMITTED') {
    const countRes = await query<{ cnt: string }>(
      `SELECT COUNT(*) AS cnt FROM verifications WHERE verifier_id = $1`,
      [event.userId]
    );
    const cnt = parseInt(countRes.rows[0]?.cnt ?? '0', 10);
    if (cnt === 1) {
      await awardBadgeIfMissing(event.userId, 'FIRST_VERIFICATION_GIVEN', 'First verification submitted');
    }
    if (cnt >= 10) {
      await awardBadgeIfMissing(event.userId, 'TEN_VERIFICATIONS_GIVEN', '10 verifications submitted');
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
