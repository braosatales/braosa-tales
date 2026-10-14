import { createServerSupabase } from '@/lib/supabase-server'
import { getVisiblePlayerFields, type VisiblePlayerData } from './getVisiblePlayerFields'
import { syncStale } from './ddb'
import type { Hub } from './server'
import type { Player } from './types'

/** The party as this viewer may see it. Refreshes D&D Beyond sheets older than 30 minutes first. */
export async function getParty(hub: Hub): Promise<VisiblePlayerData[]> {
  const db = createServerSupabase()
  const load = () => db.from('the8_players').select('*').eq('campaign_id', hub.campaign.id).order('name')
  let { data: players } = await load()
  if (players?.length && (await syncStale(players as Player[]))) ({ data: players } = await load())
  if (!players?.length) return []
  if (hub.gm) return players as Player[]
  const { data: secrecy } = await db.from('the8_player_field_secrecy').select('*').in('player_id', players.map((p) => p.id))
  return (players as Player[]).map((p) => getVisiblePlayerFields(p, (secrecy ?? []).filter((r) => r.player_id === p.id), false, hub.user.id))
}
