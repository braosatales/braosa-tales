import { createServerSupabase } from '@/lib/supabase-server'
import { isAdmin } from '@/lib/the8adventurers/isAdmin'
import WorldMapClient from '../_components/WorldMapClient'
import type { MapPin } from '@/lib/the8adventurers/types'

export const metadata = { title: 'World Map' }

export default async function WorldMapPage() {
  const admin = await isAdmin()
  const supabase = createServerSupabase()

  const [mapsResult, locationEntriesResult] = await Promise.all([
    supabase.from('the8_maps').select('*').order('sort_order', { ascending: true }),
    supabase
      .from('the8_lore_entries')
      .select('*')
      .eq('category', 'locations')
      .order('title', { ascending: true }),
  ])

  const maps = mapsResult.data ?? []

  // Fetch pins for all maps
  const pinsByMap: Record<string, MapPin[]> = {}

  if (maps.length > 0) {
    const { data: allPins } = await supabase
      .from('the8_map_pins')
      .select('*, the8_lore_entries(*)')
      .in('map_id', maps.map((m) => m.id))

    for (const pin of allPins ?? []) {
      if (!admin && pin.the8_lore_entries?.is_secret) continue
      if (!pinsByMap[pin.map_id]) pinsByMap[pin.map_id] = []
      pinsByMap[pin.map_id].push(pin)
    }
  }

  const locationEntries = admin
    ? (locationEntriesResult.data ?? [])
    : (locationEntriesResult.data ?? []).filter((e) => !e.is_secret)

  return (
    <WorldMapClient
      initialMaps={maps}
      initialPins={pinsByMap}
      locationEntries={locationEntries}
      isAdmin={admin}
    />
  )
}
