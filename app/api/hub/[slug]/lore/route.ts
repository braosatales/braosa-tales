import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { hubApi } from '@/lib/hub/server'
import { idsInCampaign } from '@/lib/hub/server'

type P = { params: { slug: string } }

export async function GET(req: Request, { params }: P) {
  const hub = await hubApi(params.slug)
  if (hub instanceof NextResponse) return hub
  const category = new URL(req.url).searchParams.get('category')
  let query = createServerSupabase().from('the8_lore_entries').select('*').eq('campaign_id', hub.campaign.id).order('title', { ascending: true })
  if (category) query = query.eq('category', category)
  if (!hub.gm) query = query.eq('is_secret', false)
  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!hub.gm) return NextResponse.json((data ?? []).map(({ gm_notes: _, ...row }) => row))
  return NextResponse.json(data)
}

export async function POST(req: Request, { params }: P) {
  const hub = await hubApi(params.slug, { gm: true })
  if (hub instanceof NextResponse) return hub
  const { category, title, description, portrait_url, is_secret, gm_notes, preferred_habitat, faction_ids, location_ids } = await req.json()
  const db = createServerSupabase()
  const cid = hub.campaign.id

  const { data, error } = await db
    .from('the8_lore_entries')
    .insert({
      campaign_id: cid,
      category,
      title,
      description: description || null,
      portrait_url: portrait_url || null,
      is_secret: is_secret ?? true,
      gm_notes: gm_notes || null,
      preferred_habitat: preferred_habitat || null,
    })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (category === 'friends' || category === 'foes') {
    const factions = await idsInCampaign('the8_lore_entries', faction_ids, cid)
    const locations = await idsInCampaign('the8_lore_entries', location_ids, cid)
    if (factions.length) await db.from('the8_lore_entry_factions').insert(factions.map((id) => ({ lore_entry_id: data.id, faction_entry_id: id })))
    if (locations.length) await db.from('the8_lore_entry_locations').insert(locations.map((id) => ({ lore_entry_id: data.id, location_entry_id: id })))
  }
  return NextResponse.json(data)
}
