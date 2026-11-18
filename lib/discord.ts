/**
 * Vôr, the Braosa Tales Discord bot: posts session reminders and announcements.
 * Needs DISCORD_BOT_TOKEN in Vercel / .env.local. Server-only; never import from client components.
 */

export type DiscordKind = 'post_session' | 'confirm_3d' | 'final_24h' | 'announcement'
export type DiscordStatus = 'draft' | 'approved' | 'sending' | 'sent' | 'skipped' | 'cancelled' | 'failed'
export type DiscordTemplates = { confirm_3d?: string; final_24h?: string }

/** Kinds that fall back to the campaign's fixed text when no draft was approved in time. */
export const FALLBACK_KINDS: DiscordKind[] = ['confirm_3d', 'final_24h']

/** Fill {campaign} {session} {when} {in}. {when}/{in} are Discord timestamps, so each reader sees their own timezone. */
export function renderTemplate(tpl: string, v: { campaign: string; session: number | null; startsAt: string }) {
  const unix = Math.floor(new Date(v.startsAt).getTime() / 1000)
  return tpl
    .replaceAll('{campaign}', v.campaign)
    .replaceAll('{session}', v.session == null ? '' : String(v.session))
    .replaceAll('{when}', `<t:${unix}:F>`)
    .replaceAll('{in}', `<t:${unix}:R>`)
    .replace(/ {2,}/g, ' ')
    .trim()
}

/** Post a message. Mentions are switched off, so a draft can never ping @everyone by accident. */
export async function postToDiscord(channelId: string, content: string): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const token = process.env.DISCORD_BOT_TOKEN
  if (!token) return { ok: false, error: 'DISCORD_BOT_TOKEN is not set.' }
  if (!/^\d{5,25}$/.test(channelId)) return { ok: false, error: 'Invalid channel id.' }
  if (!content.trim() || content.length > 2000) return { ok: false, error: 'The message must be 1 to 2000 characters.' }
  try {
    for (let attempt = 0; attempt < 2; attempt++) {
      const res = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
        method: 'POST',
        headers: { Authorization: `Bot ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, allowed_mentions: { parse: [] } }),
        signal: AbortSignal.timeout(10000),
      })
      if (res.status === 429 && attempt === 0) {
        const j = await res.json().catch(() => ({}))
        await new Promise((r) => setTimeout(r, Math.min(5000, Math.ceil((Number(j.retry_after) || 1) * 1000))))
        continue
      }
      const j = await res.json().catch(() => ({}))
      if (!res.ok) return { ok: false, error: `Discord ${res.status}: ${j.message ?? 'error'}` }
      return { ok: true, id: String(j.id) }
    }
    return { ok: false, error: 'Discord rate limit.' }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Network error' }
  }
}
