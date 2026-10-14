import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { createServerSupabase } from '@/lib/supabase-server'
import { TEXT_SIZE_COOKIE, isTextSize } from '@/lib/prefs'

// PATCH { textSize } — saved on the account and in a cookie (so the size applies before the page draws)
export async function PATCH(req: Request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { textSize } = await req.json()
  if (!isTextSize(textSize)) return NextResponse.json({ error: 'Unknown text size' }, { status: 400 })

  const db = createServerSupabase()
  const { data: row } = await db.from('users').select('preferences').eq('id', user.id).maybeSingle()
  const preferences = { ...((row?.preferences as Record<string, unknown>) ?? {}), textSize }
  await db.from('users').update({ preferences }).eq('id', user.id)

  const res = NextResponse.json({ ok: true })
  res.cookies.set(TEXT_SIZE_COOKIE, textSize, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' })
  return res
}
