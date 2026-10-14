import { notFound } from 'next/navigation'
import { getHub, getHubMembers } from '@/lib/hub/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { getVisiblePlayerFields } from '@/lib/hub/getVisiblePlayerFields'
import { hasStale } from '@/lib/hub/party'
import PartySync from '@/components/hub/PartySync'
import CharacterSheet from '@/components/hub/CharacterSheet'
import type { Player } from '@/lib/hub/types'

export async function generateMetadata({ params }: { params: { slug: string; playerId: string } }) {
  const hub = await getHub(params.slug)
  if (!hub) return { title: 'Character' }
  const { data } = await createServerSupabase().from('the8_players').select('name').eq('id', params.playerId).eq('campaign_id', hub.campaign.id).maybeSingle()
  return { title: data?.name ?? 'Character' }
}

export default async function CharacterPage({ params }: { params: { slug: string; playerId: string } }) {
  const hub = await getHub(params.slug)
  if (!hub) notFound()
  const db = createServerSupabase()
  const { data: player } = await db.from('the8_players').select('*').eq('id', params.playerId).eq('campaign_id', hub.campaign.id).maybeSingle()
  if (!player) notFound()
  const p = player as Player

  const [{ data: secrecy }, members] = await Promise.all([
    db.from('the8_player_field_secrecy').select('*').eq('player_id', p.id),
    getHubMembers(hub.campaign.id),
  ])
  const visible = getVisiblePlayerFields(p, secrecy ?? [], hub.gm, hub.user.id)
  const canEdit = hub.gm || p.user_id === hub.user.id
  const full = canEdit ? (hub.gm ? p : { ...p, secret_notes: null }) : undefined
  const playedBy = p.user_id ? members.find((m) => m.user_id === p.user_id)?.name ?? null : null

  return (
    <>
      {hasStale([p]) && <PartySync />}
      <CharacterSheet p={visible} full={full} secrecy={hub.gm ? secrecy ?? [] : []} playedBy={playedBy} />
    </>
  )
}
