import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { hubApi } from '@/lib/hub/server'

type P = { params: { slug: string } }

// POST { kind: 'line' | 'veil' | 'other', body } — a player privately tells the GM about a line or veil.
// No name or account is stored with it, so the GM can't see who sent it.
export async function POST(req: Request, { params }: P) {
  const hub = await hubApi(params.slug)
  if (hub instanceof NextResponse) return hub
  const { kind, body } = await req.json().catch(() => ({}))
  const text = String(body ?? '').trim().slice(0, 500)
  if (!['line', 'veil', 'other'].includes(kind) || !text) return NextResponse.json({ error: 'Write something first.' }, { status: 400 })
  const { error } = await createServerSupabase().from('campaign_safety_notes').insert({ campaign_id: hub.campaign.id, kind, body: text })
  if (error) return NextResponse.json({ error: 'That didn’t go through. Try again.' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
