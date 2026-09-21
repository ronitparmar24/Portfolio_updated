import { env, features } from '../config/env.js';

/**
 * Send yourself a notification when someone uses the contact form.
 *
 * Resend's shared sender (onboarding@resend.dev) can only deliver to the email
 * you signed up with — which is exactly this use case. Add your own domain later
 * if you ever want to send auto-replies to visitors too.
 *
 * replyTo is the detail that matters day to day: hitting reply in Gmail answers
 * the visitor directly instead of answering Resend.
 */
export async function sendContactNotification(message) {
  if (!features.email) {
    console.log('[email] skipped — RESEND_API_KEY / OWNER_EMAIL not configured');
    return false;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: env.FROM_EMAIL,
      to: [env.OWNER_EMAIL],
      reply_to: message.email,
      subject: `Portfolio: ${message.subject}`,
      text: [
        `Name:    ${message.name}`,
        `Email:   ${message.email}`,
        `Subject: ${message.subject}`,
        `Time:    ${new Date(message.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`,
        '',
        message.message
      ].join('\n')
    }),
    signal: AbortSignal.timeout(8000)
  });

  if (!response.ok) {
    throw new Error(`Resend responded ${response.status}: ${await response.text()}`);
  }

  return true;
}
