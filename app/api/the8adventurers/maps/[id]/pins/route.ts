import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { isAdmin } from '@/lib/the8adventurers/isAdmin'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServerSupabase()
  const admin = await isAdmin()

  const { data: pins, error } = await supabase
    .from('the8_map_pins')
    .select('*, the8_lore_entries(*)')
    .eq('map_id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const visible = admin
    ? pins
    : (pins ?? []).filter((p) => p.the8_lore_entries && !p.the8_lore_entries.is_secret)

  return NextResponse.json(visible)
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!await isAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { lore_entry_id, pos_x, pos_y } = await req.json()
  const supabase = createServerSupabase()

  const { data, error } = await supabase
    .from('the8_map_pins')
    .insert({ map_id: params.id, lore_entry_id, pos_x, pos_y })
    .select('*, the8_lore_entries(*)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
