import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { hubApi, ownsRow } from '@/lib/hub/server'

type P = { params: { slug: string; id: string } }

export async function GET(_req: Request, { params }: P) {
  const hub = await hubApi(params.slug, { gm: true })
  if (hub instanceof NextResponse) return hub
  if (!(await ownsRow('the8_players', params.id, hub.campaign.id))) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const { data, error } = await createServerSupabase().from('the8_player_field_secrecy').select('*').eq('player_id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// PUT { secrecy: Record<fieldName, boolean> }
export async function PUT(req: Request, { params }: P) {
  const hub = await hubApi(params.slug, { gm: true })
  if (hub instanceof NextResponse) return hub
  if (!(await ownsRow('the8_players', params.id, hub.campaign.id))) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const { secrecy } = (await req.json()) as { secrecy: Record<string, boolean> }
  const rows = Object.entries(secrecy ?? {}).map(([field_name, is_secret]) => ({ player_id: params.id, field_name, is_secret: !!is_secret }))
  const { error } = await createServerSupabase().from('the8_player_field_secrecy').upsert(rows, { onConflict: 'player_id,field_name' })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
