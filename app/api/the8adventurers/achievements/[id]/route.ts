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
    .from('the8_achievements')
    .select('*, the8_achievement_players(player_id, awarded_at)')
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
  const { player_ids, ...fields } = body

  const supabase = createServerSupabase()

  const { error } = await supabase
    .from('the8_achievements')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (player_ids !== undefined) {
    await supabase.from('the8_achievement_players').delete().eq('achievement_id', params.id)
    if (player_ids.length > 0) {
      await supabase.from('the8_achievement_players').insert(
        player_ids.map((pid: string) => ({ achievement_id: params.id, player_id: pid }))
      )
    }
  }

  const { data: full } = await supabase
    .from('the8_achievements')
    .select('*, the8_achievement_players(player_id, awarded_at)')
    .eq('id', params.id)
    .single()

  return NextResponse.json(full)
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!await isAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const supabase = createServerSupabase()
  const { error } = await supabase.from('the8_achievements').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
