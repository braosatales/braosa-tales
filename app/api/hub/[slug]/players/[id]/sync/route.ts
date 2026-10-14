import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { hubApi } from '@/lib/hub/server'
import { syncCharacter } from '@/lib/hub/ddb'

type P = { params: { slug: string; id: string } }

// Pull the latest from D&D Beyond now. GM, or the character's own player.
export async function POST(_req: Request, { params }: P) {
  const hub = await hubApi(params.slug)
  if (hub instanceof NextResponse) return hub
  const db = createServerSupabase()
  const { data: player } = await db.from('the8_players').select('*').eq('id', params.id).eq('campaign_id', hub.campaign.id).maybeSingle()
  if (!player) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!hub.gm && player.user_id !== hub.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  if (!player.ddb_character_id) return NextResponse.json({ error: 'No D&D Beyond character linked.' }, { status: 400 })
  const syncError = await syncCharacter(player)
  if (syncError) return NextResponse.json({ error: syncError }, { status: 502 })
  return NextResponse.json({ ok: true })
}
