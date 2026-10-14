import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { hubApi } from '@/lib/hub/server'

type P = { params: { slug: string; id: string } }

export async function PUT(req: Request, { params }: P) {
  const hub = await hubApi(params.slug, { gm: true })
  if (hub instanceof NextResponse) return hub
  const { title, description, event_date, sort_order, is_secret } = await req.json()
  const { data, error } = await createServerSupabase()
    .from('the8_timeline_events')
    .update({ title, description, event_date, sort_order, is_secret, updated_at: new Date().toISOString() })
    .eq('id', params.id)
    .eq('campaign_id', hub.campaign.id)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(_req: Request, { params }: P) {
  const hub = await hubApi(params.slug, { gm: true })
  if (hub instanceof NextResponse) return hub
  const { error } = await createServerSupabase().from('the8_timeline_events').delete().eq('id', params.id).eq('campaign_id', hub.campaign.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
