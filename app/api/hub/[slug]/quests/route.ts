import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { hubApi, idsInCampaign, ownsRow } from '@/lib/hub/server'
import { QUEST_SELECT } from '@/lib/hub/quests'

type P = { params: { slug: string } }

export async function GET(_req: Request, { params }: P) {
  const hub = await hubApi(params.slug)
  if (hub instanceof NextResponse) return hub
  const { data, error } = await createServerSupabase().from('the8_quests').select(QUEST_SELECT).eq('campaign_id', hub.campaign.id).order('title')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!hub.gm) return NextResponse.json((data ?? []).filter((q) => !q.is_secret).map(({ gm_notes: _, ...row }) => row))
  return NextResponse.json(data)
}

export async function POST(req: Request, { params }: P) {
  const hub = await hubApi(params.slug, { gm: true })
  if (hub instanceof NextResponse) return hub
  const b = await req.json()
  const db = createServerSupabase()
  const cid = hub.campaign.id
  const rewardAch = b.reward_achievement_id && (await ownsRow('the8_achievements', b.reward_achievement_id, cid)) ? b.reward_achievement_id : null

  const { data: quest, error } = await db
    .from('the8_quests')
    .insert({
      campaign_id: cid,
      title: b.title,
      description: b.description || null,
      portrait_url: b.portrait_url || null,
      status: b.status ?? 'available',
      is_secret: b.is_secret ?? true,
      sort_order: b.sort_order ?? 0,
      reward_platinum: b.reward_platinum ?? 0,
      reward_gold: b.reward_gold ?? 0,
      reward_electrum: b.reward_electrum ?? 0,
      reward_silver: b.reward_silver ?? 0,
      reward_copper: b.reward_copper ?? 0,
      reward_achievement_id: rewardAch,
      reward_items: b.reward_items || null,
      reward_other: b.reward_other || null,
      gm_notes: b.gm_notes || null,
    })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const playerIds = await idsInCampaign('the8_players', b.player_ids, cid)
  const expMap = (b.exp_map ?? {}) as Record<string, number>
  if (playerIds.length) {
    await db.from('the8_quest_players').insert(playerIds.map((pid) => ({ quest_id: quest.id, player_id: pid })))
    const expRows = playerIds.filter((pid) => expMap[pid] !== undefined).map((pid) => ({ quest_id: quest.id, player_id: pid, exp_amount: expMap[pid] ?? 0 }))
    if (expRows.length) await db.from('the8_quest_exp').insert(expRows)
  }

  const { data: full } = await db.from('the8_quests').select(QUEST_SELECT).eq('id', quest.id).single()
  return NextResponse.json(full)
}
