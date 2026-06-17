import { createServerSupabase } from '@/lib/supabase-server'
import { isAdmin } from '@/lib/the8adventurers/isAdmin'
import QuestsClient from '../_components/QuestsClient'

export const metadata = { title: 'Quests' }

export default async function QuestsPage() {
  const admin = await isAdmin()
  const supabase = createServerSupabase()

  const { data: quests } = await supabase
    .from('the8_quests')
    .select('*, the8_quest_items(*)')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  const filtered = admin
    ? (quests ?? [])
    : (quests ?? []).filter((q) => !q.is_secret)

  return <QuestsClient initialQuests={filtered} isAdmin={admin} />
}
