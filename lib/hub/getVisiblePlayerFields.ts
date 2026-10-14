import type { Player, PlayerFieldSecrecy } from './types'

export type VisiblePlayerData = {
  id: string
  name: string
  public_notes: string | null
  user_id: string | null
  ddb_character_id: string | null
  ddb_synced_at: string | null
  ddb_error: string | null
  portrait_url?: string | null
  level?: number | null
  class?: string | null
  race?: string | null
  background?: string | null
  hp_current?: number | null
  hp_max?: number | null
  stat_strength?: number | null
  stat_dexterity?: number | null
  stat_constitution?: number | null
  stat_intelligence?: number | null
  stat_wisdom?: number | null
  stat_charisma?: number | null
  secret_notes?: string | null // only present when admin=true
}

// Returns a redacted view of a player. Secret fields are simply absent from the result —
// no placeholder, no null sentinel — so UI can check `'level' in visible` to know if it's visible.
export function getVisiblePlayerFields(
  player: Player,
  secrecyRows: PlayerFieldSecrecy[],
  admin: boolean,
  viewerId?: string
): VisiblePlayerData {
  if (admin) {
    return { ...player }
  }
  // A character's own player sees everything about it except the GM's notes.
  if (viewerId && player.user_id === viewerId) {
    const { secret_notes: _, ...own } = player
    return own
  }

  const secretFields = new Set(
    secrecyRows.filter((r) => r.is_secret).map((r) => r.field_name)
  )

  const visible: VisiblePlayerData = {
    id: player.id,
    name: player.name,
    public_notes: player.public_notes,
    user_id: player.user_id,
    ddb_character_id: player.ddb_character_id,
    ddb_synced_at: player.ddb_synced_at,
    ddb_error: player.ddb_error,
  }

  if (!secretFields.has('portrait')) visible.portrait_url = player.portrait_url
  if (!secretFields.has('level')) visible.level = player.level
  if (!secretFields.has('class')) visible.class = player.class
  if (!secretFields.has('race')) visible.race = player.race
  if (!secretFields.has('background')) visible.background = player.background
  if (!secretFields.has('hp')) {
    visible.hp_current = player.hp_current
    visible.hp_max = player.hp_max
  }
  if (!secretFields.has('stats')) {
    visible.stat_strength = player.stat_strength
    visible.stat_dexterity = player.stat_dexterity
    visible.stat_constitution = player.stat_constitution
    visible.stat_intelligence = player.stat_intelligence
    visible.stat_wisdom = player.stat_wisdom
    visible.stat_charisma = player.stat_charisma
  }

  return visible
}
