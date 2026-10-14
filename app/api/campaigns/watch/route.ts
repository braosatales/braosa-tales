import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { createServerSupabase } from '@/lib/supabase-server'

const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s) && s.length <= 254

// POST { slug, email? } — "tell me when a seat opens". Signed-in people can leave out the email.
export async function POST(req: Request) {
  const { slug, email: raw } = await req.json().catch(() => ({}))
  const user = await getAuthUser()
  const email = String(raw || user?.email || '').trim().toLowerCase()
  if (!isEmail(email)) return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })

  const db = createServerSupabase()
  const { data: c } = await db.from('campaigns').select('id').eq('slug', String(slug ?? '')).eq('listed', true).maybeSingle()
  if (!c) return NextResponse.json({ error: 'Campaign not found.' }, { status: 404 })

  // Re-following after an earlier email puts you back on the list.
  const { error } = await db
    .from('campaign_seat_watchers')
    .upsert({ campaign_id: c.id, email, user_id: user?.id ?? null, notified_at: null }, { onConflict: 'campaign_id,email' })
  if (error) return NextResponse.json({ error: 'That didn’t go through. Try again.' }, { status: 500 })
  return NextResponse.json({ ok: true, email })
}
