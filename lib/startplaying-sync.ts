import { createServerSupabase } from '@/lib/supabase-server'
import { parseIcal, type IcalEvent } from '@/lib/ical'

/**
 * StartPlaying is the master record for session dates (João charges players there).
 * Reads the GM iCal feed (STARTPLAYING_ICAL_URL, server-side only: the link is private)
 * and brings campaign_sessions in line. The discord_reminders.sql trigger then creates,
 * moves or cancels each session's three posts by itself.
 *
 * Rules:
 *  - an event is matched to a campaign by the campaign's startplaying_listing id anywhere in the event
 *  - new event → new session (or adopts a manual session of that campaign starting within 2h);
 *    events processed oldest first; events that ended over HISTORY_DAYS ago aren't imported
 *  - moved event → session moves (only while it hasn't started)
 *  - event marked CANCELLED, or gone from the feed while still in the future → session cancelled
 *  - session over and not cancelled → played
 *  - a feed that fails to load or parse changes nothing
 */

type Campaign = { id: string; title: string; startplaying_listing: string }
type Session = {
  id: string
  campaign_id: string
  session_number: number | null
  starts_at: string
  ends_at: string
  status: 'scheduled' | 'played' | 'cancelled'
  startplaying_uid: string | null
}

export type SyncChange =
  | { action: 'create'; campaign: string; starts_at: string; session_number: number | null }
  | { action: 'adopt' | 'move' | 'cancel' | 'restore' | 'played'; campaign: string; session: string; starts_at: string }

export type SyncResult = { ok: true; events: number; matched: number; changes: SyncChange[]; dry: boolean } | { ok: false; error: string }

const ADOPT_WINDOW_MS = 2 * 3600 * 1000
/** Past events that ended longer ago than this aren't imported (recent ones are, for recaps). */
const HISTORY_DAYS = 14

export async function fetchStartPlayingEvents(): Promise<IcalEvent[]> {
  const url = process.env.STARTPLAYING_ICAL_URL
  if (!url) throw new Error('STARTPLAYING_ICAL_URL is not set.')
  const res = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(15000) })
  if (!res.ok) throw new Error(`StartPlaying feed answered ${res.status}.`)
  return parseIcal(await res.text())
}

