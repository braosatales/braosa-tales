import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { hubApi } from '@/lib/hub/server'
import { refreshListings, RATINGS, SAFETY_TOOLS } from '@/lib/listings'
import { onSeatsMaybeOpened } from '@/lib/seats'

type P = { params: { slug: string } }

const clean = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) || null : null)
const STATUSES = ['active', 'paused', 'finished']
const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'BRL']

const strList = (v: unknown, maxItems: number, maxLen: number) =>
  Array.isArray(v)
    ? Array.from(new Set(v.map((x) => (typeof x === 'string' ? x.trim().slice(0, maxLen) : '')).filter(Boolean))).slice(0, maxItems)
    : []

const intOrNull = (v: unknown, min: number, max: number) => {
  if (v === null || v === '' || v === undefined) return null
  const n = Math.round(Number(v))
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : null
}

function cleanActs(v: unknown) {
  if (!Array.isArray(v)) return []
  return v
    .map((a) => ({ name: clean(a?.name, 60) ?? '', levels: clean(a?.levels, 20) ?? '', summary: clean(a?.summary, 240) ?? '' }))
    .filter((a) => a.name)
    .slice(0, 8)
}

function cleanSafety(v: unknown) {
  const s = (v && typeof v === 'object' ? v : {}) as Record<string, unknown>
  return {
    rating: RATINGS.some((r) => r.value === s.rating) ? s.rating : undefined,
    tools: strList(s.tools, 12, 40).filter((t) => SAFETY_TOOLS.includes(t)),
    content: strList(s.content, 30, 40),
    lines: strList(s.lines, 40, 140),
    veils: strList(s.veils, 40, 140),
    notes: clean(s.notes, 1000) ?? undefined,
  }
}

function cleanLinks(v: unknown) {
  if (!Array.isArray(v)) return []
  return v
    .map((l) => ({ label: clean(l?.label, 40), url: clean(l?.url, 500) }))
    .filter((l): l is { label: string; url: string } => !!l.label && !!l.url && /^https?:\/\//i.test(l.url))
    .slice(0, 12)
}

// PATCH — the GM edits the campaign's details and links. The address (slug) never changes, so shared links keep working.
export async function PATCH(req: Request, { params }: P) {
  const hub = await hubApi(params.slug, { gm: true })
  if (hub instanceof NextResponse) return hub
  const b = await req.json()
  const update: Record<string, unknown> = {}
  if ('title' in b) {
    const t = clean(b.title, 80)
    if (!t) return NextResponse.json({ error: 'The campaign needs a name.' }, { status: 400 })
    update.title = t
  }
  if ('tagline' in b) update.tagline = clean(b.tagline, 140)
  if ('system' in b) update.system = clean(b.system, 60)
  if ('levels' in b) update.levels = clean(b.levels, 20)
  if ('description' in b) update.description = clean(b.description, 4000)
  if ('status' in b && STATUSES.includes(b.status)) update.status = b.status
  if ('links' in b) update.links = cleanLinks(b.links)
  // Public listing (Sessions + home cards)
  if ('listed' in b) update.listed = !!b.listed
  if ('listed_as' in b) update.listed_as = clean(b.listed_as, 120)
  if ('pitch' in b) update.pitch = clean(b.pitch, 1500)
  if ('acts' in b) update.acts = cleanActs(b.acts)
  if ('price' in b) {
    const p = b.price === '' || b.price === null ? null : Number(b.price)
    update.price = p === null || !Number.isFinite(p) ? null : Math.min(1000, Math.max(0, Math.round(p * 100) / 100))
  }
  if ('currency' in b && CURRENCIES.includes(b.currency)) update.currency = b.currency
  if ('session_length' in b) update.session_length = clean(b.session_length, 40)
  if ('frequency' in b) update.frequency = clean(b.frequency, 40)
  if ('booking_url' in b) {
    const u = clean(b.booking_url, 500)
    if (u && !/^https:\/\//i.test(u)) return NextResponse.json({ error: 'The StartPlaying link must start with https://' }, { status: 400 })
    update.booking_url = u
  }
  if ('seats_total' in b) update.seats_total = intOrNull(b.seats_total, 1, 12)
  if ('sessions_played' in b) update.sessions_played = intOrNull(b.sessions_played, 0, 9999)
  if ('safety' in b) update.safety = cleanSafety(b.safety)

  const { data, error } = await createServerSupabase().from('campaigns').update(update).eq('id', hub.campaign.id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  refreshListings()
  if ('seats_total' in b || 'status' in b) await onSeatsMaybeOpened(hub.campaign.id)
  return NextResponse.json(data)
}

// DELETE { confirm: <campaign title> } — removes the campaign and everything in its site.
export async function DELETE(req: Request, { params }: P) {
  const hub = await hubApi(params.slug, { gm: true })
  if (hub instanceof NextResponse) return hub
  const { confirm } = await req.json().catch(() => ({ confirm: '' }))
  if (String(confirm ?? '').trim() !== hub.campaign.title) {
    return NextResponse.json({ error: 'Type the campaign’s exact name to confirm.' }, { status: 400 })
  }
  const db = createServerSupabase()
  // Uploaded images: best effort, top-level folders only.
  try {
    for (const folder of ['cover', 'maps', 'portraits/lore', 'portraits/players', 'portraits/quests', 'portraits/achievements', 'misc']) {
      const prefix = `${hub.campaign.id}/${folder}`
      const { data: files } = await db.storage.from('the8adventurers').list(prefix, { limit: 1000 })
      if (files?.length) await db.storage.from('the8adventurers').remove(files.map((f) => `${prefix}/${f.name}`))
    }
  } catch {}
  // Lore, quests, characters, recaps, journals, pins, members and invites all go with it (on delete cascade).
  const { error } = await db.from('campaigns').delete().eq('id', hub.campaign.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  refreshListings()
  return NextResponse.json({ ok: true })
}
