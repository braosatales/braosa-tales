import { notFound } from 'next/navigation'
import { getHub } from '@/lib/hub/server'
import { createServerSupabase } from '@/lib/supabase-server'
import WorldMapClient from '@/components/hub/WorldMapClient'
import type { MapPin } from '@/lib/hub/types'

export const metadata = { title: 'Map' }

export default async function MapPage({ params }: { params: { slug: string } }) {
  const hub = await getHub(params.slug)
  if (!hub) notFound()
  const db = createServerSupabase()
  const cid = hub.campaign.id
  const [{ data: mapRows }, { data: locations }] = await Promise.all([
    db.from('the8_maps').select('*').eq('campaign_id', cid).order('sort_order'),
    db.from('the8_lore_entries').select('*').eq('campaign_id', cid).eq('category', 'locations').order('title'),
  ])
  const maps = mapRows ?? []
  const pinsByMap: Record<string, MapPin[]> = {}
  if (maps.length) {
    const { data: allPins } = await db.from('the8_map_pins').select('*, the8_lore_entries(*)').in('map_id', maps.map((m) => m.id))
    for (const pin of allPins ?? []) {
      if (!hub.gm && pin.the8_lore_entries?.is_secret) continue
      ;(pinsByMap[pin.map_id] ??= []).push(pin)
    }
  }
  const locationEntries = (locations ?? []).filter((e) => hub.gm || !e.is_secret)
  return <WorldMapClient initialMaps={maps} initialPins={pinsByMap} locationEntries={locationEntries} isAdmin={hub.gm} />
}
