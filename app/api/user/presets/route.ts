import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase, getUserByClerkId } from '@/lib/supabase-server'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await getUserByClerkId(userId)
  if (!user) return NextResponse.json([])

  const supabase = createServerSupabase()
  const { data } = await supabase
    .from('presets')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return NextResponse.json(data || [])
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await getUserByClerkId(userId)
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { name, settings, favourite } = await req.json()

  const supabase = createServerSupabase()
  const { data, error } = await supabase
    .from('presets')
    .insert({ user_id: user.id, name, settings, favourite: favourite || false })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await getUserByClerkId(userId)
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { id, favourite } = await req.json()
  const supabase = createServerSupabase()

  await supabase
    .from('presets')
    .update({ favourite: false })
    .eq('user_id', user.id)

  if (favourite) {
    await supabase
      .from('presets')
      .update({ favourite: true })
      .eq('id', id)
      .eq('user_id', user.id)
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await getUserByClerkId(userId)
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const supabase = createServerSupabase()
  await supabase.from('presets').delete().eq('id', id).eq('user_id', user.id)

  return NextResponse.json({ success: true })
}
