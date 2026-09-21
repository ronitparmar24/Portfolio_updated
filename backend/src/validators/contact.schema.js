import { z } from 'zod';

/** Strip HTML tags and control characters to prevent stored XSS or injection payloads */
const sanitizeText = (val) =>
  typeof val === 'string'
    ? val
        .replace(/<[^>]*>?/gm, '')
        .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F]/g, '')
        .trim()
    : '';

export const contactSchema = z.object({
  name: z
    .string()
    .transform(sanitizeText)
    .pipe(z.string().min(2, 'Name must be at least 2 characters').max(80)),
  email: z.string().trim().toLowerCase().email('Enter a valid email address').max(150),
  subject: z
    .string()
    .transform(sanitizeText)
    .pipe(z.string().max(150))
    .optional(),
  message: z
    .string()
    .transform(sanitizeText)
    .pipe(z.string().min(10, 'Message must be at least 10 characters').max(3000)),

  // Honeypot: hidden in the DOM, so a real user never fills it and a naive bot does.
  // Deliberately permissive — a filled honeypot must PASS validation so the
  // controller can answer with a fake success.
  website: z.string().max(200).optional(),

  // Cloudflare Turnstile token, only verified when TURNSTILE_SECRET_KEY is set.
  turnstileToken: z.string().optional()
});
