import { createServerSupabase } from '@/lib/supabase-server'

const PLAYER_FIELDS = [
  'name', 'portrait_url', 'level', 'class', 'race', 'background', 'hp_current', 'hp_max',
  'stat_strength', 'stat_dexterity', 'stat_constitution', 'stat_intelligence', 'stat_wisdom', 'stat_charisma',
  'public_notes',
] as const

/** The character fields someone may write. Only the GM writes secret notes. */
export function characterFields(body: Record<string, unknown>, gm: boolean) {
  const keys: readonly string[] = gm ? [...PLAYER_FIELDS, 'secret_notes'] : PLAYER_FIELDS
  const out: Record<string, unknown> = {}
  for (const k of keys) {
    if (!(k in body)) continue
    const v = body[k]
    out[k] = typeof v === 'string' ? v.trim() || null : v ?? null
  }
  return out
}

export async function isMember(campaignId: string, userId: string) {
  const { data } = await createServerSupabase().from('campaign_members').select('user_id').eq('campaign_id', campaignId).eq('user_id', userId).maybeSingle()
  return !!data
}
