import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { createServerSupabase } from '@/lib/supabase-server'

// PATCH { displayName } — the name shown across Braosa Tales
export async function PATCH(req: Request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { displayName } = await req.json()
  const name = String(displayName ?? '').trim().replace(/\s+/g, ' ')
  if (!name || name.length > 60) return NextResponse.json({ error: 'Use a name between 1 and 60 characters.' }, { status: 400 })

  const db = createServerSupabase()
  const { error } = await db.auth.admin.updateUserById(user.id, {
    user_metadata: { ...(user.user_metadata ?? {}), display_name: name },
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await db.from('users').update({ full_name: name }).eq('id', user.id)
  return NextResponse.json({ ok: true, displayName: name })
}
