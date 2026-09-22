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
 * Assistant AI chat: 15 questions per IP per hour.
 * Protects against bot scrapers exhausting Groq organization API caps.
 */
export const assistantLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 15,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  message: json('You have asked several questions already. Please try again in an hour, or email ronitparmar.work@gmail.com directly.')
});

