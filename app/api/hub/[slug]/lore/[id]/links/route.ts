import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { hubApi, ownsRow } from '@/lib/hub/server'

type P = { params: { slug: string; id: string } }

/** GM: reveal or hide one faction/location link on an entry. Body: { kind: 'faction' | 'location', target_id, is_revealed } */
export async function PUT(req: Request, { params }: P) {
  const hub = await hubApi(params.slug, { gm: true })
  if (hub instanceof NextResponse) return hub
  const { kind, target_id, is_revealed } = await req.json()
  if ((kind !== 'faction' && kind !== 'location') || typeof target_id !== 'string') return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  if (!(await ownsRow('the8_lore_entries', params.id, hub.campaign.id))) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const table = kind === 'faction' ? 'the8_lore_entry_factions' : 'the8_lore_entry_locations'
  const col = kind === 'faction' ? 'faction_entry_id' : 'location_entry_id'
  const { error } = await createServerSupabase().from(table).update({ is_revealed: !!is_revealed }).eq('lore_entry_id', params.id).eq(col, target_id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
