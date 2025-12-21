import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import type { AuthRequest } from '../middleware/auth';
import { query } from '../db/query';
import { AppError } from '../middleware/errorHandler';
import { assessEffortRisk } from '../services/riskScoring';
import { applyGamificationEvent } from '../services/gamification/progression';

const router = Router();

// Submit verification for an effort
router.post('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const {
      effort_id,
      status,
      verification_type,
      confidence_score,
      comments,
      is_fraudulent,
      fraud_indicators
    } = req.body ?? {};

    if (!req.walletAddress) throw new AppError('Missing wallet address in auth context', 401);
    if (!effort_id || typeof effort_id !== 'string') throw new AppError('effort_id is required', 400);
    if (!status || typeof status !== 'string') throw new AppError('status is required', 400);

    const normalizedStatus = status.toLowerCase();
    if (!['approved', 'rejected', 'needs_more_info', 'pending'].includes(normalizedStatus)) {
      throw new AppError('Invalid status', 400);
    }

    const verifierResult = await query<{ id: string }>(
      `INSERT INTO users (wallet_address, username)
       VALUES ($1, $2)
       ON CONFLICT (wallet_address) DO UPDATE SET wallet_address = EXCLUDED.wallet_address
       RETURNING id`,
      [req.walletAddress, `user_${req.walletAddress.slice(2, 8)}`]
    );
    const verifierId = verifierResult.rows[0]?.id;
    if (!verifierId) throw new AppError('Failed to resolve verifier', 500);

    const effortRes = await query<{ user_id: string; status: string }>(
      `SELECT user_id, status FROM effort_records WHERE id = $1`,
      [effort_id]
    );
    const effort = effortRes.rows[0];
    if (!effort) throw new AppError('Effort not found', 404);

    // Create or update the verification row
    const inserted = await query(
      `INSERT INTO verifications
        (effort_id, verifier_id, verification_type, status, confidence_score, comments, is_fraudulent, fraud_indicators)
       VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (effort_id, verifier_id) DO UPDATE SET
         verification_type = EXCLUDED.verification_type,
         status = EXCLUDED.status,
         confidence_score = EXCLUDED.confidence_score,
         comments = EXCLUDED.comments,
         is_fraudulent = EXCLUDED.is_fraudulent,
         fraud_indicators = EXCLUDED.fraud_indicators
       RETURNING *`,
      [
        effort_id,
        verifierId,
        typeof verification_type === 'string' ? verification_type : 'peer_review',
        normalizedStatus,
        typeof confidence_score === 'number' ? confidence_score : 0,
        typeof comments === 'string' ? comments : null,
        Boolean(is_fraudulent),
        Array.isArray(fraud_indicators) ? fraud_indicators : []
      ]
    );

    // Update counters - MVP version
    await query(`UPDATE users SET total_verifications = total_verifications + 1 WHERE id = $1`, [verifierId]);

    // Gamification: reward the verifier for doing the work.
    await applyGamificationEvent({
      type: 'VERIFICATION_SUBMITTED',
      userId: verifierId,
      effortId: effort_id
    });

    if (normalizedStatus === 'approved') {
      await query(
        `UPDATE effort_records
         SET status = 'verified', verified_at = CURRENT_TIMESTAMP, verification_count = verification_count + 1
         WHERE id = $1`,
        [effort_id]
      );
      await query(`UPDATE users SET verified_efforts = verified_efforts + 1 WHERE id = $1`, [effort.user_id]);

      // Gamification: reward the effort owner when their effort is verified.
      // Pull minimal data for sizing + risk multiplier.
      const effortInfo = await query<{
        title: string;
        description: string;
        category: string;
        estimated_hours: number | null;
        proof_files: string[] | null;
        proof_ipfs_hash: string | null;
        created_at: string;
      }>(
        `SELECT title, description, category, estimated_hours, proof_files, proof_ipfs_hash, created_at
         FROM effort_records
         WHERE id = $1`,
        [effort_id]
      );

      const e = effortInfo.rows[0];
      const risk =
        e != null
          ? assessEffortRisk({
              title: e.title,
              description: e.description,
              category: e.category,
              estimated_hours: e.estimated_hours ?? undefined,
              proof_files_count: e.proof_files?.length ?? 0,
              proof_ipfs_hash: e.proof_ipfs_hash ?? undefined,
              created_at: e.created_at
            })
          : undefined;

      await applyGamificationEvent({
        type: 'EFFORT_VERIFIED',
        userId: effort.user_id,
        effortId: effort_id,
        estimatedHours: e?.estimated_hours ?? undefined,
        risk
      });
    } else if (normalizedStatus === 'rejected') {
      await query(`UPDATE effort_records SET status = 'rejected' WHERE id = $1`, [effort_id]);
    } else if (normalizedStatus === 'needs_more_info') {
      await query(`UPDATE effort_records SET status = 'under_review' WHERE id = $1`, [effort_id]);
    }

    res.status(201).json({
      success: true,
      data: inserted.rows[0]
    });
  } catch (err) {
    next(err);
  }
});

// Get pending verifications (for verifiers)
router.get('/pending', authenticate, async (_req: AuthRequest, res, next) => {
  try {
    const limit = 20;
    const efforts = await query<{
      id: string;
      user_id: string;
      title: string;
      description: string;
      category: string;
      estimated_hours: number | null;
      proof_files: string[] | null;
      proof_ipfs_hash: string | null;
      status: string;
      created_at: string;
    }>(
      `SELECT id, user_id, title, description, category, estimated_hours, proof_files, proof_ipfs_hash, status, created_at
       FROM effort_records
       WHERE status IN ('pending','under_review')
       ORDER BY created_at ASC
       LIMIT $1`,
      [limit]
    );

    const withRisk = efforts.rows.map((e) => {
      const risk = assessEffortRisk({
        title: e.title,
        description: e.description,
        category: e.category,
        estimated_hours: e.estimated_hours ?? undefined,
        proof_files_count: e.proof_files?.length ?? 0,
        proof_ipfs_hash: e.proof_ipfs_hash ?? undefined,
        created_at: e.created_at
      });

      return { ...e, risk };
    });

    res.json({
      success: true,
      data: withRisk
    });
  } catch (err) {
    next(err);
  }
});

// Get verification by ID
router.get('/:verificationId', (req, res) => {
  res.json({ message: `Get verification ${req.params.verificationId}` });
});

// Update verification status
router.put('/:verificationId', authenticate, (req, res) => {
  res.json({ message: `Update verification ${req.params.verificationId}` });
});

// Get verifications by user (as verifier)
router.get('/user/:userId', (req, res) => {
  res.json({ message: `Get verifications by user ${req.params.userId}` });
});

// Request additional verification
router.post('/:effortId/request-verification', authenticate, (req, res) => {
  res.json({ message: `Request verification for effort ${req.params.effortId}` });
});

// Report fraudulent activity
router.post('/report-fraud', authenticate, (_req, res) => {
  res.json({ message: 'Report fraud endpoint' });
});

export default router;
