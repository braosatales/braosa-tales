import { notFound } from 'next/navigation'
import { getHub } from '@/lib/hub/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { getParty } from '@/lib/hub/party'
import { QUEST_SELECT } from '@/lib/hub/quests'
import type { Player, Quest } from '@/lib/hub/types'
import QuestsClient from '@/components/hub/QuestsClient'

export const metadata = { title: 'Quests' }

export default async function QuestsPage({ params, searchParams }: { params: { slug: string }; searchParams: { open?: string } }) {
  const hub = await getHub(params.slug)
  if (!hub) notFound()
  const db = createServerSupabase()
  const cid = hub.campaign.id
  const [{ data: questRows }, party, { data: achRows }] = await Promise.all([
    db.from('the8_quests').select(QUEST_SELECT).eq('campaign_id', cid).order('title'),
    getParty(hub),
    db.from('the8_achievements').select('*').eq('campaign_id', cid).order('title'),
  ])
  const strip = <T extends { gm_notes?: unknown }>({ gm_notes: _, ...row }: T) => row
  const quests = (hub.gm ? questRows ?? [] : (questRows ?? []).filter((q) => !q.is_secret).map(strip)) as Quest[]
  const achievements = hub.gm ? achRows ?? [] : (achRows ?? []).filter((a) => !a.is_secret).map(strip)
  return <QuestsClient initialQuests={quests} players={party as Player[]} achievements={achievements} isAdmin={hub.gm} initialOpenId={searchParams.open} />
}
