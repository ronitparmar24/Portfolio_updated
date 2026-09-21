import 'dotenv/config';
import { z } from 'zod';

/**
 * Validate configuration once, at boot.
 *
 * Why: a missing MONGODB_URI should crash the process on startup with a readable
 * message, not surface as an undefined-variable error three weeks later when the
 * first real visitor submits the contact form.
 */
const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  ALLOWED_ORIGINS: z
    .string()
    .default('http://localhost:5500')
    .transform((value) =>
      value
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean)
    ),

  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),

  RESEND_API_KEY: z.string().optional(),
  OWNER_EMAIL: z.string().email().optional(),
  FROM_EMAIL: z.string().default('Portfolio <onboarding@resend.dev>'),

  GITHUB_USERNAME: z.string().default('ronitparmar24'),
  GITHUB_TOKEN: z.string().optional(),

  TURNSTILE_SECRET_KEY: z.string().optional(),

  IP_HASH_SALT: z.string().min(8, 'IP_HASH_SALT must be at least 8 characters')
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment configuration:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

export const features = {
  email: Boolean(env.RESEND_API_KEY && env.OWNER_EMAIL),
  turnstile: Boolean(env.TURNSTILE_SECRET_KEY)
};
