import { createServerSupabase } from '@/lib/supabase-server'
import { openDmChannel, postToDiscord, type DiscordKind, type DiscordStatus } from '@/lib/discord'

/**
 * Vôr DMs João (DISCORD_OWNER_ID) about posts in Clot, at most one DM per cron run:
 *  - a fresh draft is waiting for his approval                      (once per draft: notified_at)
 *  - a deadline is close: 3-day / 24h post goes out with its fixed
 *    text, or the after-session post expires, within NUDGE_HOURS      (once per post: nudged_at)
 *  - a post failed                                                   (once: failure_notified_at)
 * These DMs go to João only; they never post anywhere in his name.
 */

const NUDGE_HOURS = 6
const KIND: Record<DiscordKind, string> = {
  confirm_3d: '3-day post',
  final_24h: '24h post',
  post_session: 'after-session post',
  announcement: 'announcement',
}

type Row = {
  id: string
  kind: DiscordKind
  status: DiscordStatus
  send_at: string
  expires_at: string | null
  draft_content: string | null
  drafted_at: string | null
  notified_at: string | null
  nudged_at: string | null
  failure_notified_at: string | null
  last_error: string | null
  campaign: { title: string } | null
  session: { session_number: number | null } | null
}

const hoursLeft = (iso: string) => Math.max(0, Math.round((new Date(iso).getTime() - Date.now()) / 3600000))

export async function sendOwnerNotices() {
  const owner = process.env.DISCORD_OWNER_ID
  if (!owner) return { skipped: 'DISCORD_OWNER_ID is not set.' }
  const db = createServerSupabase()
  const now = new Date()
  const soon = new Date(now.getTime() + NUDGE_HOURS * 3600000).toISOString()

  const { data, error } = await db
    .from('discord_messages')
    .select(
      'id, kind, status, send_at, expires_at, draft_content, drafted_at, notified_at, nudged_at, failure_notified_at, last_error, campaign:campaigns(title), session:campaign_sessions(session_number)'
    )
    .in('status', ['draft', 'failed'])
    .or(`expires_at.is.null,expires_at.gt.${new Date(now.getTime() - 7 * 86400000).toISOString()}`)
    .limit(200)
  if (error) return { error: error.message }

  const waiting: string[] = []
  const nudges: string[] = []
  const failures: string[] = []
  const marks: { id: string; field: 'notified_at' | 'nudged_at' | 'failure_notified_at' }[] = []

  for (const r of (data ?? []) as unknown as Row[]) {
    const label = `${r.campaign?.title ?? 'Campaign'}${r.session?.session_number ? ` s${r.session.session_number}` : ''}: ${KIND[r.kind]}`
    const live = !r.expires_at || new Date(r.expires_at) > now

    if (r.status === 'failed') {
      if (!r.failure_notified_at) {
        failures.push(`• ${label} failed${r.last_error ? ` (${r.last_error})` : ''}`)
        marks.push({ id: r.id, field: 'failure_notified_at' })
      }
      continue
    }
    if (!live) continue

    if (r.draft_content && r.drafted_at && !r.notified_at) {
      waiting.push(`• ${label}`)
      marks.push({ id: r.id, field: 'notified_at' })
    }

    if (!r.nudged_at) {
      if ((r.kind === 'confirm_3d' || r.kind === 'final_24h') && r.send_at <= soon && r.send_at > now.toISOString()) {
        nudges.push(`• ${label} goes out with the fixed text in ~${hoursLeft(r.send_at)}h unless you approve a draft`)
        marks.push({ id: r.id, field: 'nudged_at' })
      } else if (r.kind === 'post_session' && r.expires_at && r.expires_at <= soon && r.send_at <= now.toISOString()) {
        nudges.push(`• ${label} expires in ~${hoursLeft(r.expires_at)}h${r.draft_content ? '' : ' (no draft yet)'}`)
        marks.push({ id: r.id, field: 'nudged_at' })
      }
    }
  }

  if (!marks.length) return { sent: 0 }

  const parts: string[] = []
  if (waiting.length) parts.push(`Waiting for you in Clot:\n${waiting.join('\n')}`)
  if (nudges.length) parts.push(`Coming up:\n${nudges.join('\n')}`)
  if (failures.length) parts.push(`Didn't go out:\n${failures.join('\n')}`)
  parts.push('Clot → Braosa → Tables')
  let content = parts.join('\n\n')
  if (content.length > 1900) content = content.slice(0, 1880) + '\n…'

  const dm = await openDmChannel(owner)
  if (!dm.ok) return { error: dm.error }
  const res = await postToDiscord(dm.id, content)
  if (!res.ok) return { error: res.error }

  const stamp = now.toISOString()
  for (const field of ['notified_at', 'nudged_at', 'failure_notified_at'] as const) {
    const ids = marks.filter((m) => m.field === field).map((m) => m.id)
    if (ids.length) await db.from('discord_messages').update({ [field]: stamp }).in('id', ids)
  }
  return { sent: 1, lines: marks.length }
}
