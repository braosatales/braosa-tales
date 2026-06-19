import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { isAdmin } from '@/lib/the8adventurers/isAdmin'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServerSupabase()
  const admin = await isAdmin()

  const { data, error } = await supabase
    .from('the8_lore_entries')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })

  if (!admin) {
    if (data.is_secret) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const { gm_notes: _, ...safe } = data
    return NextResponse.json(safe)
  }
  return NextResponse.json(data)
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!await isAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { faction_ids, location_ids, ...updateFields } = body
  const supabase = createServerSupabase()

  const { data, error } = await supabase
    .from('the8_lore_entries')
    .update({ ...updateFields, updated_at: new Date().toISOString() })
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Sync junction tables if faction_ids or location_ids are provided
  if (faction_ids !== undefined) {
    await supabase.from('the8_lore_entry_factions').delete().eq('lore_entry_id', params.id)
    if (Array.isArray(faction_ids) && faction_ids.length > 0) {
      await supabase.from('the8_lore_entry_factions').insert(
        faction_ids.map((id: string) => ({ lore_entry_id: params.id, faction_entry_id: id }))
      )
    }
  }
  if (location_ids !== undefined) {
    await supabase.from('the8_lore_entry_locations').delete().eq('lore_entry_id', params.id)
    if (Array.isArray(location_ids) && location_ids.length > 0) {
      await supabase.from('the8_lore_entry_locations').insert(
        location_ids.map((id: string) => ({ lore_entry_id: params.id, location_entry_id: id }))
      )
    }
  }

  return NextResponse.json(data)
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!await isAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const supabase = createServerSupabase()
  const { error } = await supabase.from('the8_lore_entries').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
