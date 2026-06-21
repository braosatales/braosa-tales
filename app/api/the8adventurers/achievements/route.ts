import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { isAdmin } from '@/lib/the8adventurers/isAdmin'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServerSupabase()
  const admin = await isAdmin()

  let query = supabase
    .from('the8_achievements')
    .select('*, the8_achievement_players(player_id, awarded_at)')
    .order('title', { ascending: true })

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

  const { title, description, portrait_url, unlock_text, is_secret, gm_notes, player_ids = [] } = await req.json()
  const supabase = createServerSupabase()

  const { data: achievement, error } = await supabase
    .from('the8_achievements')
    .insert({
      title,
      description: description || null,
      portrait_url: portrait_url || null,
      unlock_text: unlock_text || null,
      is_secret: is_secret ?? true,
      gm_notes: gm_notes || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (player_ids.length > 0) {
    await supabase.from('the8_achievement_players').insert(
      player_ids.map((pid: string) => ({ achievement_id: achievement.id, player_id: pid }))
    )
  }

  const { data: full } = await supabase
    .from('the8_achievements')
    .select('*, the8_achievement_players(player_id, awarded_at)')
    .eq('id', achievement.id)
    .single()

  return NextResponse.json(full)
}
