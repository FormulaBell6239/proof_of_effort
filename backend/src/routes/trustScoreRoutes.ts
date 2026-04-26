import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { query } from '../db/query';
import { AppError } from '../middleware/errorHandler';
import { calculateTrustScore } from '../services/trust/trustScore';

const router = Router();

// Get user's trust score
router.get('/:userId', async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const user = await query<{
      id: string;
      trust_score: number;
      total_efforts: number;
      verified_efforts: number;
      verification_accuracy: number;
    }>(
      `SELECT id, trust_score, total_efforts, verified_efforts, verification_accuracy
       FROM users
       WHERE id = $1`,
      [userId]
    );

    if (!user.rows[0]) throw new AppError('User not found', 404);

    const computed = calculateTrustScore({
      totalEfforts: user.rows[0].total_efforts ?? 0,
      verifiedEfforts: user.rows[0].verified_efforts ?? 0,
      verificationAccuracy: Number(user.rows[0].verification_accuracy ?? 0),
      fraudPenalty: 0
    });

    res.json({
      success: true,
      data: {
        userId,
        computed
      }
    });
  } catch (err) {
    next(err);
  }
});

// Get trust score breakdown
router.get('/:userId/breakdown', async (req, res, next) => {
  try {
    const result = await query(
      `SELECT id, trust_score, total_efforts, verified_efforts,
              total_verifications, verification_accuracy
       FROM users WHERE id = $1`,
      [req.params.userId]
    );
    if (!result.rows[0]) throw new AppError('User not found', 404);
    const u = result.rows[0];
    const computed = calculateTrustScore({
      totalEfforts: u.total_efforts ?? 0,
      verifiedEfforts: u.verified_efforts ?? 0,
      verificationAccuracy: Number(u.verification_accuracy ?? 0),
      fraudPenalty: 0,
    });
    res.json({ success: true, data: { userId: req.params.userId, breakdown: computed } });
  } catch (err) { next(err); }
});

// Get trust score history
router.get('/:userId/history', async (req, res, next) => {
  try {
    const result = await query(
      `SELECT total_score AS score, last_calculated AS calculated_at FROM trust_scores
       WHERE user_id = $1
       ORDER BY last_calculated DESC
       LIMIT 30`,
      [req.params.userId]
    );
    res.json({ success: true, data: { history: result.rows } });
  } catch (err) { next(err); }
});

// Recalculate trust score (owner or admin)
router.post('/:userId/recalculate', authenticate, async (req, res, next) => {
  try {
    const result = await query(
      `SELECT id, total_efforts, verified_efforts, verification_accuracy
       FROM users WHERE id = $1`,
      [req.params.userId]
    );
    if (!result.rows[0]) throw new AppError('User not found', 404);
    const u = result.rows[0];
    const computed = calculateTrustScore({
      totalEfforts: u.total_efforts ?? 0,
      verifiedEfforts: u.verified_efforts ?? 0,
      verificationAccuracy: Number(u.verification_accuracy ?? 0),
      fraudPenalty: 0,
    });
    await query(
      `UPDATE users SET trust_score = $1, updated_at = NOW() WHERE id = $2`,
      [computed.totalScore, req.params.userId]
    );
    res.json({ success: true, data: { userId: req.params.userId, score: computed } });
  } catch (err) { next(err); }
});

// Global leaderboard — must be defined before /:userId to avoid route collision
router.get('/leaderboard/global', async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit ?? 20), 100);
    const result = await query(
      `SELECT id, username, wallet_address, trust_score, verified_efforts, reputation_level
       FROM users
       WHERE is_active = true
       ORDER BY trust_score DESC
       LIMIT $1`,
      [limit]
    );
    res.json({ success: true, data: { leaderboard: result.rows } });
  } catch (err) { next(err); }
});

// Leaderboard by category
router.get('/leaderboard/:category', async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit ?? 20), 100);
    const result = await query(
      `SELECT u.id, u.username, u.wallet_address, u.trust_score, u.verified_efforts,
              COUNT(er.id) AS category_efforts
       FROM users u
       JOIN effort_records er ON er.user_id = u.id AND er.category = $1 AND er.status = 'verified'
       WHERE u.is_active = true
       GROUP BY u.id
       ORDER BY category_efforts DESC, u.trust_score DESC
       LIMIT $2`,
      [req.params.category, limit]
    );
    res.json({ success: true, data: { leaderboard: result.rows } });
  } catch (err) { next(err); }
});

export default router;
