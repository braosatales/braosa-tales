import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { hubApi, idsInCampaign, ownsRow } from '@/lib/hub/server'

type P = { params: { slug: string; id: string; pinId: string } }

export async function DELETE(_req: Request, { params }: P) {
  const hub = await hubApi(params.slug, { gm: true })
  if (hub instanceof NextResponse) return hub
  if (!(await ownsRow('the8_maps', params.id, hub.campaign.id))) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const { error } = await createServerSupabase().from('the8_map_pins').delete().eq('id', params.pinId).eq('map_id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
