import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { isAdmin } from '@/lib/the8adventurers/isAdmin'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServerSupabase()
  const admin = await isAdmin()

  const [loreResult, questsResult, achievementsResult, playersResult] = await Promise.all([
    supabase
      .from('the8_lore_entries')
      .select('id, title, category, is_secret')
      .order('title', { ascending: true }),
    supabase
      .from('the8_quests')
      .select('id, title, status, is_secret')
      .order('title', { ascending: true }),
    supabase
      .from('the8_achievements')
      .select('id, title, is_secret')
      .order('title', { ascending: true }),
    supabase
      .from('the8_players')
      .select('id, name')
      .order('name', { ascending: true }),
  ])

  const results = [
    ...(loreResult.data ?? [])
      .filter((r) => admin || !r.is_secret)
      .map((r) => ({ id: r.id, type: 'lore' as const, title: r.title, category: r.category, is_secret: r.is_secret })),
    ...(questsResult.data ?? [])
      .filter((r) => admin || !r.is_secret)
      .map((r) => ({ id: r.id, type: 'quest' as const, title: r.title, status: r.status, is_secret: r.is_secret })),
    ...(achievementsResult.data ?? [])
      .filter((r) => admin || !r.is_secret)
      .map((r) => ({ id: r.id, type: 'achievement' as const, title: r.title, is_secret: r.is_secret })),
    ...(playersResult.data ?? [])
      .map((r) => ({ id: r.id, type: 'player' as const, title: r.name, is_secret: false })),
  ]

  return NextResponse.json({ results })
}
