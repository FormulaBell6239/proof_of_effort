import express from 'express';
import { query } from '../db/query';
import { DEFAULT_BADGES, seedDefaultBadges } from '../services/gamification/progression';
import { isDbUnavailableError } from '../db/errors';

const router = express.Router();

// NOTE: This is a simple MVP. Auth can be layered in later by replacing userId sourcing.
router.get('/health', async (_req, res) => {
  try {
    await seedDefaultBadges();
    res.json({ ok: true, dbOk: true });
  } catch (e) {
    if (isDbUnavailableError(e)) {
      res.json({ ok: true, dbOk: false, warning: 'Database unavailable; running in demo mode.' });
      return;
    }
    throw e;
  }
});

router.get('/me', async (req, res) => {
  const userId = (req.query.userId as string | undefined) ?? 'demo-user';

  try {
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
  } catch (e) {
    if (isDbUnavailableError(e)) {
      res.json({
        progress: {
          user_id: userId,
          xp: 0,
          level: 1,
          verified_streak_days: 0,
          last_verified_effort_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        badges: [],
        warning: 'Database unavailable; returning demo progress.'
      });
      return;
    }
    throw e;
  }
});

router.get('/badges', async (_req, res) => {
  try {
    await seedDefaultBadges();
    const badges = await query(
      `SELECT code, name, description, tier, metadata, created_at
       FROM badges
       ORDER BY created_at ASC`
    );
    res.json({ badges: badges.rows });
  } catch (e) {
    if (isDbUnavailableError(e)) {
      res.json({
        badges: DEFAULT_BADGES.map((b) => ({ ...b, metadata: null })),
        warning: 'Database unavailable; returning default badge catalog.'
      });
      return;
    }
    throw e;
  }
});

export default router;
