export const QUEST_SELECT = '*, the8_quest_items(*), the8_quest_players(player_id), the8_quest_exp(player_id, exp_amount)'

export const QUEST_FIELDS = [
  'title', 'description', 'portrait_url', 'status', 'is_secret', 'sort_order',
  'reward_platinum', 'reward_gold', 'reward_electrum', 'reward_silver', 'reward_copper',
  'reward_achievement_id', 'reward_items', 'reward_other', 'gm_notes',
] as const

export function pick<T extends readonly string[]>(body: Record<string, unknown>, keys: T) {
  return Object.fromEntries(keys.filter((k) => k in body).map((k) => [k, body[k]]))
}
