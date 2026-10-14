import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { hubApi } from '@/lib/hub/server'

type P = { params: { slug: string } }

const clean = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) || null : null)
const STATUSES = ['active', 'paused', 'finished']

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
  const { data, error } = await createServerSupabase().from('campaigns').update(update).eq('id', hub.campaign.id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
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
  return NextResponse.json({ ok: true })
}
