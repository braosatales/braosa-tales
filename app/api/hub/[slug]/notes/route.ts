import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { hubApi } from '@/lib/hub/server'

type P = { params: { slug: string } }

// Each person's private journal for this campaign.
export async function GET(_req: Request, { params }: P) {
  const hub = await hubApi(params.slug)
  if (hub instanceof NextResponse) return hub
  const { data } = await createServerSupabase()
    .from('the8_session_notes')
    .select('*')
    .eq('campaign_id', hub.campaign.id)
    .eq('user_id', hub.user.id)
    .maybeSingle()
  return NextResponse.json(data)
}

export async function PUT(req: Request, { params }: P) {
  const hub = await hubApi(params.slug)
  if (hub instanceof NextResponse) return hub
  const { content } = await req.json()
  const { data, error } = await createServerSupabase()
    .from('the8_session_notes')
    .upsert(
      { campaign_id: hub.campaign.id, user_id: hub.user.id, content, updated_at: new Date().toISOString() },
      { onConflict: 'campaign_id,user_id' }
    )
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
