import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import userRoutes from './routes/userRoutes';
import effortRoutes from './routes/effortRoutes';
import verificationRoutes from './routes/verificationRoutes';
import trustScoreRoutes from './routes/trustScoreRoutes';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3001;

// Basic hardening
app.disable('x-powered-by');

// Middleware
app.use(helmet());

/**
 * CORS
 * - In development we default to localhost:3000
 * - In production you should set CORS_ORIGIN to your deployed frontend domain
 */
const defaultDevOrigin = 'http://localhost:3000';
const corsOrigin = process.env.CORS_ORIGIN || defaultDevOrigin;

app.use(
  cors({
    origin: corsOrigin,
    // Only enable credentials if you are using cookie-based auth.
    // JWT in Authorization header does not require this.
    credentials: process.env.CORS_CREDENTIALS === 'true'
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Global rate limiting for API routes
const apiLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 15 * 60 * 1000),
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS ?? 300)
});

// Request logging
app.use((req: Request, _res: Response, next: NextFunction) => {
  const requestId = req.get('x-request-id') || crypto.randomUUID();
  (req as Request & { requestId?: string }).requestId = requestId;

  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
    requestId
  });
  next();
});

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
const API_VERSION = process.env.API_VERSION || 'v1';
app.use(`/api/${API_VERSION}`, apiLimiter);
app.use(`/api/${API_VERSION}/users`, userRoutes);
app.use(`/api/${API_VERSION}/efforts`, effortRoutes);
app.use(`/api/${API_VERSION}/verifications`, verificationRoutes);
app.use(`/api/${API_VERSION}/trust-scores`, trustScoreRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Resource not found'
  });
});

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 Proof-of-Effort Backend running on port ${PORT}`);
  logger.info(`📊 Environment: ${process.env.NODE_ENV}`);
  logger.info(`🔗 API Version: ${API_VERSION}`);
});

export default app;
