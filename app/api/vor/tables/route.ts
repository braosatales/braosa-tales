import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { vorUnauthorized } from '@/lib/vor-api'

export const dynamic = 'force-dynamic'

// GET ?days=30 — every campaign with a Discord channel, its sessions from `days` ago onwards, and each session's posts.
export async function GET(req: Request) {
  const denied = vorUnauthorized(req)
  if (denied) return denied
  const days = Math.min(365, Math.max(1, Number(new URL(req.url).searchParams.get('days')) || 30))
  const since = new Date(Date.now() - days * 86400000).toISOString()
  const db = createServerSupabase()

  const [campaigns, sessions] = await Promise.all([
    db.from('campaigns').select('id, slug, title, discord_channel_id, discord_language, discord_templates, startplaying_listing').order('sort_order'),
    db
      .from('campaign_sessions')
      .select('id, campaign_id, session_number, title, starts_at, ends_at, status, startplaying_uid, recap_draft, analysed_at')
      .gte('ends_at', since)
      .order('starts_at'),
  ])
  if (campaigns.error) return NextResponse.json({ error: campaigns.error.message }, { status: 500 })
  if (sessions.error) return NextResponse.json({ error: sessions.error.message }, { status: 500 })

  const ids = (sessions.data ?? []).map((s) => s.id)
  const messages = ids.length
    ? await db
        .from('discord_messages')
        .select('id, session_id, kind, send_at, expires_at, draft_content, change_request, drafted_at, status, approved_at, sent_at, sent_content, used_fallback, last_error')
        .in('session_id', ids)
    : { data: [], error: null }
  if (messages.error) return NextResponse.json({ error: messages.error.message }, { status: 500 })

  return NextResponse.json({
    campaigns: (campaigns.data ?? []).filter((c) => c.discord_channel_id),
    sessions: sessions.data ?? [],
    messages: messages.data ?? [],
  })
}
