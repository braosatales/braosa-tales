import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { createServerSupabase } from '@/lib/supabase-server'
import { TEXT_SIZE_COOKIE } from '@/lib/prefs'

// POST { confirm: "DELETE" } — permanently delete the account and everything tied to it.
// Deleting the auth user cascades to: users row, saved names, history, presets, name log,
// campaign memberships and pinned tools (all reference it with ON DELETE CASCADE).
export async function POST(req: Request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { confirm } = await req.json()
  if (confirm !== 'DELETE') return NextResponse.json({ error: 'Type DELETE to confirm.' }, { status: 400 })

  const db = createServerSupabase()

  // Data not linked by a foreign key
  const { data: files } = await db.storage.from('avatars').list(user.id)
  if (files?.length) await db.storage.from('avatars').remove(files.map((f) => `${user.id}/${f.name}`))
  await db.from('the8_session_notes').delete().eq('user_id', user.id)
  if (user.email) {
    await db.from('feedback').delete().eq('user_email', user.email)
    await db.from('campaign_invites').delete().ilike('email', user.email)
  }

  const { error } = await db.auth.admin.deleteUser(user.id)
  if (error) return NextResponse.json({ error: 'We couldn’t delete the account. Email braosa.tales@gmail.com and we’ll do it for you.' }, { status: 500 })

  const res = NextResponse.json({ ok: true })
  res.cookies.delete(TEXT_SIZE_COOKIE)
  return res
}
