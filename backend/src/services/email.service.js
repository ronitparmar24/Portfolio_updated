import { env, features } from '../config/env.js';

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getInitials(name) {
  if (!name) return 'RP';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Send yourself a notification when someone uses the contact form.
 *
 * Includes both responsive, high-aesthetic HTML and plain-text fallback.
 * replyTo allows hitting 'Reply' in Gmail to answer the sender directly.
 */
export async function sendContactNotification(message) {
  if (!features.email) {
    console.log('[email] skipped — RESEND_API_KEY / OWNER_EMAIL not configured');
    return false;
  }

  const dateObj = message.createdAt ? new Date(message.createdAt) : new Date();
  const formattedTime = dateObj.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const initials = getInitials(message.name);
  const firstName = message.name ? message.name.trim().split(/\s+/)[0] : 'Sender';
  const escapedName = escapeHtml(message.name);
  const escapedEmail = escapeHtml(message.email);
  const escapedSubject = escapeHtml(message.subject || 'Portfolio Inquiry');
  const escapedMessage = escapeHtml(message.message);
  const replySubject = encodeURIComponent(`Re: ${message.subject || 'Portfolio Inquiry'}`);

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Message: ${escapedSubject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #e2e8f0;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0b0f19; padding: 32px 12px;">
    <tr>
      <td align="center">
        <!-- Main Email Container Card -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #121929; border: 1px solid #1f293d; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.45);">
          
          <!-- Gradient Top Highlight Bar -->
          <tr>
            <td style="background: linear-gradient(90deg, #6366f1 0%, #a855f7 50%, #ec4899 100%); height: 5px;"></td>
          </tr>

          <!-- Header Section -->
          <tr>
            <td style="padding: 32px 28px 20px 28px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="display: inline-block; background-color: rgba(99, 102, 241, 0.15); color: #818cf8; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; padding: 4px 12px; border-radius: 9999px; border: 1px solid rgba(99, 102, 241, 0.3);">
                      ✦ New Recruiter / Contact Inquiry
                    </span>
                    <h1 style="margin: 14px 0 0 0; color: #ffffff; font-size: 21px; font-weight: 700; line-height: 1.35; letter-spacing: -0.01em;">
                      ${escapedSubject}
                    </h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Sender Info Card -->
          <tr>
            <td style="padding: 0 28px 24px 28px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #172136; border: 1px solid #23304d; border-radius: 12px; padding: 16px 18px;">
                <tr>
                  <td width="46" valign="middle">
                    <div style="width: 44px; height: 44px; border-radius: 10px; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff; font-weight: 700; font-size: 16px; line-height: 44px; text-align: center; text-transform: uppercase; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.35);">
                      ${initials}
                    </div>
                  </td>
                  <td style="padding-left: 14px;" valign="middle">
                    <div style="color: #ffffff; font-size: 16px; font-weight: 600; line-height: 1.2;">
                      ${escapedName}
                    </div>
                    <div style="margin-top: 3px;">
                      <a href="mailto:${escapedEmail}" style="color: #38bdf8; font-size: 13.5px; text-decoration: none; font-weight: 500;">
                        ${escapedEmail}
                      </a>
                    </div>
                  </td>
                  <td align="right" valign="top" style="color: #64748b; font-size: 12px; white-space: nowrap; padding-top: 2px;">
                    📅 ${formattedTime}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Message Body Section -->
          <tr>
            <td style="padding: 0 28px 26px 28px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0b1120; border-left: 4px solid #6366f1; border-top: 1px solid #1e293b; border-right: 1px solid #1e293b; border-bottom: 1px solid #1e293b; border-radius: 10px; padding: 20px 22px;">
                <tr>
                  <td>
                    <div style="color: #818cf8; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 10px;">
                      Message Content
                    </div>
                    <div style="color: #f1f5f9; font-size: 15px; line-height: 1.7; white-space: pre-wrap; word-break: break-word;">${escapedMessage}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Action Button: Reply directly -->
          <tr>
            <td align="center" style="padding: 0 28px 30px 28px;">
              <table role="presentation" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="border-radius: 8px; background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4);">
                    <a href="mailto:${escapedEmail}?subject=${replySubject}" style="display: inline-block; padding: 13px 30px; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; letter-spacing: 0.02em; border-radius: 8px;">
                      ✉️ Reply to ${escapeHtml(firstName)}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Subtle Footer -->
          <tr>
            <td style="border-top: 1px solid #1a2438; padding: 18px 28px; background-color: #0c1220;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="color: #64748b; font-size: 12px; line-height: 1.5;">
                    Received via <strong style="color: #94a3b8;">Ronit Parmar's Portfolio</strong> contact form.<br>
                    Hitting "Reply" in your mail client answers <strong style="color: #cbd5e1;">${escapedEmail}</strong> directly.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

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
        `New message received via Portfolio Contact Form:`,
        `----------------------------------------`,
        `Name:    ${message.name}`,
        `Email:   ${message.email}`,
        `Subject: ${message.subject}`,
        `Time:    ${formattedTime}`,
        `----------------------------------------`,
        '',
        message.message,
        '',
        `----------------------------------------`,
        `Reply to: ${message.email}`
      ].join('\n'),
      html: htmlContent
    }),
    signal: AbortSignal.timeout(8000)
  });

  if (!response.ok) {
    throw new Error(`Resend responded ${response.status}: ${await response.text()}`);
  }

  return true;
}
