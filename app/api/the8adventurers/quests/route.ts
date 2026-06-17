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
    .from('the8_quests')
    .select('*, the8_quest_items(*)')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const quests = admin ? data : (data ?? []).filter((q) => !q.is_secret)
  return NextResponse.json(quests)
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!await isAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { title, description, is_secret, sort_order } = await req.json()
  const supabase = createServerSupabase()

  const { data, error } = await supabase
    .from('the8_quests')
    .insert({ title, description, is_secret: is_secret ?? true, sort_order: sort_order ?? 0 })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
