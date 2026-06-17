import { createServerSupabase } from '@/lib/supabase-server'
import { isAdmin } from '@/lib/the8adventurers/isAdmin'
import RecapsClient from '../../_components/RecapsClient'

export const metadata = { title: 'Session Recaps' }

export default async function RecapsPage() {
  const admin = await isAdmin()
  const supabase = createServerSupabase()

  const { data: recaps } = await supabase
    .from('the8_session_recaps')
    .select('*')
    .order('session_number', { ascending: false, nullsFirst: false })

  return <RecapsClient initialRecaps={recaps ?? []} isAdmin={admin} />
}
