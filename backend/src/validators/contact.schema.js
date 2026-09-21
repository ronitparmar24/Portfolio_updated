import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80),
  email: z.string().trim().toLowerCase().email('Enter a valid email address').max(150),
  subject: z.string().trim().max(150).optional(),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(3000),

  // Honeypot: hidden in the DOM, so a real user never fills it and a naive bot does.
  // Deliberately permissive — a filled honeypot must PASS validation so the
  // controller can answer with a fake success. Rejecting it here would tell the
  // bot exactly which field gave it away.
  website: z.string().max(200).optional(),

  // Cloudflare Turnstile token, only verified when TURNSTILE_SECRET_KEY is set.
  turnstileToken: z.string().optional()
});
