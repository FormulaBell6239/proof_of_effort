import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { ethers } from 'ethers';
import { authenticate, AuthRequest } from '../middleware/auth';
import { query } from '../db/query';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const router = Router();

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new AppError('JWT_SECRET not configured', 500);
  return secret;
}

function signToken(userId: string, walletAddress: string): string {
  const expiration = process.env.JWT_EXPIRATION || '7d';
  return jwt.sign({ userId, walletAddress }, getJwtSecret(), {
    expiresIn: expiration as jwt.SignOptions['expiresIn'],
  });
}

// POST /users/register
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email, wallet_address, password } = req.body;

    if (!username || typeof username !== 'string' || username.trim().length < 3) {
      throw new AppError('Username must be at least 3 characters', 400);
    }
    if (!wallet_address || !/^0x[0-9a-fA-F]{40}$/.test(wallet_address)) {
      throw new AppError('Valid Ethereum wallet address required', 400);
    }

    // Check for existing wallet or username
    const existing = await query(
      'SELECT id FROM users WHERE wallet_address = $1 OR username = $2',
      [wallet_address.toLowerCase(), username.trim()]
    );
    if (existing.rows.length > 0) {
      throw new AppError('Wallet address or username already registered', 409);
    }

    const password_hash = password
      ? await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS || '12'))
      : null;

    const result = await query(
      `INSERT INTO users (wallet_address, username, email, password_hash, is_active)
       VALUES ($1, $2, $3, $4, true)
       RETURNING id, wallet_address, username, email, trust_score, reputation_level, created_at`,
      [wallet_address.toLowerCase(), username.trim(), email || null, password_hash]
    );

    const user = result.rows[0];
    const token = signToken(user.id, user.wallet_address);

    logger.info(`New user registered: ${user.id}`);
    res.status(201).json({ token, user });
  } catch (err) {
    next(err);
  }
});

// POST /users/login  (email/password)
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError('Email and password required', 400);
    }

    const result = await query(
      'SELECT id, wallet_address, username, email, password_hash, is_active FROM users WHERE email = $1',
      [email]
    );

    const user = result.rows[0];
    if (!user || !user.password_hash) {
      throw new AppError('Invalid credentials', 401);
    }
    if (!user.is_active) {
      throw new AppError('Account is disabled', 403);
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      throw new AppError('Invalid credentials', 401);
    }

    const token = signToken(user.id, user.wallet_address);

    // Update last_active
    await query('UPDATE users SET last_active = NOW() WHERE id = $1', [user.id]);

    res.json({
      token,
      user: {
        id: user.id,
        wallet_address: user.wallet_address,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /users/verify-signature  (wallet-based auth — sign a message, get JWT)
router.post('/verify-signature', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { wallet_address, signature, message } = req.body;

    if (!wallet_address || !signature || !message) {
      throw new AppError('wallet_address, signature, and message are required', 400);
    }
    if (!/^0x[0-9a-fA-F]{40}$/.test(wallet_address)) {
      throw new AppError('Invalid wallet address', 400);
    }

    // Validate timestamp freshness to prevent replay attacks (5-minute window)
    const tsMatch = /Timestamp:\s*(\d+)/.exec(message as string);
    if (!tsMatch) {
      throw new AppError('Message missing timestamp', 400);
    }
    const msgTs = parseInt(tsMatch[1], 10);
    if (!Number.isFinite(msgTs) || Math.abs(Date.now() - msgTs) > 5 * 60 * 1000) {
      throw new AppError('Message timestamp expired or invalid', 400);
    }

    // Recover signer from signature
    let recovered: string;
    try {
      recovered = ethers.verifyMessage(message, signature);
    } catch {
      throw new AppError('Could not recover address from signature', 400);
    }

    if (recovered.toLowerCase() !== wallet_address.toLowerCase()) {
      throw new AppError('Signature does not match wallet address', 401);
    }

    // Find or create the user
    let userResult = await query(
      'SELECT id, wallet_address, username, email, is_active FROM users WHERE wallet_address = $1',
      [wallet_address.toLowerCase()]
    );

    let user = userResult.rows[0];

    if (!user) {
      // Auto-create a minimal account for wallet-only users
      const username = `user_${wallet_address.slice(2, 8).toLowerCase()}`;
      const insertResult = await query(
        `INSERT INTO users (wallet_address, username, is_active)
         VALUES ($1, $2, true)
         RETURNING id, wallet_address, username, email, is_active`,
        [wallet_address.toLowerCase(), username]
      );
      user = insertResult.rows[0];
      logger.info(`Auto-created wallet user: ${user.id}`);
    }

    if (!user.is_active) {
      throw new AppError('Account is disabled', 403);
    }

    await query('UPDATE users SET last_active = NOW() WHERE id = $1', [user.id]);

    const token = signToken(user.id, user.wallet_address);
    res.json({ token, user });
  } catch (err) {
    next(err);
  }
});

// GET /users/profile  (own profile, requires auth)
router.get('/profile', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await query(
      `SELECT id, wallet_address, username, email, trust_score, reputation_level,
              total_efforts, verified_efforts, total_verifications, verification_accuracy,
              created_at, last_active, profile_data
       FROM users WHERE id = $1`,
      [req.userId]
    );
    if (!result.rows[0]) throw new AppError('User not found', 404);
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /users/profile  (update own profile, requires auth)
router.put('/profile', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { username, email, profile_data } = req.body;

    if (username !== undefined && (typeof username !== 'string' || username.trim().length < 3)) {
      throw new AppError('Username must be at least 3 characters', 400);
    }

    const result = await query(
      `UPDATE users
       SET username     = COALESCE($1, username),
           email        = COALESCE($2, email),
           profile_data = COALESCE($3, profile_data),
           updated_at   = NOW()
       WHERE id = $4
       RETURNING id, wallet_address, username, email, trust_score, reputation_level, profile_data`,
      [username?.trim() || null, email || null, profile_data ? JSON.stringify(profile_data) : null, req.userId]
    );
    if (!result.rows[0]) throw new AppError('User not found', 404);
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// GET /users/:userId  (public profile)
router.get('/:userId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await query(
      `SELECT id, wallet_address, username, trust_score, reputation_level,
              total_efforts, verified_efforts, created_at, profile_data
       FROM users WHERE id = $1 AND is_active = true`,
      [req.params.userId]
    );
    if (!result.rows[0]) throw new AppError('User not found', 404);
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// GET /users/:userId/efforts  (public effort list for a user)
router.get('/:userId/efforts', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit = '20', offset = '0' } = req.query as Record<string, string>;
    const result = await query(
      `SELECT id, title, category, effort_type, estimated_hours, verification_level,
              verification_count, points_earned, status, created_at
       FROM effort_records
       WHERE user_id = $1 AND status != 'rejected'
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.params.userId, parseInt(limit), parseInt(offset)]
    );
    res.json({ efforts: result.rows });
  } catch (err) {
    next(err);
  }
});

// GET /users/:userId/trust-score  (public trust score)
router.get('/:userId/trust-score', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await query(
      `SELECT trust_score, reputation_level, verified_efforts, verification_accuracy
       FROM users WHERE id = $1 AND is_active = true`,
      [req.params.userId]
    );
    if (!result.rows[0]) throw new AppError('User not found', 404);
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
