import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { hubApi } from '@/lib/hub/server'
import { cleanSession } from './shared'

type P = { params: { slug: string } }

// POST { starts_at, ends_at, session_number?, title? } — the GM schedules a session.
// The database then creates its three Discord messages by itself (trigger in discord_reminders.sql).
export async function POST(req: Request, { params }: P) {
  const hub = await hubApi(params.slug, { gm: true })
  if (hub instanceof NextResponse) return hub
  const s = cleanSession(await req.json().catch(() => ({})), true)
  if ('error' in s) return NextResponse.json({ error: s.error }, { status: 400 })
  const { data, error } = await createServerSupabase()
    .from('campaign_sessions')
    .insert({ ...s, campaign_id: hub.campaign.id })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
