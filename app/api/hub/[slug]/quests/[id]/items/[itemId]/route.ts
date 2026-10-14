import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { hubApi, idsInCampaign, ownsRow } from '@/lib/hub/server'

type P = { params: { slug: string; id: string; itemId: string } }

export async function PUT(req: Request, { params }: P) {
  const hub = await hubApi(params.slug, { gm: true })
  if (hub instanceof NextResponse) return hub
  if (!(await ownsRow('the8_quests', params.id, hub.campaign.id))) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const body = await req.json()
  const update: Record<string, unknown> = {}
  if ('label' in body) update.label = body.label
  if ('is_done' in body) update.is_done = !!body.is_done
  if ('sort_order' in body) update.sort_order = body.sort_order
  const { data, error } = await createServerSupabase().from('the8_quest_items').update(update).eq('id', params.itemId).eq('quest_id', params.id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(_req: Request, { params }: P) {
  const hub = await hubApi(params.slug, { gm: true })
  if (hub instanceof NextResponse) return hub
  if (!(await ownsRow('the8_quests', params.id, hub.campaign.id))) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const { error } = await createServerSupabase().from('the8_quest_items').delete().eq('id', params.itemId).eq('quest_id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