export async function syncStartPlaying({ dry = false, events }: { dry?: boolean; events?: IcalEvent[] } = {}): Promise<SyncResult> {
  let feed: IcalEvent[]
  try {
    feed = events ?? (await fetchStartPlayingEvents())
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Feed error' }
  }

  const db = createServerSupabase()
  const { data: cs, error: ce } = await db.from('campaigns').select('id, title, startplaying_listing').not('startplaying_listing', 'is', null)
  if (ce) return { ok: false, error: ce.message }
  const campaigns = (cs ?? []) as Campaign[]
  if (!campaigns.length) return { ok: true, events: feed.length, matched: 0, changes: [], dry }

  const { data: ss, error: se } = await db
    .from('campaign_sessions')
    .select('id, campaign_id, session_number, starts_at, ends_at, status, startplaying_uid')
    .in('campaign_id', campaigns.map((c) => c.id))
    .order('starts_at')
  if (se) return { ok: false, error: se.message }
  const sessions = (ss ?? []) as Session[]

  const now = Date.now()
  const changes: SyncChange[] = []
  const title = (id: string) => campaigns.find((c) => c.id === id)?.title ?? id
  const seen = new Set<string>()
  let matched = 0

  const write = async (fn: () => PromiseLike<{ error: { message: string } | null }>) => {
    if (dry) return null
    const { error } = await fn()
    return error?.message ?? null
  }
  const errors: string[] = []

  // Oldest first, so new sessions are numbered in date order.
  const ordered = [...feed].sort((a, b) => a.start.getTime() - b.start.getTime())
  const historyFrom = now - HISTORY_DAYS * 86400000

  for (const ev of ordered) {
    const campaign = campaigns.find((c) => ev.text.includes(c.startplaying_listing))
    if (!campaign) continue
    matched++
    seen.add(ev.uid)
    const cancelled = ev.status === 'CANCELLED'
    const startsAt = ev.start.toISOString()
    const endsAt = ev.end.toISOString()
    let s = sessions.find((x) => x.startplaying_uid === ev.uid)

    if (!s && !cancelled) {
      // A session João added by hand in Manage before the sync existed.
      s = sessions.find(
        (x) => x.campaign_id === campaign.id && !x.startplaying_uid && Math.abs(new Date(x.starts_at).getTime() - ev.start.getTime()) <= ADOPT_WINDOW_MS
      )
      if (s) {
        const sid = s.id
        s.startplaying_uid = ev.uid
        changes.push({ action: 'adopt', campaign: campaign.title, session: sid, starts_at: s.starts_at })
        const err = await write(() => db.from('campaign_sessions').update({ startplaying_uid: ev.uid, updated_at: new Date().toISOString() }).eq('id', sid))
        if (err) errors.push(err)
      }
    }

    if (!s) {
      if (cancelled) continue
      // Old history isn't worth importing: its posts can't go out any more.
      if (ev.end.getTime() < historyFrom) continue
      // Next number after the last earlier session of this campaign that wasn't cancelled; João can correct it in Clot.
      const prev = sessions.filter(
        (x) => x.campaign_id === campaign.id && x.status !== 'cancelled' && new Date(x.starts_at).getTime() < ev.start.getTime() && x.session_number != null
      )
      const number = prev.length ? Math.max(...prev.map((x) => x.session_number!)) + 1 : null
      const row = {
        campaign_id: campaign.id,
        startplaying_uid: ev.uid,
        session_number: number,
        starts_at: startsAt,
        ends_at: endsAt,
        status: ev.end.getTime() < now ? 'played' : 'scheduled',
      }
      changes.push({ action: 'create', campaign: campaign.title, starts_at: startsAt, session_number: number })
      sessions.push({ id: `new-${ev.uid}`, ...row, status: row.status as Session['status'] })
      const err = await write(() => db.from('campaign_sessions').insert(row))
      if (err) errors.push(err)
      continue
    }

    const sid = s.id
    if (cancelled) {
      if (s.status !== 'cancelled' && new Date(s.ends_at).getTime() > now) {
        changes.push({ action: 'cancel', campaign: campaign.title, session: sid, starts_at: s.starts_at })
        const err = await write(() => db.from('campaign_sessions').update({ status: 'cancelled', updated_at: new Date().toISOString() }).eq('id', sid))
        if (err) errors.push(err)
      }
      continue
    }

    const patch: Record<string, unknown> = {}
    const notStarted = new Date(s.starts_at).getTime() > now
    const moved = new Date(s.starts_at).getTime() !== ev.start.getTime() || new Date(s.ends_at).getTime() !== ev.end.getTime()
    if (notStarted && moved) {
      patch.starts_at = startsAt
      patch.ends_at = endsAt
      changes.push({ action: 'move', campaign: campaign.title, session: sid, starts_at: startsAt })
    }
    if (s.status === 'cancelled' && ev.end.getTime() > now) {
      patch.status = 'scheduled'
      changes.push({ action: 'restore', campaign: campaign.title, session: sid, starts_at: startsAt })
    }
    if (Object.keys(patch).length) {
      const err = await write(() => db.from('campaign_sessions').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', sid))
      if (err) errors.push(err)
    }
  }

  // Gone from the feed while still ahead → cancelled. Never on an empty match, so a hiccup can't cancel everything.
  if (matched > 0) {
    for (const s of sessions) {
      if (!s.startplaying_uid || seen.has(s.startplaying_uid) || s.status !== 'scheduled') continue
      if (new Date(s.starts_at).getTime() <= now) continue
      const sid = s.id
      changes.push({ action: 'cancel', campaign: title(s.campaign_id), session: sid, starts_at: s.starts_at })
      const err = await write(() => db.from('campaign_sessions').update({ status: 'cancelled', updated_at: new Date().toISOString() }).eq('id', sid))
      if (err) errors.push(err)
    }
  }

  // Over and not cancelled → played (manual sessions too).
  for (const s of sessions) {
    if (s.status !== 'scheduled' || s.id.startsWith('new-') || new Date(s.ends_at).getTime() > now) continue
    const sid = s.id
    changes.push({ action: 'played', campaign: title(s.campaign_id), session: sid, starts_at: s.starts_at })
    const err = await write(() => db.from('campaign_sessions').update({ status: 'played', updated_at: new Date().toISOString() }).eq('id', sid))
    if (err) errors.push(err)
  }

  if (errors.length) return { ok: false, error: errors.slice(0, 3).join(' · ') }
  return { ok: true, events: feed.length, matched, changes, dry }
}
