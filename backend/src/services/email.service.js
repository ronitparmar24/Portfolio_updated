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
 * Send notification when someone submits the contact form.
 *
 * Styled to perfectly align with Ronit Parmar's portfolio design system:
 * - Deep obsidian backgrounds (#0d0e0e, #161817)
 * - Signature Electric Lime accent (#d2f96b) with dark ink (#171e0b)
 * - Soft pastel lavender accent (#b5a4ec) & Georgia serif typography
 * - Clean monospace section metadata
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
<body style="margin: 0; padding: 0; background-color: #0d0e0e; font-family: 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #f1f2eb;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0d0e0e; padding: 36px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card Container: Styled after Portfolio Theme -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #161817; border: 1px solid #292d28; border-radius: 16px; overflow: hidden; box-shadow: 0 24px 60px rgba(0, 0, 0, 0.65);">
          
          <!-- Top Accent Ribbon: Electric Lime & Lavender -->
          <tr>
            <td style="background: linear-gradient(90deg, #d2f96b 0%, #b5a4ec 65%, #d2f96b 100%); height: 4px;"></td>
          </tr>

          <!-- Top Brand Bar -->
          <tr>
            <td style="padding: 28px 32px 18px 32px; border-bottom: 1px solid #242823;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td valign="middle">
                    <span style="font-family: Georgia, 'Times New Roman', serif; font-size: 21px; font-weight: 700; color: #f1f2eb; letter-spacing: -0.5px;">
                      Ronit Parmar<span style="color: #d2f96b; font-size: 18px; font-style: normal; margin-left: 2px;">.</span>
                    </span>
                  </td>
                  <td align="right" valign="middle">
                    <span style="display: inline-block; background-color: #1d2514; color: #d2f96b; border: 1px solid #364421; font-size: 10px; font-weight: 750; letter-spacing: 0.9px; text-transform: uppercase; padding: 5px 12px; border-radius: 9999px;">
                      <span style="display: inline-block; width: 6px; height: 6px; background-color: #d2f96b; border-radius: 50%; margin-right: 6px; vertical-align: middle; box-shadow: 0 0 6px rgba(210, 249, 107, 0.6);"></span>Recruiter Message
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Subject Title Section -->
          <tr>
            <td style="padding: 26px 32px 18px 32px;">
              <div style="font-family: ui-monospace, 'SFMono-Regular', Menlo, Monaco, Consolas, monospace; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.3px; color: #b5a4ec; margin-bottom: 8px;">
                // INCOMING INQUIRY
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 650; line-height: 1.3; letter-spacing: -0.8px;">
                ${escapedSubject}
              </h1>
            </td>
          </tr>

          <!-- Sender Profile Card -->
          <tr>
            <td style="padding: 0 32px 22px 32px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #1d201e; border: 1px solid #2f342e; border-radius: 12px; padding: 16px 18px;">
                <tr>
                  <td width="46" valign="middle">
                    <div style="width: 42px; height: 42px; border-radius: 10px; background-color: #d2f96b; color: #171e0b; font-weight: 850; font-size: 16px; line-height: 42px; text-align: center; text-transform: uppercase; box-shadow: 0 4px 14px rgba(210, 249, 107, 0.28);">
                      ${initials}
                    </div>
                  </td>
                  <td style="padding-left: 14px;" valign="middle">
                    <div style="color: #f1f2eb; font-size: 16px; font-weight: 650; letter-spacing: -0.2px;">
                      ${escapedName}
                    </div>
                    <div style="margin-top: 3px;">
                      <a href="mailto:${escapedEmail}" style="color: #b5a4ec; font-size: 13.5px; text-decoration: none; font-weight: 500;">
                        ${escapedEmail}
                      </a>
                    </div>
                  </td>
                  <td align="right" valign="top" style="color: #a0a69e; font-size: 11px; white-space: nowrap; font-family: ui-monospace, 'SFMono-Regular', Menlo, Monaco, Consolas, monospace; padding-top: 3px;">
                    ${formattedTime}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Message Body (Obsidian Surface with Electric Lime Accent Border) -->
          <tr>
            <td style="padding: 0 32px 26px 32px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #111312; border-left: 3px solid #d2f96b; border-top: 1px solid #262a25; border-right: 1px solid #262a25; border-bottom: 1px solid #262a25; border-radius: 8px; padding: 20px 22px;">
                <tr>
                  <td>
                    <div style="font-family: ui-monospace, 'SFMono-Regular', Menlo, Monaco, Consolas, monospace; color: #a0a69e; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 12px;">
                      // MESSAGE BODY
                    </div>
                    <div style="color: #f1f2eb; font-size: 15px; line-height: 1.75; white-space: pre-wrap; word-break: break-word;">${escapedMessage}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Primary CTA Button (Signature Lime Button from Frontend) -->
          <tr>
            <td align="center" style="padding: 0 32px 30px 32px;">
              <table role="presentation" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="border-radius: 7px; background-color: #d2f96b; box-shadow: 0 6px 20px rgba(210, 249, 107, 0.22);">
                    <a href="mailto:${escapedEmail}?subject=${replySubject}" style="display: inline-block; padding: 13px 30px; background-color: #d2f96b; color: #171e0b; text-decoration: none; font-size: 11px; font-weight: 800; letter-spacing: 0.8px; text-transform: uppercase; border-radius: 7px;">
                      Reply to ${escapeHtml(firstName)} &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Subtle Footer matching site-footer -->
          <tr>
            <td style="border-top: 1px solid #242823; padding: 18px 32px; background-color: #121313;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="color: #798076; font-size: 11px; line-height: 1.6;">
                    Dispatched from <strong style="color: #a0a69e;">Ronit Parmar's Portfolio</strong>.<br>
                    Replying answers <strong style="color: #d2f96b;">${escapedEmail}</strong> directly.
                  </td>
                  <td align="right" valign="middle">
                    <span style="font-family: Georgia, 'Times New Roman', serif; font-style: italic; color: #b5a4ec; font-size: 17px; font-weight: 400;">
                      RP
                    </span>
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
