import crypto from 'node:crypto';
import { ContactMessage } from '../models/ContactMessage.js';
import { contactSchema } from '../validators/contact.schema.js';
import { sendContactNotification } from '../services/email.service.js';
import { verifyTurnstile } from '../services/turnstile.service.js';
import { env } from '../config/env.js';

const hashIp = (ip) =>
  crypto.createHash('sha256').update(`${ip}${env.IP_HASH_SALT}`).digest('hex').slice(0, 32);

export async function createContactMessage(req, res) {
  const parsed = contactSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: 'Please check the highlighted fields.',
      errors: parsed.error.flatten().fieldErrors
    });
  }

  const data = parsed.data;

  // Honeypot hit: answer exactly like a success so the bot does not learn anything,
  // and write nothing to the database.
  if (data.website) {
    return res.status(201).json({ success: true, message: 'Thanks — your message has been sent.' });
  }

  const passedChallenge = await verifyTurnstile(data.turnstileToken, req.ip);
  if (!passedChallenge) {
    return res.status(400).json({
      success: false,
      message: 'Verification failed. Please refresh the page and try again.'
    });
  }

  // Double-submit guard: people hit "Send" twice when a response feels slow.
  const recentDuplicate = await ContactMessage.findOne({
    email: data.email,
    message: data.message,
    createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) }
  }).lean();

  if (recentDuplicate) {
    return res.status(200).json({
      success: true,
      message: 'Thanks — your message has already been received.'
    });
  }

  const saved = await ContactMessage.create({
    name: data.name,
    email: data.email,
    subject: data.subject?.trim() || 'Portfolio contact',
    message: data.message,
    ipHash: hashIp(req.ip),
    userAgent: req.get('user-agent')?.slice(0, 300) ?? null
  });

  // Deliver email notification before concluding the serverless function execution.
  // Wrapped in try/catch so email transport failure never drops a message that was already saved to DB.
  let emailDelivered = false;
  try {
    emailDelivered = await sendContactNotification(saved);
    if (emailDelivered) {
      await ContactMessage.updateOne({ _id: saved._id }, { emailDelivered: true });
    }
  } catch (error) {
    console.error('[contact] notification failed:', error.message);
  }

  return res.status(201).json({
    success: true,
    message: 'Thanks — your message has been sent. I usually reply within a day.',
    data: { id: saved._id, emailDelivered }
  });
}
