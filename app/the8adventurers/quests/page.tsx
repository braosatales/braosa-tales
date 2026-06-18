import { createServerSupabase } from '@/lib/supabase-server'
import { isAdmin } from '@/lib/the8adventurers/isAdmin'
import type { Quest } from '@/lib/the8adventurers/types'
import QuestsClient from '../_components/QuestsClient'

export const metadata = { title: 'Quests' }

export default async function QuestsPage() {
  const admin = await isAdmin()
  const supabase = createServerSupabase()

  const [questsResult, playersResult, achievementsResult] = await Promise.all([
    supabase
      .from('the8_quests')
      .select('*, the8_quest_items(*), the8_quest_players(player_id), the8_quest_exp(player_id, exp_amount)')
      .order('sort_order', { ascending: true }),
    supabase.from('the8_players').select('*').order('name', { ascending: true }),
    supabase.from('the8_achievements').select('*').order('created_at', { ascending: false }),
  ])

  const rawQuests = questsResult.data ?? []

  const quests: Quest[] = admin
    ? rawQuests
    : rawQuests
        .filter((q) => !q.is_secret)
        .map(({ gm_notes: _, ...row }) => row)

  const rawAchievements = achievementsResult.data ?? []
  const achievements = admin
    ? rawAchievements
    : rawAchievements
        .filter((a) => !a.is_secret)
        .map(({ gm_notes: _, ...row }) => row)

  return (
    <QuestsClient
      initialQuests={quests}
      players={playersResult.data ?? []}
      achievements={achievements}
      isAdmin={admin}
    />
  )
}
