import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { hubApi } from '@/lib/hub/server'
import { hydrateLore, syncBlocks, syncLinks } from '@/lib/hub/reveal'

type P = { params: { slug: string } }

export async function GET(req: Request, { params }: P) {
  const hub = await hubApi(params.slug)
  if (hub instanceof NextResponse) return hub
  const category = new URL(req.url).searchParams.get('category')
  const db = createServerSupabase()
  let query = db.from('the8_lore_entries').select('*').eq('campaign_id', hub.campaign.id).order('title', { ascending: true })
  if (category) query = query.eq('category', category)
  if (!hub.gm) query = query.eq('is_secret', false)
  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(await hydrateLore(db, hub.campaign.id, data ?? [], hub.gm))
}

export async function POST(req: Request, { params }: P) {
  const hub = await hubApi(params.slug, { gm: true })
  if (hub instanceof NextResponse) return hub
  const { category, title, portrait_url, is_secret, gm_notes, preferred_habitat, blocks, faction_links, location_links } = await req.json()
  const db = createServerSupabase()
  const cid = hub.campaign.id

  const { data, error } = await db
    .from('the8_lore_entries')
    .insert({
      campaign_id: cid,
      category,
      title,
      portrait_url: portrait_url || null,
      is_secret: is_secret ?? true,
      gm_notes: gm_notes || null,
      preferred_habitat: preferred_habitat || null,
    })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await syncBlocks(db, cid, { lore_entry_id: data.id }, blocks)
  await syncLinks(db, cid, data.id, 'faction', faction_links)
  await syncLinks(db, cid, data.id, 'location', location_links)
  const [entry] = await hydrateLore(db, cid, [data], true)
  return NextResponse.json(entry)
}
