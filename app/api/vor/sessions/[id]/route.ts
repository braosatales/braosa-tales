import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { vorUnauthorized } from '@/lib/vor-api'

export const dynamic = 'force-dynamic'

type P = { params: { id: string } }

// PATCH { session_number?, title?, recap_draft?, analysed? } — dates and status come from StartPlaying, not from here.
export async function PATCH(req: Request, { params }: P) {
  const denied = vorUnauthorized(req)
  if (denied) return denied
  const b = await req.json().catch(() => ({}))
  const update: Record<string, unknown> = {}
  if ('session_number' in b) {
    const n = b.session_number == null || b.session_number === '' ? null : Math.round(Number(b.session_number))
    if (n != null && !(Number.isFinite(n) && n > 0 && n < 10000)) return NextResponse.json({ error: 'Session number must be 1 or more.' }, { status: 400 })
    update.session_number = n
  }
  if ('title' in b) update.title = typeof b.title === 'string' ? b.title.trim().slice(0, 120) || null : null
  if ('recap_draft' in b) update.recap_draft = typeof b.recap_draft === 'string' ? b.recap_draft.trim().slice(0, 200000) || null : null
  if ('analysed' in b) update.analysed_at = b.analysed ? new Date().toISOString() : null
  if (!Object.keys(update).length) return NextResponse.json({ error: 'Nothing to change.' }, { status: 400 })
  update.updated_at = new Date().toISOString()

  const { data, error } = await createServerSupabase().from('campaign_sessions').update(update).eq('id', params.id).select().maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'No such session.' }, { status: 404 })
  return NextResponse.json(data)
}
