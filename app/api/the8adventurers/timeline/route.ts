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
    .from('the8_timeline_events')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (!admin) query = query.eq('is_secret', false)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!await isAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { title, description, event_date, sort_order, is_secret } = await req.json()
  const supabase = createServerSupabase()

  const { data, error } = await supabase
    .from('the8_timeline_events')
    .insert({ title, description, event_date, sort_order: sort_order ?? 0, is_secret: is_secret ?? true })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
