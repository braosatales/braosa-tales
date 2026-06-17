import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { isAdmin } from '@/lib/the8adventurers/isAdmin'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServerSupabase()
  const admin = await isAdmin()

  const { data, error } = await supabase
    .from('the8_quests')
    .select('*, the8_quest_items(*), the8_quest_players(player_id), the8_quest_exp(player_id, exp_amount)')
    .order('sort_order', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const quests = admin ? data : (data ?? []).filter((q) => !q.is_secret)
  return NextResponse.json(quests)
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!await isAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const {
    title, description, portrait_url, status, is_secret, sort_order,
    reward_platinum, reward_gold, reward_electrum, reward_silver, reward_copper,
    reward_achievement_id, reward_items, reward_other,
    player_ids = [], exp_map = {},
  } = body

  const supabase = createServerSupabase()

  const { data: quest, error } = await supabase
    .from('the8_quests')
    .insert({
      title, description: description || null, portrait_url: portrait_url || null,
      status: status ?? 'available', is_secret: is_secret ?? true, sort_order: sort_order ?? 0,
      reward_platinum: reward_platinum ?? 0, reward_gold: reward_gold ?? 0,
      reward_electrum: reward_electrum ?? 0, reward_silver: reward_silver ?? 0,
      reward_copper: reward_copper ?? 0,
      reward_achievement_id: reward_achievement_id || null,
      reward_items: reward_items || null, reward_other: reward_other || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (player_ids.length > 0) {
    await supabase.from('the8_quest_players').insert(
      player_ids.map((pid: string) => ({ quest_id: quest.id, player_id: pid }))
    )
    const expRows = player_ids
      .filter((pid: string) => exp_map[pid] !== undefined)
      .map((pid: string) => ({ quest_id: quest.id, player_id: pid, exp_amount: exp_map[pid] ?? 0 }))
    if (expRows.length > 0) await supabase.from('the8_quest_exp').insert(expRows)
  }

  const { data: full } = await supabase
    .from('the8_quests')
    .select('*, the8_quest_items(*), the8_quest_players(player_id), the8_quest_exp(player_id, exp_amount)')
    .eq('id', quest.id)
    .single()

  return NextResponse.json(full)
}
