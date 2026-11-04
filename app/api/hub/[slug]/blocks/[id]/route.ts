import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { hubApi } from '@/lib/hub/server'

type P = { params: { slug: string; id: string } }

/** GM: reveal or hide one block, mid-session. Body: { is_revealed } */
export async function PUT(req: Request, { params }: P) {
  const hub = await hubApi(params.slug, { gm: true })
  if (hub instanceof NextResponse) return hub
  const { is_revealed } = await req.json()
  const db = createServerSupabase()
  const { data: block } = await db.from('the8_reveal_blocks').select('id, is_revealed, revealed_at').eq('id', params.id).eq('campaign_id', hub.campaign.id).maybeSingle()
  if (!block) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const now = new Date().toISOString()
  const revealed = !!is_revealed
  const { data, error } = await db
    .from('the8_reveal_blocks')
    .update({ is_revealed: revealed, revealed_at: revealed ? (block.is_revealed ? block.revealed_at : now) : null, updated_at: now })
    .eq('id', params.id)
    .select('id, body, is_revealed, revealed_at, sort_order')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
