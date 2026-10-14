import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { hubApi, idsInCampaign, ownsRow } from '@/lib/hub/server'

type P = { params: { slug: string; id: string } }

export async function POST(req: Request, { params }: P) {
  const hub = await hubApi(params.slug, { gm: true })
  if (hub instanceof NextResponse) return hub
  if (!(await ownsRow('the8_quests', params.id, hub.campaign.id))) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const { label, sort_order } = await req.json()
  const { data, error } = await createServerSupabase().from('the8_quest_items').insert({ quest_id: params.id, label, sort_order: sort_order ?? 0 }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
