import { createServerSupabase } from '@/lib/supabase-server'
import { isAdmin } from '@/lib/the8adventurers/isAdmin'
import type { Achievement } from '@/lib/the8adventurers/types'
import AchievementsClient from '../_components/AchievementsClient'

export const metadata = { title: 'Achievements' }

export default async function AchievementsPage() {
  const admin = await isAdmin()
  const supabase = createServerSupabase()

  const [achievementsResult, playersResult] = await Promise.all([
    supabase
      .from('the8_achievements')
      .select('*, the8_achievement_players(player_id, awarded_at)')
      .order('created_at', { ascending: false }),
    supabase.from('the8_players').select('*').order('name', { ascending: true }),
  ])

  const rawAchievements = achievementsResult.data ?? []

  const achievements: Achievement[] = admin
    ? rawAchievements
    : rawAchievements
        .filter((a) => !a.is_secret)
        .map(({ gm_notes: _, ...row }) => row)

  return (
    <AchievementsClient
      initialAchievements={achievements}
      players={playersResult.data ?? []}
      isAdmin={admin}
    />
  )
}
