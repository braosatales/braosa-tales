import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { hubApi, idsInCampaign, ownsRow } from '@/lib/hub/server'
import { QUEST_SELECT, QUEST_FIELDS, pick } from '@/lib/hub/quests'

type P = { params: { slug: string; id: string } }

export async function GET(_req: Request, { params }: P) {
  const hub = await hubApi(params.slug)
  if (hub instanceof NextResponse) return hub
  const { data, error } = await createServerSupabase().from('the8_quests').select(QUEST_SELECT).eq('id', params.id).eq('campaign_id', hub.campaign.id).single()
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
  if (!(await ownsRow('the8_quests', params.id, cid))) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const fields = pick(body, QUEST_FIELDS)
  if (fields.reward_achievement_id && !(await ownsRow('the8_achievements', String(fields.reward_achievement_id), cid))) fields.reward_achievement_id = null
  const { error } = await db.from('the8_quests').update({ ...fields, updated_at: new Date().toISOString() }).eq('id', params.id).eq('campaign_id', cid)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (body.player_ids !== undefined) {
    await db.from('the8_quest_players').delete().eq('quest_id', params.id)
    const ids = await idsInCampaign('the8_players', body.player_ids, cid)
    if (ids.length) await db.from('the8_quest_players').insert(ids.map((pid) => ({ quest_id: params.id, player_id: pid })))
  }
  if (body.exp_map !== undefined) {
    await db.from('the8_quest_exp').delete().eq('quest_id', params.id)
    const entries = Object.entries(body.exp_map as Record<string, number>).filter(([, amount]) => amount > 0)
    const valid = new Set(await idsInCampaign('the8_players', entries.map(([pid]) => pid), cid))
    const rows = entries.filter(([pid]) => valid.has(pid)).map(([pid, amount]) => ({ quest_id: params.id, player_id: pid, exp_amount: amount }))
    if (rows.length) await db.from('the8_quest_exp').insert(rows)
  }

  const { data: full } = await db.from('the8_quests').select(QUEST_SELECT).eq('id', params.id).single()
  return NextResponse.json(full)
}

export async function DELETE(_req: Request, { params }: P) {
  const hub = await hubApi(params.slug, { gm: true })
  if (hub instanceof NextResponse) return hub
  const db = createServerSupabase()
  const { error } = await db.from('the8_quests').delete().eq('id', params.id).eq('campaign_id', hub.campaign.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await db.from('campaign_pins').delete().eq('kind', 'quest').eq('item_id', params.id)
  return NextResponse.json({ ok: true })
}
