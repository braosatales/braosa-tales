import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { vorUnauthorized } from '@/lib/vor-api'

export const dynamic = 'force-dynamic'

// GET ?limit=40 — João's latest corrections and notes, newest first, for Claude to learn his voice from.
export async function GET(req: Request) {
  const denied = vorUnauthorized(req)
  if (denied) return denied
  const limit = Math.min(100, Math.max(1, Number(new URL(req.url).searchParams.get('limit')) || 40))
  const { data, error } = await createServerSupabase()
    .from('vor_feedback')
    .select('campaign_id, kind, before, after, note, updated_at')
    .order('updated_at', { ascending: false })
    .limit(limit)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}
