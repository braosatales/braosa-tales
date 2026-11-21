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
  // The bridge's analysis sends the recap with analysed: true. That's Claude's version, kept apart from João's edits.
  if (b.analysed && 'recap_draft' in update) update.ai_recap = update.recap_draft
  if (!Object.keys(update).length) return NextResponse.json({ error: 'Nothing to change.' }, { status: 400 })
  update.updated_at = new Date().toISOString()

  const db = createServerSupabase()
  const { data, error } = await db.from('campaign_sessions').update(update).eq('id', params.id).select().maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'No such session.' }, { status: 404 })

  // João corrected Claude's recap: remember before → after (one row per session, kept up to date).
  if (!b.analysed && 'recap_draft' in update && data.ai_recap && data.recap_draft && data.recap_draft.trim() !== data.ai_recap.trim()) {
    try {
      const row = { campaign_id: data.campaign_id, session_id: data.id, kind: 'recap', before: data.ai_recap, after: data.recap_draft, updated_at: new Date().toISOString() }
      const { data: had } = await db.from('vor_feedback').select('id').eq('session_id', data.id).eq('kind', 'recap').maybeSingle()
      if (had) await db.from('vor_feedback').update(row).eq('id', had.id)
      else await db.from('vor_feedback').insert(row)
    } catch (e) {
      console.error('vor feedback not recorded', e)
    }
  }
  return NextResponse.json(data)
}
