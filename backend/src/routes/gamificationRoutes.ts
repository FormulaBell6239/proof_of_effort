import express from 'express';
import { query } from '../db/query';
import { seedDefaultBadges } from '../services/gamification/progression';

const router = express.Router();

// NOTE: This is a simple MVP. Auth can be layered in later by replacing userId sourcing.
router.get('/health', async (_req, res) => {
  await seedDefaultBadges();
  res.json({ ok: true });
});

router.get('/me', async (req, res) => {
  const userId = (req.query.userId as string | undefined) ?? 'demo-user';

  const progress = await query(
    `SELECT user_id, xp, level, verified_streak_days, last_verified_effort_at, created_at, updated_at
     FROM user_progress
     WHERE user_id = $1`,
    [userId]
  );

  if (progress.rowCount === 0) {
    await query(`INSERT INTO user_progress (user_id) VALUES ($1) ON CONFLICT DO NOTHING`, [userId]);
  }

  const progress2 = await query(
    `SELECT user_id, xp, level, verified_streak_days, last_verified_effort_at, created_at, updated_at
     FROM user_progress
     WHERE user_id = $1`,
    [userId]
  );

  const badges = await query(
    `SELECT b.code, b.name, b.description, b.tier, ub.awarded_at, ub.reason
     FROM user_badges ub
     JOIN badges b ON b.id = ub.badge_id
     WHERE ub.user_id = $1
     ORDER BY ub.awarded_at DESC`,
    [userId]
  );

  res.json({ progress: progress2.rows[0], badges: badges.rows });
});

router.get('/badges', async (_req, res) => {
  await seedDefaultBadges();
  const badges = await query(
    `SELECT code, name, description, tier, metadata, created_at
     FROM badges
     ORDER BY created_at ASC`
  );
  res.json({ badges: badges.rows });
});

export default router;
