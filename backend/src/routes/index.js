import { Router } from 'express';
import { databaseStatus } from '../config/db.js';
import { features } from '../config/env.js';
import { contactLimiter, assistantLimiter } from '../middleware/rateLimiters.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { createContactMessage } from '../controllers/contact.controller.js';
import { listRepositories } from '../controllers/github.controller.js';
import { askQuestion } from '../controllers/assistant.controller.js';

export const router = Router();

/**
 * Health check.
 * Also doubles as the warm-up endpoint an uptime pinger can hit to keep a free
 * Render instance from going to sleep.
 */
router.get('/health', (req, res) => {
  const dbStatus = databaseStatus();
  const isHealthy = dbStatus === 'connected' || dbStatus === 'connecting';

  res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    status: isHealthy ? 'ok' : 'degraded',
    database: dbStatus,
    features,
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

router.post('/contact', contactLimiter, asyncHandler(createContactMessage));
router.get('/github/repos', asyncHandler(listRepositories));
router.post('/assistant', assistantLimiter, asyncHandler(askQuestion));
