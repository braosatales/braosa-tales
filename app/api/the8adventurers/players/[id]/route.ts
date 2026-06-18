import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { isAdmin } from '@/lib/the8adventurers/isAdmin'
import { getVisiblePlayerFields } from '@/lib/the8adventurers/getVisiblePlayerFields'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServerSupabase()
  const admin = await isAdmin()

  const [playerResult, secrecyResult] = await Promise.all([
    supabase.from('the8_players').select('*').eq('id', params.id).single(),
    supabase.from('the8_player_field_secrecy').select('*').eq('player_id', params.id),
  ])

  if (playerResult.error) return NextResponse.json({ error: playerResult.error.message }, { status: 404 })

  const player = playerResult.data
  const secrecyRows = secrecyResult.data ?? []

  if (admin) return NextResponse.json(player)
  return NextResponse.json(getVisiblePlayerFields(player, secrecyRows, false))
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!await isAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const supabase = createServerSupabase()

  const { data, error } = await supabase
    .from('the8_players')
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!await isAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const supabase = createServerSupabase()
  const { error } = await supabase.from('the8_players').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
