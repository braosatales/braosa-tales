import { createServerSupabase } from '@/lib/supabase-server'
import { isAdmin } from '@/lib/the8adventurers/isAdmin'
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

  const quests = admin
    ? (questsResult.data ?? [])
    : (questsResult.data ?? []).filter((q) => !q.is_secret)

  const achievements = admin
    ? (achievementsResult.data ?? [])
    : (achievementsResult.data ?? []).filter((a) => !a.is_secret)

  return (
    <QuestsClient
      initialQuests={quests}
      players={playersResult.data ?? []}
      achievements={achievements}
      isAdmin={admin}
    />
  )
}
