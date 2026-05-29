import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServerSupabase, getUserByClerkId } from '@/lib/supabase-server'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await getUserByClerkId(userId)
  if (!user) return NextResponse.json([])

  const supabase = createServerSupabase()
  const { data, error } = await supabase
    .from('generation_history')
    .select('*')
    .eq('user_id', user.id)
    .order('generated_at', { ascending: false })
    .limit(500)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Parse JSON string fields — Supabase stores these as strings
  const parsed = (data || []).map(entry => ({
    ...entry,
    languages: typeof entry.languages === 'string'
      ? JSON.parse(entry.languages) : entry.languages,
    themes: typeof entry.themes === 'string'
      ? JSON.parse(entry.themes) : entry.themes,
    results: typeof entry.results === 'string'
      ? JSON.parse(entry.results) : entry.results,
  }))

  return NextResponse.json(parsed)
}
