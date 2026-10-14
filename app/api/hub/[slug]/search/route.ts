import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { hubApi } from '@/lib/hub/server'

type P = { params: { slug: string } }

export async function GET(_req: Request, { params }: P) {
  const hub = await hubApi(params.slug)
  if (hub instanceof NextResponse) return hub
  const db = createServerSupabase()
  const cid = hub.campaign.id
  const gm = hub.gm

  const [lore, quests, achievements, players] = await Promise.all([
    db.from('the8_lore_entries').select('id, title, category, is_secret').eq('campaign_id', cid).order('title'),
    db.from('the8_quests').select('id, title, status, is_secret').eq('campaign_id', cid).order('title'),
    db.from('the8_achievements').select('id, title, is_secret').eq('campaign_id', cid).order('title'),
    db.from('the8_players').select('id, name').eq('campaign_id', cid).order('name'),
  ])

  const results = [
    ...(lore.data ?? []).filter((r) => gm || !r.is_secret).map((r) => ({ id: r.id, type: 'lore' as const, title: r.title, category: r.category, is_secret: r.is_secret })),
    ...(quests.data ?? []).filter((r) => gm || !r.is_secret).map((r) => ({ id: r.id, type: 'quest' as const, title: r.title, status: r.status, is_secret: r.is_secret })),
    ...(achievements.data ?? []).filter((r) => gm || !r.is_secret).map((r) => ({ id: r.id, type: 'achievement' as const, title: r.title, is_secret: r.is_secret })),
    ...(players.data ?? []).map((r) => ({ id: r.id, type: 'player' as const, title: r.name, is_secret: false })),
  ]
  return NextResponse.json({ results })
}
