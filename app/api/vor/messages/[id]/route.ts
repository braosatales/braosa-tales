import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { MAX_POST_LENGTH, vorUnauthorized } from '@/lib/vor-api'

export const dynamic = 'force-dynamic'

type P = { params: { id: string } }
type Action = 'draft' | 'edit' | 'approve' | 'unapprove' | 'request_changes' | 'skip' | 'unskip'
const ACTIONS: Action[] = ['draft', 'edit', 'approve', 'unapprove', 'request_changes', 'skip', 'unskip']

/**
 * PATCH { action, content?, note? }
 *  draft            Claude's (re)draft from the bridge: sets the text, clears the change request, back to draft
 *  edit             João's own edit: sets the text, back to draft (approve separately, or in the same call with approve)
 *  approve          optional `content` first; approves the text as it stands
 *  unapprove        back to draft
 *  request_changes  `note` = what to change; back to draft; the bridge redrafts
 *  skip             nothing goes out for this post, not even the fixed text
 *  unskip           back to draft (only while it's not past its send time's expiry)
 * Only posts that haven't gone out can change.
 */
export async function PATCH(req: Request, { params }: P) {
  const denied = vorUnauthorized(req)
  if (denied) return denied
  const b = await req.json().catch(() => ({}))
  const action = b.action as Action
  if (!ACTIONS.includes(action)) return NextResponse.json({ error: 'Unknown action.' }, { status: 400 })

  const db = createServerSupabase()
  const { data: cur, error: ge } = await db
    .from('discord_messages')
    .select('id, status, kind, campaign_id, session_id, draft_content, ai_draft, expires_at')
    .eq('id', params.id)
    .maybeSingle()
  if (ge) return NextResponse.json({ error: ge.message }, { status: 500 })
  if (!cur) return NextResponse.json({ error: 'No such post.' }, { status: 404 })

  const open = ['draft', 'approved']
  const from = action === 'unskip' ? ['skipped'] : open
  if (!from.includes(cur.status)) {
    return NextResponse.json({ error: cur.status === 'skipped' ? 'This post was skipped. Unskip it first.' : 'This post has already gone out, or was cancelled.' }, { status: 409 })
  }
  if (action === 'unskip' && cur.expires_at && new Date(cur.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Too late: this post has expired.' }, { status: 409 })
  }

  const now = new Date().toISOString()
  const update: Record<string, unknown> = { updated_at: now }
  const toDraft = { status: 'draft', approved_at: null, approved_by: null }

  if ('content' in b) {
    const t = typeof b.content === 'string' ? b.content.trim() : ''
    if (t.length > MAX_POST_LENGTH) return NextResponse.json({ error: `Keep it under ${MAX_POST_LENGTH} characters.` }, { status: 400 })
    if (!t && action !== 'edit') return NextResponse.json({ error: 'The post is empty.' }, { status: 400 })
    update.draft_content = t || null
  }
  const text = 'draft_content' in update ? (update.draft_content as string | null) : cur.draft_content

  switch (action) {
    case 'draft':
      if (!('content' in b)) return NextResponse.json({ error: 'A draft needs content.' }, { status: 400 })
      // Claude's own version is kept apart, so João's edits can be compared with it later.
      Object.assign(update, toDraft, { change_request: null, drafted_at: now, notified_at: null, ai_draft: text })
      break
    case 'edit':
      Object.assign(update, toDraft)
      break
    case 'approve':
      if (!text) return NextResponse.json({ error: 'Write the post before approving it.' }, { status: 400 })
      Object.assign(update, { status: 'approved', approved_at: now, approved_by: process.env.VOR_OWNER_USER_ID || null, change_request: null })
      break
    case 'unapprove':
      Object.assign(update, toDraft)
      break
    case 'request_changes': {
      const note = typeof b.note === 'string' ? b.note.trim().slice(0, 2000) : ''
      if (!note) return NextResponse.json({ error: 'Say what to change.' }, { status: 400 })
      Object.assign(update, toDraft, { change_request: note })
      break
    }
    case 'skip':
      Object.assign(update, { status: 'skipped', approved_at: null, approved_by: null, last_error: 'Skipped by João.' })
      break
    case 'unskip':
      Object.assign(update, toDraft, { last_error: null })
      break
  }

  const { data, error } = await db.from('discord_messages').update(update).eq('id', params.id).eq('status', cur.status).select().maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'It changed meanwhile (maybe it just went out). Refresh.' }, { status: 409 })
  await recordFeedback(db, cur, action, text, b.note)
  return NextResponse.json(data)
}

/**
 * What Vôr learns from: João's edits to Claude's text (before → after, one row per post, kept up to date)
 * and each "what should change" note. Never blocks the action itself.
 */
async function recordFeedback(
  db: ReturnType<typeof createServerSupabase>,
  cur: { id: string; kind: string; campaign_id: string; session_id: string | null; draft_content: string | null; ai_draft: string | null },
  action: Action,
  text: string | null,
  note: unknown
) {
  const base = { campaign_id: cur.campaign_id, session_id: cur.session_id, message_id: cur.id, kind: cur.kind }
  try {
    if (action === 'request_changes' && typeof note === 'string' && note.trim()) {
      await db.from('vor_feedback').insert({ ...base, before: cur.draft_content, note: note.trim().slice(0, 2000) })
    } else if ((action === 'edit' || action === 'approve') && cur.ai_draft && text && text.trim() !== cur.ai_draft.trim()) {
      const row = { ...base, before: cur.ai_draft, after: text, updated_at: new Date().toISOString() }
      const { data: had } = await db.from('vor_feedback').select('id').eq('message_id', cur.id).is('note', null).maybeSingle()
      if (had) await db.from('vor_feedback').update(row).eq('id', had.id)
      else await db.from('vor_feedback').insert(row)
    }
  } catch (e) {
    console.error('vor feedback not recorded', e)
  }
}
