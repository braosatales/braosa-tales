import { notFound } from 'next/navigation'
import { getHub } from '@/lib/hub/server'
import { createServerSupabase } from '@/lib/supabase-server'
import TimelineClient from '@/components/hub/TimelineClient'

export const metadata = { title: 'Timeline' }

export default async function TimelinePage({ params }: { params: { slug: string } }) {
  const hub = await getHub(params.slug)
  if (!hub) notFound()
  let query = createServerSupabase()
    .from('the8_timeline_events')
    .select('*')
    .eq('campaign_id', hub.campaign.id)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })
  if (!hub.gm) query = query.eq('is_secret', false)
  const { data: events } = await query
  return <TimelineClient initialEvents={events ?? []} isAdmin={hub.gm} />
}
