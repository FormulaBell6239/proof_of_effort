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
router.get('/:userId/breakdown', (req, res) => {
  res.json({ message: `Get trust score breakdown for user ${req.params.userId}` });
});

// Get trust score history
router.get('/:userId/history', (req, res) => {
  res.json({ message: `Get trust score history for user ${req.params.userId}` });
});

// Recalculate trust score (admin or automated)
router.post('/:userId/recalculate', authenticate, (req, res) => {
  res.json({ message: `Recalculate trust score for user ${req.params.userId}` });
});

// Get leaderboard
router.get('/leaderboard/global', (_req, res) => {
  res.json({ message: 'Get global trust score leaderboard' });
});

// Get leaderboard by category
router.get('/leaderboard/:category', (req, res) => {
  res.json({ message: `Get leaderboard for category ${req.params.category}` });
});

export default router;
