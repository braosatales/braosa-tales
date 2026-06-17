import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { isAdmin } from '@/lib/the8adventurers/isAdmin'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServerSupabase()
  const { data, error } = await supabase
    .from('the8_players')
    .select('*')
    .order('name', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!await isAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const supabase = createServerSupabase()

  const { data, error } = await supabase
    .from('the8_players')
    .insert({
      name: body.name,
      portrait_url: body.portrait_url || null,
      clerk_user_id: body.clerk_user_id || null,
      level: body.level ?? null,
      class: body.class || null,
      race: body.race || null,
      background: body.background || null,
      hp_current: body.hp_current ?? null,
      hp_max: body.hp_max ?? null,
      stat_strength: body.stat_strength ?? null,
      stat_dexterity: body.stat_dexterity ?? null,
      stat_constitution: body.stat_constitution ?? null,
      stat_intelligence: body.stat_intelligence ?? null,
      stat_wisdom: body.stat_wisdom ?? null,
      stat_charisma: body.stat_charisma ?? null,
      public_notes: body.public_notes || null,
      secret_notes: body.secret_notes || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
