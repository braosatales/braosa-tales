import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { hubApi, idsInCampaign, ownsRow } from '@/lib/hub/server'

type P = { params: { slug: string; id: string } }
const SEL = '*, the8_achievement_players(player_id, awarded_at)'
const FIELDS = ['title', 'description', 'portrait_url', 'unlock_text', 'is_secret', 'gm_notes'] as const

export async function GET(_req: Request, { params }: P) {
  const hub = await hubApi(params.slug)
  if (hub instanceof NextResponse) return hub
  const { data, error } = await createServerSupabase().from('the8_achievements').select(SEL).eq('id', params.id).eq('campaign_id', hub.campaign.id).single()
  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!hub.gm) {
    if (data.is_secret) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const { gm_notes: _, ...safe } = data
    return NextResponse.json(safe)
  }
  return NextResponse.json(data)
}

export async function PUT(req: Request, { params }: P) {
  const hub = await hubApi(params.slug, { gm: true })
  if (hub instanceof NextResponse) return hub
  const body = await req.json()
  const db = createServerSupabase()
  const cid = hub.campaign.id
  if (!(await ownsRow('the8_achievements', params.id, cid))) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const fields = Object.fromEntries(FIELDS.filter((k) => k in body).map((k) => [k, body[k]]))
  const { error } = await db.from('the8_achievements').update({ ...fields, updated_at: new Date().toISOString() }).eq('id', params.id).eq('campaign_id', cid)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (body.player_ids !== undefined) {
    await db.from('the8_achievement_players').delete().eq('achievement_id', params.id)
    const ids = await idsInCampaign('the8_players', body.player_ids, cid)
    if (ids.length) await db.from('the8_achievement_players').insert(ids.map((pid) => ({ achievement_id: params.id, player_id: pid })))
  }
  const { data: full } = await db.from('the8_achievements').select(SEL).eq('id', params.id).single()
  return NextResponse.json(full)
}

export async function DELETE(_req: Request, { params }: P) {
  const hub = await hubApi(params.slug, { gm: true })
  if (hub instanceof NextResponse) return hub
  const { error } = await createServerSupabase().from('the8_achievements').delete().eq('id', params.id).eq('campaign_id', hub.campaign.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
