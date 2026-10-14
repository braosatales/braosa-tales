import { createServerSupabase } from '@/lib/supabase-server'
import { getVisiblePlayerFields, type VisiblePlayerData } from './getVisiblePlayerFields'
import type { Hub } from './server'
import { DDB_MAX_AGE_MIN } from './ddb'
import type { Player } from './types'

/** The party as this viewer may see it. (Stale D&D Beyond sheets are refreshed after load by <PartySync />.) */
export async function getParty(hub: Hub): Promise<VisiblePlayerData[]> {
  const db = createServerSupabase()
  const { data: players } = await db.from('the8_players').select('*').eq('campaign_id', hub.campaign.id).order('name')
  if (!players?.length) return []
  if (hub.gm) return players as Player[]
  const { data: secrecy } = await db.from('the8_player_field_secrecy').select('*').in('player_id', players.map((p) => p.id))
  return (players as Player[]).map((p) => getVisiblePlayerFields(p, (secrecy ?? []).filter((r) => r.player_id === p.id), false, hub.user.id))
}

/** Are any linked D&D Beyond sheets due a refresh? */
export function hasStale(players: Pick<Player, 'ddb_character_id' | 'ddb_synced_at'>[]) {
  const cutoff = Date.now() - DDB_MAX_AGE_MIN * 60_000
  return players.some((p) => p.ddb_character_id && (!p.ddb_synced_at || new Date(p.ddb_synced_at).getTime() < cutoff))
}
