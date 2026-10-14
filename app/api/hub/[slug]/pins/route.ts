import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { hubApi, ownsRow } from '@/lib/hub/server'

type P = { params: { slug: string } }
const TABLE = { lore: 'the8_lore_entries', quest: 'the8_quests' } as const

// POST { kind: 'lore' | 'quest', itemId, pinned: boolean } — pin or unpin on your campaign overview.
export async function POST(req: Request, { params }: P) {
  const hub = await hubApi(params.slug)
  if (hub instanceof NextResponse) return hub
  const { kind, itemId, pinned } = await req.json()
  if (!(kind in TABLE) || typeof itemId !== 'string') return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  const db = createServerSupabase()
  if (pinned) {
    if (!(await ownsRow(TABLE[kind as keyof typeof TABLE], itemId, hub.campaign.id))) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    await db.from('campaign_pins').upsert({ user_id: hub.user.id, campaign_id: hub.campaign.id, kind, item_id: itemId }, { onConflict: 'user_id,kind,item_id', ignoreDuplicates: true })
  } else {
    await db.from('campaign_pins').delete().eq('user_id', hub.user.id).eq('kind', kind).eq('item_id', itemId)
  }
  return NextResponse.json({ ok: true, pinned: !!pinned })
}
