import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { isAdmin } from '@/lib/admin'
import { uniqueSlug } from '@/lib/campaigns'
import { createServerSupabase } from '@/lib/supabase-server'

const clean = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) || null : null)

// POST { title, tagline?, system?, levels?, description? } — start a new campaign; you become its GM.
export async function POST(req: Request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!(await isAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const title = clean(body.title, 80)
  if (!title) return NextResponse.json({ error: 'Give the campaign a name.' }, { status: 400 })

  const db = createServerSupabase()
  const slug = await uniqueSlug(title)
  const { data: last } = await db.from('campaigns').select('sort_order').order('sort_order', { ascending: false }).limit(1)
  const { data: campaign, error } = await db
    .from('campaigns')
    .insert({
      slug,
      title,
      tagline: clean(body.tagline, 140),
      system: clean(body.system, 60),
      levels: clean(body.levels, 20),
      description: clean(body.description, 4000),
      hub_path: `/campaigns/${slug}`,
      sort_order: (last?.[0]?.sort_order ?? 0) + 1,
      created_by: user.id,
    })
    .select('id, slug')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { error: memberErr } = await db.from('campaign_members').insert({ campaign_id: campaign.id, user_id: user.id, role: 'gm' })
  if (memberErr) {
    await db.from('campaigns').delete().eq('id', campaign.id)
    return NextResponse.json({ error: memberErr.message }, { status: 500 })
  }
  return NextResponse.json({ slug: campaign.slug })
}
