import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { hubApi } from '@/lib/hub/server'

type P = { params: { slug: string } }

export async function GET(_req: Request, { params }: P) {
  const hub = await hubApi(params.slug)
  if (hub instanceof NextResponse) return hub
  let query = createServerSupabase()
    .from('the8_timeline_events')
    .select('*')
    .eq('campaign_id', hub.campaign.id)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })
  if (!hub.gm) query = query.eq('is_secret', false)
  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request, { params }: P) {
  const hub = await hubApi(params.slug, { gm: true })
  if (hub instanceof NextResponse) return hub
  const { title, description, event_date, sort_order, is_secret } = await req.json()
  const { data, error } = await createServerSupabase()
    .from('the8_timeline_events')
    .insert({ campaign_id: hub.campaign.id, title, description, event_date, sort_order: sort_order ?? 0, is_secret: is_secret ?? true })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
