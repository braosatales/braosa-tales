import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { hubApi } from '@/lib/hub/server'
import { idsInCampaign } from '@/lib/hub/server'

type P = { params: { slug: string; id: string } }

const EDITABLE = ['category', 'title', 'description', 'portrait_url', 'is_secret', 'gm_notes', 'preferred_habitat'] as const

export async function GET(_req: Request, { params }: P) {
  const hub = await hubApi(params.slug)
  if (hub instanceof NextResponse) return hub
  const { data, error } = await createServerSupabase().from('the8_lore_entries').select('*').eq('id', params.id).eq('campaign_id', hub.campaign.id).single()
  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!hub.gm) {
    if (data.is_secret) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const { gm_notes: _, ...safe } = data
    return NextResponse.json(safe)
  }
  return NextResponse.json(data)
}

export async function PUT(req: Request, { params }: P) {
  const hub = await hubApi(params.slug, { gm: true })
  if (hub instanceof NextResponse) return hub
  const body = await req.json()
  const { faction_ids, location_ids } = body
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
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (faction_ids !== undefined) {
    await db.from('the8_lore_entry_factions').delete().eq('lore_entry_id', params.id)
    const ids = await idsInCampaign('the8_lore_entries', faction_ids, cid)
    if (ids.length) await db.from('the8_lore_entry_factions').insert(ids.map((id) => ({ lore_entry_id: params.id, faction_entry_id: id })))
  }
  if (location_ids !== undefined) {
    await db.from('the8_lore_entry_locations').delete().eq('lore_entry_id', params.id)
    const ids = await idsInCampaign('the8_lore_entries', location_ids, cid)
    if (ids.length) await db.from('the8_lore_entry_locations').insert(ids.map((id) => ({ lore_entry_id: params.id, location_entry_id: id })))
  }
  return NextResponse.json(data)
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
