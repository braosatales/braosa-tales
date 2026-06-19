export type LoreCategory = 'history' | 'locations' | 'friends' | 'foes' | 'factions' | 'monsters'

export type LinkedLoreEntry = {
  id: string
  title: string
  category: LoreCategory
}

export type LoreEntry = {
  id: string
  category: LoreCategory
  title: string
  description: string | null
  portrait_url: string | null
  is_secret: boolean
  gm_notes?: string | null
  preferred_habitat?: string | null
  linked_factions?: LinkedLoreEntry[]
  linked_locations?: LinkedLoreEntry[]
  created_at: string
  updated_at: string
}

export type QuestStatus = 'available' | 'in_progress' | 'completed' | 'failed'

export type QuestItem = {
  id: string
  quest_id: string
  label: string
  is_done: boolean
  sort_order: number
  created_at: string
}

export type QuestPlayerRef = { player_id: string }
export type QuestExpRef = { player_id: string; exp_amount: number }

export type Quest = {
  id: string
  title: string
  description: string | null
  portrait_url: string | null
  status: QuestStatus
  is_secret: boolean
  sort_order: number
  reward_platinum: number
  reward_gold: number
  reward_electrum: number
  reward_silver: number
  reward_copper: number
  reward_achievement_id: string | null
  reward_items: string | null
  reward_other: string | null
  gm_notes?: string | null
  created_at: string
  updated_at: string
  the8_quest_items: QuestItem[]
  the8_quest_players: QuestPlayerRef[]
  the8_quest_exp: QuestExpRef[]
}

export type Player = {
  id: string
  name: string
  portrait_url: string | null
  clerk_user_id: string | null
  level: number | null
  class: string | null
  race: string | null
  background: string | null
  hp_current: number | null
  hp_max: number | null
  stat_strength: number | null
  stat_dexterity: number | null
  stat_constitution: number | null
  stat_intelligence: number | null
  stat_wisdom: number | null
  stat_charisma: number | null
  public_notes: string | null
  secret_notes: string | null
  created_at: string
  updated_at: string
}

export type PlayerFieldSecrecy = {
  id: string
  player_id: string
  field_name: string
  is_secret: boolean
}

export type Achievement = {
  id: string
  title: string
  description: string | null
  portrait_url: string | null
  unlock_text: string | null
  is_secret: boolean
  gm_notes?: string | null
  created_at: string
  updated_at: string
  the8_achievement_players?: { player_id: string; awarded_at: string }[]
}

export type GameMap = {
  id: string
  title: string
  image_url: string
  caption: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export type MapPin = {
  id: string
  map_id: string
  lore_entry_id: string
  pos_x: number
  pos_y: number
  created_at: string
  the8_lore_entries?: LoreEntry | null
}

// Kept for backward compat — timeline/sessions/notes unchanged
export type TimelineEvent = {
  id: string
  title: string
  description: string | null
  event_date: string | null
  sort_order: number
  is_secret: boolean
  created_at: string
  updated_at: string
}

export type SessionRecap = {
  id: string
  session_number: number | null
  title: string | null
  content: string | null
  session_date: string | null
  created_at: string
  updated_at: string
}

export type SessionNote = {
  id: string
  user_id: string
  content: string | null
  updated_at: string
}
