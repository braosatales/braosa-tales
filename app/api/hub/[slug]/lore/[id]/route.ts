import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { hubApi } from '@/lib/hub/server'
import { hydrateLore, syncBlocks, syncLinks } from '@/lib/hub/reveal'

type P = { params: { slug: string; id: string } }

const EDITABLE = ['category', 'title', 'portrait_url', 'is_secret', 'gm_notes', 'preferred_habitat'] as const

export async function GET(_req: Request, { params }: P) {
  const hub = await hubApi(params.slug)
  if (hub instanceof NextResponse) return hub
  const db = createServerSupabase()
  const { data, error } = await db.from('the8_lore_entries').select('*').eq('id', params.id).eq('campaign_id', hub.campaign.id).single()
  if (error || !data || (!hub.gm && data.is_secret)) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const [entry] = await hydrateLore(db, hub.campaign.id, [data], hub.gm)
  return NextResponse.json(entry)
}

export async function PUT(req: Request, { params }: P) {
  const hub = await hubApi(params.slug, { gm: true })
  if (hub instanceof NextResponse) return hub
  const body = await req.json()
  const fields = Object.fromEntries(EDITABLE.filter((k) => k in body).map((k) => [k, body[k]]))
  const db = createServerSupabase()
  const cid = hub.campaign.id

  const { data, error } = await db
    .from('the8_lore_entries')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', params.id)
    .eq('campaign_id', cid)
    .select()
    .single()
  if (error || !data) return NextResponse.json({ error: error?.message ?? 'Not found' }, { status: error ? 500 : 404 })

  await syncBlocks(db, cid, { lore_entry_id: params.id }, body.blocks)
  await syncLinks(db, cid, params.id, 'faction', body.faction_links)
  await syncLinks(db, cid, params.id, 'location', body.location_links)
  const [entry] = await hydrateLore(db, cid, [data], true)
  return NextResponse.json(entry)
}

export async function DELETE(_req: Request, { params }: P) {
  const hub = await hubApi(params.slug, { gm: true })
  if (hub instanceof NextResponse) return hub
  const db = createServerSupabase()
  const { error } = await db.from('the8_lore_entries').delete().eq('id', params.id).eq('campaign_id', hub.campaign.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await db.from('campaign_pins').delete().eq('kind', 'lore').eq('item_id', params.id)
  return NextResponse.json({ ok: true })
}
