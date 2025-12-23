import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { assessEffortRisk } from '../services/riskScoring';
import rateLimit from 'express-rate-limit';
import { AppError } from '../middleware/errorHandler';
import { query } from '../db/query';
import { applyGamificationEvent, seedDefaultBadges } from '../services/gamification/progression';
import { isDbUnavailableError } from '../db/errors';
import { randomUUID } from 'crypto';

const router = Router();

const riskAssessmentLimiter = rateLimit({
  windowMs: Number(process.env.RISK_RATE_LIMIT_WINDOW_MS ?? 60 * 1000),
  max: Number(process.env.RISK_RATE_LIMIT_MAX_REQUESTS ?? 40)
});

function assertString(name: string, value: unknown, opts: { maxLen: number; optional?: boolean }) {
  if (value == null) {
    if (opts.optional) return;
    throw new AppError(`${name} is required`, 400);
  }
  if (typeof value !== 'string') throw new AppError(`${name} must be a string`, 400);
  if (value.length > opts.maxLen) throw new AppError(`${name} is too long`, 400);
}

function assertNumber(
  name: string,
  value: unknown,
  opts: { min: number; max: number; optional?: boolean }
): number | undefined {
  if (value == null || value === '') {
    if (opts.optional) return undefined;
    throw new AppError(`${name} is required`, 400);
  }
  const n = typeof value === 'string' ? Number(value) : (value as number);
  if (!Number.isFinite(n)) throw new AppError(`${name} must be a number`, 400);
  if (n < opts.min || n > opts.max) throw new AppError(`${name} must be between ${opts.min} and ${opts.max}`, 400);
  return n;
}

// Preview risk scoring for a potential effort submission
// Public by design so the frontend can compute risk before a user authenticates.
router.post('/risk-assessment', riskAssessmentLimiter, (req, res) => {
  const {
    title,
    description,
    category,
    estimated_hours,
    proof_files_count,
    proof_ipfs_hash,
    location,
    created_at
  } = req.body ?? {};

  // Basic validation/sanitization to prevent abuse and weird payloads.
  assertString('title', title, { maxLen: 120, optional: true });
  assertString('description', description, { maxLen: 2500, optional: true });
  assertString('category', category, { maxLen: 64, optional: true });
  assertString('proof_ipfs_hash', proof_ipfs_hash, { maxLen: 256, optional: true });
  assertString('created_at', created_at, { maxLen: 64, optional: true });

  const normalizedEstimatedHours = assertNumber('estimated_hours', estimated_hours, {
    min: 0,
    max: 500,
    optional: true
  });

  const normalizedProofCount = assertNumber('proof_files_count', proof_files_count, {
    min: 0,
    max: 25,
    optional: true
  });

  const assessment = assessEffortRisk({
    title,
    description,
    category,
    estimated_hours: normalizedEstimatedHours,
    proof_files_count: normalizedProofCount,
    proof_ipfs_hash,
    location,
    created_at
  });

  res.json({
    success: true,
    data: assessment
  });
});

// Create new effort record
router.post('/', async (req, res, next) => {
  try {
    const body = req.body ?? {};

    const title = body.title;
    const description = body.description;
    const category = body.category;
    const estimated_hours = body.estimated_hours;
    const effort_type = body.effort_type;
    const walletAddress = (typeof body.wallet_address === 'string' && body.wallet_address) ? body.wallet_address : undefined;

    assertString('title', title, { maxLen: 255 });
    assertString('description', description, { maxLen: 5000 });
    assertString('category', category, { maxLen: 50 });

    const normalizedEstimatedHours = assertNumber('estimated_hours', estimated_hours, {
      min: 0,
      max: 500,
      optional: true
    });

    const normalizedEffortType = typeof effort_type === 'string' ? effort_type : 'need_verification';

    const resolvedWallet = walletAddress ?? '0x0000000000000000000000000000000000000000';
    const username = `w_${resolvedWallet.slice(2)}`.slice(0, 50);

    const effortAssessment = assessEffortRisk({
      title,
      description,
      category,
      estimated_hours: normalizedEstimatedHours,
      proof_files_count: assertNumber('proof_files_count', body.proof_files_count, { min: 0, max: 25, optional: true })
    });

    try {
      const userResult = await query<{ id: string }>(
        `INSERT INTO users (wallet_address, username)
         VALUES ($1, $2)
         ON CONFLICT (wallet_address) DO UPDATE SET wallet_address = EXCLUDED.wallet_address
         RETURNING id`,
        [resolvedWallet, username]
      );
      const userId = userResult.rows[0]?.id;
      if (!userId) throw new AppError('Failed to resolve user', 500);

      const inserted = await query(
        `INSERT INTO effort_records
          (user_id, title, description, category, effort_type, estimated_hours, proof_files, status, metadata)
         VALUES
          ($1, $2, $3, $4, $5, $6, $7, 'pending', $8)
         RETURNING *`,
        [
          userId,
          title,
          description,
          category,
          normalizedEffortType,
          normalizedEstimatedHours ?? null,
          [],
          JSON.stringify({ risk: effortAssessment })
        ]
      );

      await query(`UPDATE users SET total_efforts = total_efforts + 1 WHERE id = $1`, [userId]);

      try {
        await seedDefaultBadges();
        await applyGamificationEvent({
          type: 'EFFORT_SUBMITTED',
          userId,
          effortId: inserted.rows[0].id,
          estimatedHours: normalizedEstimatedHours,
          risk: effortAssessment
        });
      } catch {
        // Non-fatal in MVP mode.
      }

      res.status(201).json({
        success: true,
        data: {
          effort: inserted.rows[0],
          risk: effortAssessment
        }
      });
    } catch (e) {
      if (!isDbUnavailableError(e)) throw e;

      const effort = {
        id: randomUUID(),
        title,
        description,
        category,
        estimated_hours: normalizedEstimatedHours ?? null,
        proof_files: [],
        status: 'pending',
        created_at: new Date().toISOString()
      };

      res.status(201).json({
        success: true,
        data: {
          effort,
          risk: effortAssessment
        }
      });
    }
  } catch (err) {
    next(err);
  }
});

// Get all efforts (with filters)
router.get('/', async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit ?? 20), 100);
    try {
      const rows = await query(
        `SELECT er.*,
                u.username,
                u.wallet_address
         FROM effort_records er
         JOIN users u ON u.id = er.user_id
         ORDER BY er.created_at DESC
         LIMIT $1`,
        [limit]
      );

      res.json({
        success: true,
        data: rows.rows
      });
    } catch (e) {
      if (!isDbUnavailableError(e)) throw e;
      res.json({ success: true, data: [], warning: 'Database unavailable; returning empty efforts list.' });
    }
  } catch (err) {
    next(err);
  }
});

// Get specific effort
router.get('/:effortId', (req, res) => {
  res.json({ message: `Get effort ${req.params.effortId}` });
});

// Update effort
router.put('/:effortId', authenticate, (req, res) => {
  res.json({ message: `Update effort ${req.params.effortId}` });
});

// Delete effort
router.delete('/:effortId', authenticate, (req, res) => {
  res.json({ message: `Delete effort ${req.params.effortId}` });
});

// Upload proof files
router.post('/:effortId/proof', authenticate, (req, res) => {
  res.json({ message: `Upload proof for effort ${req.params.effortId}` });
});

// Get effort verifications
router.get('/:effortId/verifications', (req, res) => {
  res.json({ message: `Get verifications for effort ${req.params.effortId}` });
});

// Get efforts by category
router.get('/category/:category', (req, res) => {
  res.json({ message: `Get efforts in category ${req.params.category}` });
});

export default router;
