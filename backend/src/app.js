import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { env } from './config/env.js';
import { globalLimiter } from './middleware/rateLimiters.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import { router } from './routes/index.js';

export const app = express();

/**
 * Render (and every other PaaS) puts a reverse proxy in front of your app, so
 * req.ip would be the proxy's address without this. Rate limiting by IP is
 * meaningless until it is set. `1` = trust exactly one proxy hop, which is the
 * correct value on Render — never use `true`, which lets a client spoof
 * X-Forwarded-For and bypass the limiter entirely.
 */
app.set('trust proxy', 1);
app.disable('x-powered-by');

// Lightweight HTTP request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[http] ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`);
  });
  next();
});

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false
  })
);
app.use(compression());

app.use(
  cors({
    origin(origin, callback) {
      // No Origin header = curl, Postman, or a server-to-server call.
      // Origin 'null' is sent when opening local HTML files directly (file://).
      if (
        !origin ||
        origin === 'null' ||
        env.ALLOWED_ORIGINS.includes(origin) ||
        (env.NODE_ENV === 'development' && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin))
      ) {
        return callback(null, true);
      }
      const err = new Error(`Origin ${origin} is not allowed`);
      err.statusCode = 403;
      return callback(err);
    },
    methods: ['GET', 'POST'],
    maxAge: 86400
  })
);

app.use(express.json({ limit: '20kb' }));
app.use(globalLimiter);

app.use('/api', router);

app.get('/', (req, res) => {
  res.json({ success: true, message: 'Portfolio API. See /api/health.' });
});

app.use(notFound);
app.use(errorHandler);
