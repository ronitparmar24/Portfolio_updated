import rateLimit from 'express-rate-limit';

const json = (message) => ({ success: false, message });

/** Broad safety net for the whole API. */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 120,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: json('Too many requests. Please try again in a few minutes.')
});

/**
 * Contact form: 5 submissions per IP per hour.
 *
 * This is the single most valuable spam defence here — more than the honeypot,
 * because it also caps a determined human. It only works if `trust proxy` is set
 * correctly in app.js; otherwise every request on Render looks like it comes
 * from the same load-balancer IP and one spammer locks out the whole world.
 */
export const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  message: json('You have sent several messages already. Please try again later.')
});

/**
 * Assistant AI chat: 20 questions per IP per hour.
 * Protects against bot scrapers exhausting Groq organization API caps.
 *
 * NOTE ON SERVERLESS (e.g. Vercel Functions):
 * In-memory rate limiting operates per warm serverless container instance.
 * Because serverless environments spin up ephemeral instances on demand,
 * an in-memory store cannot guarantee global rate limits across different instances.
 * For globally synchronized limits across multi-region serverless invocations,
 * a distributed external store (such as Upstash Redis or Memcached) should be attached.
 * For single-instance servers (e.g. Render / VPS), this in-memory limiter is strictly enforced.
 */
export const assistantLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  message: {
    success: false,
    code: 'RATE_LIMIT',
    message: 'You have asked several questions already. Please try again in a bit, or email ronitparmar.work@gmail.com directly.'
  }
});

