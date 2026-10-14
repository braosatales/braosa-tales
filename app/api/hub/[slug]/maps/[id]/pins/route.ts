import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { hubApi, idsInCampaign, ownsRow } from '@/lib/hub/server'

type P = { params: { slug: string; id: string } }

export async function GET(_req: Request, { params }: P) {
  const hub = await hubApi(params.slug)
  if (hub instanceof NextResponse) return hub
  if (!(await ownsRow('the8_maps', params.id, hub.campaign.id))) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const { data: pins, error } = await createServerSupabase().from('the8_map_pins').select('*, the8_lore_entries(*)').eq('map_id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const visible = hub.gm ? pins : (pins ?? []).filter((p) => p.the8_lore_entries && !p.the8_lore_entries.is_secret)
  return NextResponse.json(visible)
}

export async function POST(req: Request, { params }: P) {
  const hub = await hubApi(params.slug, { gm: true })
  if (hub instanceof NextResponse) return hub
  const { lore_entry_id, pos_x, pos_y } = await req.json()
  if (!(await ownsRow('the8_maps', params.id, hub.campaign.id)) || !(await ownsRow('the8_lore_entries', lore_entry_id, hub.campaign.id))) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  const { data, error } = await createServerSupabase().from('the8_map_pins').insert({ map_id: params.id, lore_entry_id, pos_x, pos_y }).select('*, the8_lore_entries(*)').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
