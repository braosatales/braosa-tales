import { notFound } from 'next/navigation'
import { getHub } from '@/lib/hub/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { getParty } from '@/lib/hub/party'
import type { Achievement, Player } from '@/lib/hub/types'
import AchievementsClient from '@/components/hub/AchievementsClient'

export const metadata = { title: 'Achievements' }

export default async function AchievementsPage({ params }: { params: { slug: string } }) {
  const hub = await getHub(params.slug)
  if (!hub) notFound()
  let query = createServerSupabase()
    .from('the8_achievements')
    .select('*, the8_achievement_players(player_id, awarded_at)')
    .eq('campaign_id', hub.campaign.id)
    .order('title')
  if (!hub.gm) query = query.eq('is_secret', false)
  const [{ data }, party] = await Promise.all([query, getParty(hub)])
  const achievements = (data ?? []).map((a) => (hub.gm ? a : (({ gm_notes: _, ...row }) => row)(a))) as Achievement[]
  return <AchievementsClient initialAchievements={achievements} players={party as Player[]} isAdmin={hub.gm} />
}
