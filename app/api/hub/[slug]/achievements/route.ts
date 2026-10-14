import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { hubApi, idsInCampaign, ownsRow } from '@/lib/hub/server'

type P = { params: { slug: string } }
const SEL = '*, the8_achievement_players(player_id, awarded_at)'

export async function GET(_req: Request, { params }: P) {
  const hub = await hubApi(params.slug)
  if (hub instanceof NextResponse) return hub
  let query = createServerSupabase().from('the8_achievements').select(SEL).eq('campaign_id', hub.campaign.id).order('title')
  if (!hub.gm) query = query.eq('is_secret', false)
  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!hub.gm) return NextResponse.json((data ?? []).map(({ gm_notes: _, ...row }) => row))
  return NextResponse.json(data)
}

export async function POST(req: Request, { params }: P) {
  const hub = await hubApi(params.slug, { gm: true })
  if (hub instanceof NextResponse) return hub
  const { title, description, portrait_url, unlock_text, is_secret, gm_notes, player_ids } = await req.json()
  const db = createServerSupabase()
  const cid = hub.campaign.id
  const { data: achievement, error } = await db
    .from('the8_achievements')
    .insert({ campaign_id: cid, title, description: description || null, portrait_url: portrait_url || null, unlock_text: unlock_text || null, is_secret: is_secret ?? true, gm_notes: gm_notes || null })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const ids = await idsInCampaign('the8_players', player_ids, cid)
  if (ids.length) await db.from('the8_achievement_players').insert(ids.map((pid) => ({ achievement_id: achievement.id, player_id: pid })))
  const { data: full } = await db.from('the8_achievements').select(SEL).eq('id', achievement.id).single()
  return NextResponse.json(full)
}
