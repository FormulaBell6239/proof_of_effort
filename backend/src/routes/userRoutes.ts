import { Router } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/register', (_req, res) => {
  res.json({ message: 'User registration endpoint' });
});

router.post('/login', (_req, res) => {
  res.json({ message: 'User login endpoint' });
});

router.post('/verify-signature', (_req, res) => {
  res.json({ message: 'Wallet signature verification endpoint' });
});

// Protected routes
router.get('/profile', authenticate, (_req, res) => {
  res.json({ message: 'User profile endpoint' });
});

router.put('/profile', authenticate, (_req, res) => {
  res.json({ message: 'Update user profile endpoint' });
});

router.get('/:userId', (req, res) => {
  res.json({ message: `Get user ${req.params.userId} public profile` });
});

router.get('/:userId/efforts', (req, res) => {
  res.json({ message: `Get efforts for user ${req.params.userId}` });
});

router.get('/:userId/trust-score', (req, res) => {
  res.json({ message: `Get trust score for user ${req.params.userId}` });
});

export default router;
