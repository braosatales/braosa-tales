import { createServerSupabase } from '@/lib/supabase-server'
import { isAdmin } from '@/lib/the8adventurers/isAdmin'
import { getVisiblePlayerFields } from '@/lib/the8adventurers/getVisiblePlayerFields'
import PlayersClient from '../_components/PlayersClient'

export const metadata = { title: 'Players' }

export default async function PlayersPage() {
  const admin = await isAdmin()
  const supabase = createServerSupabase()

  const [playersResult, secrecyResult] = await Promise.all([
    supabase.from('the8_players').select('*').order('name', { ascending: true }),
    admin
      ? Promise.resolve({ data: [] as { id: string; player_id: string; field_name: string; is_secret: boolean }[] })
      : supabase.from('the8_player_field_secrecy').select('*'),
  ])

  const allSecrecy = secrecyResult.data ?? []

  const players = (playersResult.data ?? []).map((p) => {
    const secrecyRows = admin ? [] : allSecrecy.filter((r) => r.player_id === p.id)
    return getVisiblePlayerFields(p, secrecyRows, admin)
  })

  return <PlayersClient initialPlayers={players} isAdmin={admin} />
}
