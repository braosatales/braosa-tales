/**
 * Transactional email through Resend's HTTP API.
 * Needs RESEND_API_KEY in Vercel (and optionally EMAIL_FROM, an address on a domain verified in Resend).
 * Without a key nothing is sent and callers carry on: the GM still sees the list in Manage.
 */
export async function sendEmail(msg: { to: string; subject: string; html: string; text: string }): Promise<boolean> {
  const key = process.env.RESEND_API_KEY
  if (!key) return false
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'Braosa Tales <noreply@braosatales.com>',
        reply_to: 'braosa.tales@gmail.com',
        ...msg,
      }),
      signal: AbortSignal.timeout(8000),
    })
    return res.ok
  } catch {
    return false
  }
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!)

/** Simple branded email body, in the same colours as the site. */
export function emailHtml({ heading, body, cta }: { heading: string; body: string; cta?: { label: string; url: string } }) {
  return `<!doctype html><html><body style="margin:0;background:#0F0B16;padding:32px 16px;font-family:Georgia,serif;color:#DCD2E6">
<table role="presentation" width="100%" style="max-width:520px;margin:0 auto;background:#1A1424;border:1px solid #2E2440;border-radius:16px">
<tr><td style="padding:32px">
<p style="margin:0 0 6px;font-size:12px;letter-spacing:3px;color:#D4AE58">BRAOSA TALES</p>
<h1 style="margin:0 0 16px;font-size:24px;line-height:1.25;color:#F3E9D2">${esc(heading)}</h1>
<p style="margin:0 0 24px;font-size:16px;line-height:1.6">${esc(body)}</p>
${cta ? `<a href="${esc(cta.url)}" style="display:inline-block;background:#D4AE58;color:#0F0B16;text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:999px">${esc(cta.label)}</a>` : ''}
<p style="margin:28px 0 0;font-size:13px;color:#A99DBC">You asked to hear when a seat opened. This is a one-time email; you won’t get it again for this campaign.</p>
</td></tr></table></body></html>`
}
