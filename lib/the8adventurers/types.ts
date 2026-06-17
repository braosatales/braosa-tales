export type LoreCategory = 'enemy_boss' | 'enemy_monster' | 'friend' | 'location' | 'faction'

export type LoreEntry = {
  id: string
  category: LoreCategory
  title: string
  content: string | null
  is_secret: boolean
  image_url: string | null
  created_at: string
  updated_at: string
}

export type QuestItem = {
  id: string
  quest_id: string
  label: string
  is_done: boolean
  sort_order: number
  created_at: string
}

export type Quest = {
  id: string
  title: string
  description: string | null
  is_secret: boolean
  is_done: boolean
  sort_order: number
  created_at: string
  updated_at: string
  the8_quest_items: QuestItem[]
}

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

export type WorldMap = {
  id: string
  image_url: string
  caption: string | null
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
