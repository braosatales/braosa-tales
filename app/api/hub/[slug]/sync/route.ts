import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { hubApi } from '@/lib/hub/server'
import { syncStale } from '@/lib/hub/ddb'

type P = { params: { slug: string } }

// POST — refresh any of this campaign's D&D Beyond sheets older than 30 minutes.
export async function POST(_req: Request, { params }: P) {
  const hub = await hubApi(params.slug)
  if (hub instanceof NextResponse) return hub
  const { data } = await createServerSupabase()
    .from('the8_players')
    .select('id, ddb_character_id, ddb_synced_at, portrait_url')
    .eq('campaign_id', hub.campaign.id)
    .not('ddb_character_id', 'is', null)
  const refreshed = await syncStale(data ?? [])
  return NextResponse.json({ refreshed })
}
