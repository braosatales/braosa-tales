import { createServerSupabase } from '@/lib/supabase-server'
import { isAdmin } from '@/lib/the8adventurers/isAdmin'
import TimelineClient from '../_components/TimelineClient'

export const metadata = { title: 'Timeline' }

export default async function TimelinePage() {
  const admin = await isAdmin()
  const supabase = createServerSupabase()

  let query = supabase
    .from('the8_timeline_events')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (!admin) query = query.eq('is_secret', false)

  const { data: events } = await query

  return <TimelineClient initialEvents={events ?? []} isAdmin={admin} />
}
