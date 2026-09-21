import { env, features } from '../config/env.js';

/**
 * Verify a Cloudflare Turnstile token.
 *
 * Turnstile is free, invisible to most visitors, and far more effective than a
 * honeypot alone once your domain starts getting scraped. If no secret key is
 * configured this returns true so local development stays frictionless.
 */
export async function verifyTurnstile(token, ip) {
  if (!features.turnstile) return true;
  if (!token) return false;

  try {
    const response = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret: env.TURNSTILE_SECRET_KEY,
          response: token,
          remoteip: ip
        }),
        signal: AbortSignal.timeout(6000)
      }
    );

    const result = await response.json();
    return result.success === true;
  } catch (error) {
    console.error('[turnstile] verification failed:', error.message);
    // Fail open: never block a real visitor because Cloudflare had a bad minute.
    // The rate limiter and honeypot are still in front of this.
    return true;
  }
}
