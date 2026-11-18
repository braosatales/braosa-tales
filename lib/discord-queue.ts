import { createServerSupabase } from '@/lib/supabase-server'
import { FALLBACK_KINDS, postToDiscord, renderTemplate, type DiscordKind, type DiscordStatus, type DiscordTemplates } from '@/lib/discord'

type Row = {
  id: string
  kind: DiscordKind
  status: DiscordStatus
  channel_id: string | null
  send_at: string
  expires_at: string | null
  draft_content: string | null
  attempts: number
  campaign: { title: string; discord_channel_id: string | null; discord_templates: DiscordTemplates | null } | null
  session: { session_number: number | null; starts_at: string } | null
}

const MAX_ATTEMPTS = 3

/**
 * Send everything that is due. Rules (agreed with João, 2026-11-17):
 *  - approved draft → goes out as written
 *  - confirm_3d / final_24h without an approved draft → the campaign's fixed text
 *  - post_session / announcement without approval → waits; skipped once expired
 * Each row is claimed (status 'sending') before posting, so two runs never double-post.
 */
export async function sendDueDiscordMessages() {
  const db = createServerSupabase()
  const now = new Date()
  const { data, error } = await db
    .from('discord_messages')
    .select(
      'id, kind, status, channel_id, send_at, expires_at, draft_content, attempts, campaign:campaigns(title, discord_channel_id, discord_templates), session:campaign_sessions(session_number, starts_at)'
    )
    .in('status', ['draft', 'approved'])
    .lte('send_at', now.toISOString())
    .order('send_at')
    .limit(25)
  if (error) return { error: error.message, sent: 0, skipped: 0, failed: 0, waiting: 0 }

  const out = { sent: 0, skipped: 0, failed: 0, waiting: 0 }
  for (const r of (data ?? []) as unknown as Row[]) {
    const set = (patch: Record<string, unknown>) =>
      db.from('discord_messages').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', r.id).eq('status', r.status)

    if (r.expires_at && now > new Date(r.expires_at)) {
      await set({ status: 'skipped', last_error: r.status === 'approved' ? 'Expired before it could go out.' : 'Not approved in time.' })
      out.skipped++
      continue
    }

    let content: string | null = null
    let fallback = false
    if (r.status === 'approved' && r.draft_content?.trim()) {
      content = r.draft_content
    } else if (FALLBACK_KINDS.includes(r.kind)) {
      content = r.campaign?.discord_templates?.[r.kind as 'confirm_3d' | 'final_24h'] ?? null
      fallback = true
      if (!content) {
        await set({ status: 'failed', last_error: 'No approved draft and no fixed text for this campaign.' })
        out.failed++
        continue
      }
    } else {
      out.waiting++
      continue
    }
    if (r.session) content = renderTemplate(content, { campaign: r.campaign?.title ?? '', session: r.session.session_number, startsAt: r.session.starts_at })

    const channel = r.channel_id ?? r.campaign?.discord_channel_id
    if (!channel) {
      await set({ status: 'failed', last_error: 'No Discord channel set for this campaign.' })
      out.failed++
      continue
    }

    const { data: claimed } = await set({ status: 'sending', attempts: r.attempts + 1 }).select('id')
    if (!claimed?.length) continue // another run got it first

    const res = await postToDiscord(channel, content)
    const done = (patch: Record<string, unknown>) =>
      db.from('discord_messages').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', r.id).eq('status', 'sending')
    if (res.ok) {
      await done({ status: 'sent', sent_at: new Date().toISOString(), sent_content: content, used_fallback: fallback, discord_message_id: res.id, last_error: null })
      out.sent++
    } else {
      const giveUp = r.attempts + 1 >= MAX_ATTEMPTS
      await done({ status: giveUp ? 'failed' : r.status, last_error: res.error })
      if (giveUp) out.failed++
    }
  }
  return out
}
