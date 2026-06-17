import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { isAdmin } from '@/lib/the8adventurers/isAdmin'

// GET all secrecy rows for a player
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServerSupabase()
  const { data, error } = await supabase
    .from('the8_player_field_secrecy')
    .select('*')
    .eq('player_id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// PUT bulk-upsert secrecy rows — body: { secrecy: Record<fieldName, boolean> }
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!await isAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { secrecy } = await req.json() as { secrecy: Record<string, boolean> }
  const supabase = createServerSupabase()

  const rows = Object.entries(secrecy).map(([field_name, is_secret]) => ({
    player_id: params.id,
    field_name,
    is_secret,
  }))

  const { error } = await supabase
    .from('the8_player_field_secrecy')
    .upsert(rows, { onConflict: 'player_id,field_name' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
