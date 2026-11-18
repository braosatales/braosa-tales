import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { hubApi } from '@/lib/hub/server'

type P = { params: { slug: string; id: string } }

// PATCH { draft_content?, approved } — the GM edits a queued message and approves it (or takes the approval back).
// Only messages that haven't gone out can change. Editing always needs `approved` to say what the GM wants.
export async function PATCH(req: Request, { params }: P) {
  const hub = await hubApi(params.slug, { gm: true })
  if (hub instanceof NextResponse) return hub
  const b = await req.json().catch(() => ({}))
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if ('draft_content' in b) {
    const t = typeof b.draft_content === 'string' ? b.draft_content.trim() : ''
    if (t.length > 1900) return NextResponse.json({ error: 'Discord messages stop at 2000 characters; keep it under 1900.' }, { status: 400 })
    update.draft_content = t || null
  }
  const approve = !!b.approved
  if (approve && !('draft_content' in b ? update.draft_content : true)) {
    return NextResponse.json({ error: 'Write the message before approving it.' }, { status: 400 })
  }
  Object.assign(update, approve ? { status: 'approved', approved_at: new Date().toISOString(), approved_by: hub.user.id } : { status: 'draft', approved_at: null, approved_by: null })

  const db = createServerSupabase()
  if (approve && !('draft_content' in b)) {
    const { data: cur } = await db.from('discord_messages').select('draft_content').eq('id', params.id).eq('campaign_id', hub.campaign.id).maybeSingle()
    if (!cur?.draft_content) return NextResponse.json({ error: 'Write the message before approving it.' }, { status: 400 })
  }
  const { data, error } = await db
    .from('discord_messages')
    .update(update)
    .eq('id', params.id)
    .eq('campaign_id', hub.campaign.id)
    .in('status', ['draft', 'approved'])
    .select()
    .maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'This message has already gone out, or was cancelled.' }, { status: 409 })
  return NextResponse.json(data)
}
