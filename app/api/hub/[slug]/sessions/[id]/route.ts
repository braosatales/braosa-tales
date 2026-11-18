import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { hubApi } from '@/lib/hub/server'
import { cleanSession } from '../shared'

type P = { params: { slug: string; id: string } }

// PATCH — move, rename, cancel or restore a session. Its unsent Discord messages follow (trigger).
export async function PATCH(req: Request, { params }: P) {
  const hub = await hubApi(params.slug, { gm: true })
  if (hub instanceof NextResponse) return hub
  const s = cleanSession(await req.json().catch(() => ({})), false)
  if ('error' in s) return NextResponse.json({ error: s.error }, { status: 400 })
  const { data, error } = await createServerSupabase()
    .from('campaign_sessions')
    .update({ ...s, updated_at: new Date().toISOString() })
    .eq('id', params.id)
    .eq('campaign_id', hub.campaign.id)
    .select()
    .maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(data)
}
