import { createServerSupabase } from '@/lib/supabase-server'
import { isAdmin } from '@/lib/the8adventurers/isAdmin'
import WorldMapClient from '../_components/WorldMapClient'

export const metadata = { title: 'World Map' }

export default async function WorldMapPage() {
  const admin = await isAdmin()
  const supabase = createServerSupabase()

  const { data: mapData } = await supabase
    .from('the8_world_map')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return <WorldMapClient initialMap={mapData ?? null} isAdmin={admin} />
}
