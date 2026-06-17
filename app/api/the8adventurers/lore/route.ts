import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { isAdmin } from '@/lib/the8adventurers/isAdmin'

export async function GET(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')

  const supabase = createServerSupabase()
  const admin = await isAdmin()

  let query = supabase.from('the8_lore_entries').select('*').order('created_at', { ascending: false })
  if (category) query = query.eq('category', category)
  if (!admin) query = query.eq('is_secret', false)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!await isAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { category, title, content, is_secret, image_url } = await req.json()
  const supabase = createServerSupabase()

  const { data, error } = await supabase
    .from('the8_lore_entries')
    .insert({ category, title, content, is_secret: is_secret ?? true, image_url })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
