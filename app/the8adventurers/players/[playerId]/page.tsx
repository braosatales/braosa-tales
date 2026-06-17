import { notFound } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase-server'
import { isAdmin } from '@/lib/the8adventurers/isAdmin'
import { getVisiblePlayerFields } from '@/lib/the8adventurers/getVisiblePlayerFields'
import PlayerSheetClient from '../../_components/PlayerSheetClient'

export async function generateMetadata({ params }: { params: { playerId: string } }) {
  const supabase = createServerSupabase()
  const { data } = await supabase.from('the8_players').select('name').eq('id', params.playerId).single()
  return { title: data?.name ?? 'Player' }
}

export default async function PlayerPage({ params }: { params: { playerId: string } }) {
  const admin = await isAdmin()
  const supabase = createServerSupabase()

  const [playerResult, secrecyResult] = await Promise.all([
    supabase.from('the8_players').select('*').eq('id', params.playerId).single(),
    supabase.from('the8_player_field_secrecy').select('*').eq('player_id', params.playerId),
  ])

  if (!playerResult.data) notFound()

  const player = playerResult.data
  const secrecyRows = secrecyResult.data ?? []
  const visiblePlayer = getVisiblePlayerFields(player, secrecyRows, admin)

  return (
    <PlayerSheetClient
      player={visiblePlayer}
      secrecyRows={secrecyRows}
      isAdmin={admin}
      fullPlayer={admin ? player : undefined}
    />
  )
}
