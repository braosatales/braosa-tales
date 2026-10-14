import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { hubApi } from '@/lib/hub/server'
import { getVisiblePlayerFields } from '@/lib/hub/getVisiblePlayerFields'
import { parseDdbId, syncCharacter } from '@/lib/hub/ddb'
import { characterFields, isMember } from '@/lib/hub/characters'

type P = { params: { slug: string; id: string } }

async function load(id: string, campaignId: string) {
  const { data } = await createServerSupabase().from('the8_players').select('*').eq('id', id).eq('campaign_id', campaignId).maybeSingle()
  return data
}

export async function GET(_req: Request, { params }: P) {
  const hub = await hubApi(params.slug)
  if (hub instanceof NextResponse) return hub
  const player = await load(params.id, hub.campaign.id)
  if (!player) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (hub.gm) return NextResponse.json(player)
  const { data: secrecy } = await createServerSupabase().from('the8_player_field_secrecy').select('*').eq('player_id', params.id)
  return NextResponse.json(getVisiblePlayerFields(player, secrecy ?? [], false, hub.user.id))
}

// GM edits anything; a player edits their own character (not the GM's notes, not who plays it).
export async function PUT(req: Request, { params }: P) {
  const hub = await hubApi(params.slug)
  if (hub instanceof NextResponse) return hub
  const player = await load(params.id, hub.campaign.id)
  if (!player) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const own = player.user_id === hub.user.id
  if (!hub.gm && !own) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const update: Record<string, unknown> = characterFields(body, hub.gm)
  if (hub.gm && 'user_id' in body) {
    update.user_id = body.user_id && (await isMember(hub.campaign.id, body.user_id)) ? body.user_id : null
  }
  let resync = false
  if ('ddb' in body) {
    const ddbId = parseDdbId(body.ddb)
    if (body.ddb && !ddbId) return NextResponse.json({ error: 'That doesn’t look like a D&D Beyond character link.' }, { status: 400 })
    update.ddb_character_id = ddbId
    if (!ddbId) update.ddb_error = null
    resync = !!ddbId && ddbId !== player.ddb_character_id
  }
  if ('name' in update && !update.name) return NextResponse.json({ error: 'Name is required.' }, { status: 400 })

  const db = createServerSupabase()
  const { data, error } = await db.from('the8_players').update({ ...update, updated_at: new Date().toISOString() }).eq('id', params.id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (resync) {
    const syncError = await syncCharacter(data)
    const { data: fresh } = await db.from('the8_players').select('*').eq('id', params.id).single()
    return NextResponse.json({ ...fresh, syncError })
  }
  return NextResponse.json(data)
}

export async function DELETE(_req: Request, { params }: P) {
  const hub = await hubApi(params.slug, { gm: true })
  if (hub instanceof NextResponse) return hub
  const { error } = await createServerSupabase().from('the8_players').delete().eq('id', params.id).eq('campaign_id', hub.campaign.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
