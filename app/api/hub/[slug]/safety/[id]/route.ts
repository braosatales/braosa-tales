import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { hubApi } from '@/lib/hub/server'

type P = { params: { slug: string; id: string } }

// DELETE — the GM clears a note once it's been handled.
export async function DELETE(_req: Request, { params }: P) {
  const hub = await hubApi(params.slug, { gm: true })
  if (hub instanceof NextResponse) return hub
  await createServerSupabase().from('campaign_safety_notes').delete().eq('id', params.id).eq('campaign_id', hub.campaign.id)
  return NextResponse.json({ ok: true })
}
