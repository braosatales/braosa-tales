import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServerSupabase()
  const { data } = await supabase
    .from('the8_session_notes')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  return NextResponse.json(data)
}

export async function PUT(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { content } = await req.json()
  const supabase = createServerSupabase()

  const { data, error } = await supabase
    .from('the8_session_notes')
    .upsert(
      { user_id: userId, content, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
