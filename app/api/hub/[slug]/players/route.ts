import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { hubApi } from '@/lib/hub/server'
import { getVisiblePlayerFields } from '@/lib/hub/getVisiblePlayerFields'
import { fetchDdb, parseDdbId, sheetToRow } from '@/lib/hub/ddb'
import { characterFields, isMember } from '@/lib/hub/characters'

type P = { params: { slug: string } }

export async function GET(_req: Request, { params }: P) {
  const hub = await hubApi(params.slug)
  if (hub instanceof NextResponse) return hub
  const db = createServerSupabase()
  const { data: players, error } = await db.from('the8_players').select('*').eq('campaign_id', hub.campaign.id).order('name')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (hub.gm) return NextResponse.json(players)
  const ids = (players ?? []).map((p) => p.id)
  const { data: secrecy } = ids.length ? await db.from('the8_player_field_secrecy').select('*').in('player_id', ids) : { data: [] }
  return NextResponse.json((players ?? []).map((p) => getVisiblePlayerFields(p, (secrecy ?? []).filter((r) => r.player_id === p.id), false, hub.user.id)))
}

// GM: add any character. Player: add their own (one per campaign).
export async function POST(req: Request, { params }: P) {
  const hub = await hubApi(params.slug)
  if (hub instanceof NextResponse) return hub
  const body = await req.json()
  const db = createServerSupabase()
  const cid = hub.campaign.id

  let userId: string | null = hub.gm ? body.user_id || null : hub.user.id
  if (userId && !(await isMember(cid, userId))) userId = null
  if (!hub.gm) {
    const { data: mine } = await db.from('the8_players').select('id').eq('campaign_id', cid).eq('user_id', hub.user.id).limit(1)
    if (mine?.length) return NextResponse.json({ error: 'You already have a character here.' }, { status: 400 })
  }

  const ddbId = parseDdbId(body.ddb)
  if (body.ddb && !ddbId) return NextResponse.json({ error: 'That doesn’t look like a D&D Beyond character link.' }, { status: 400 })

  let row: Record<string, unknown> = { ...characterFields(body, hub.gm), campaign_id: cid, user_id: userId, ddb_character_id: ddbId }
  if (ddbId) {
    const result = await fetchDdb(ddbId)
    if ('error' in result) {
      if (!row.name) return NextResponse.json({ error: result.error }, { status: 400 })
      row.ddb_error = result.error
    } else {
      row = { ...row, ...sheetToRow(result.sheet, (row.portrait_url as string) || null) }
    }
  }
  if (!row.name) return NextResponse.json({ error: 'Give the character a name, or a D&D Beyond link.' }, { status: 400 })

  const { data, error } = await db.from('the8_players').insert(row).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
