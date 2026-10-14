import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { hubApi } from '@/lib/hub/server'

type P = { params: { slug: string } }

export async function GET(_req: Request, { params }: P) {
  const hub = await hubApi(params.slug)
  if (hub instanceof NextResponse) return hub
  const { data, error } = await createServerSupabase()
    .from('the8_session_recaps')
    .select('*')
    .eq('campaign_id', hub.campaign.id)
    .order('session_number', { ascending: false, nullsFirst: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request, { params }: P) {
  const hub = await hubApi(params.slug, { gm: true })
  if (hub instanceof NextResponse) return hub
  const { session_number, title, content, session_date } = await req.json()
  const { data, error } = await createServerSupabase()
    .from('the8_session_recaps')
    .insert({ campaign_id: hub.campaign.id, session_number, title, content, session_date: session_date || null })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
