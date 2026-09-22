import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from cwd first, fallback to backend/.env if running from root
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../backend/.env') });

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
  MONGODB_DBNAME: z.string().default('portfolio'),

  RESEND_API_KEY: z.string().optional(),
  OWNER_EMAIL: z.string().email().optional(),
  FROM_EMAIL: z.string().default('Portfolio <onboarding@resend.dev>'),

  GITHUB_USERNAME: z.string().default('ronitparmar24'),
  GITHUB_TOKEN: z.string().optional(),

  TURNSTILE_SECRET_KEY: z.string().optional(),

  GROQ_API_KEY: z.string().min(1, 'GROQ_API_KEY is required').optional(),

  IP_HASH_SALT: z.string().min(8).default('portfolio-salt-ronit-secure-default')
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
  turnstile: Boolean(env.TURNSTILE_SECRET_KEY),
  assistant: Boolean(env.GROQ_API_KEY)
};
