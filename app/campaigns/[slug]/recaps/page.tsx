import { notFound } from 'next/navigation'
import { getHub } from '@/lib/hub/server'
import { createServerSupabase } from '@/lib/supabase-server'
import RecapsClient from '@/components/hub/RecapsClient'

export const metadata = { title: 'Session recaps' }

export default async function RecapsPage({ params }: { params: { slug: string } }) {
  const hub = await getHub(params.slug)
  if (!hub) notFound()
  const { data: recaps } = await createServerSupabase()
    .from('the8_session_recaps')
    .select('*')
    .eq('campaign_id', hub.campaign.id)
    .order('session_number', { ascending: false, nullsFirst: false })
  return <RecapsClient initialRecaps={recaps ?? []} isAdmin={hub.gm} />
}
