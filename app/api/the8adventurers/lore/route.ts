import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { isAdmin } from '@/lib/the8adventurers/isAdmin'

export async function GET(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')

  const supabase = createServerSupabase()
  const admin = await isAdmin()

  let query = supabase
    .from('the8_lore_entries')
    .select('*')
    .order('created_at', { ascending: false })

  if (category) query = query.eq('category', category)
  if (!admin) query = query.eq('is_secret', false)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (!admin) {
    const safe = (data ?? []).map(({ gm_notes: _, ...row }) => row)
    return NextResponse.json(safe)
  }
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!await isAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { category, title, description, portrait_url, is_secret, gm_notes, preferred_habitat, faction_ids, location_ids } = await req.json()
  const supabase = createServerSupabase()

  const { data, error } = await supabase
    .from('the8_lore_entries')
    .insert({
      category,
      title,
      description: description || null,
      portrait_url: portrait_url || null,
      is_secret: is_secret ?? true,
      gm_notes: gm_notes || null,
      preferred_habitat: preferred_habitat || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (category === 'friends' || category === 'foes') {
    if (Array.isArray(faction_ids) && faction_ids.length > 0) {
      await supabase.from('the8_lore_entry_factions').insert(
        faction_ids.map((id: string) => ({ lore_entry_id: data.id, faction_entry_id: id }))
      )
    }
    if (Array.isArray(location_ids) && location_ids.length > 0) {
      await supabase.from('the8_lore_entry_locations').insert(
        location_ids.map((id: string) => ({ lore_entry_id: data.id, location_entry_id: id }))
      )
    }
  }

  return NextResponse.json(data)
}
