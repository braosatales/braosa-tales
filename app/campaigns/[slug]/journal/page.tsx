import { notFound } from 'next/navigation'
import { getHub } from '@/lib/hub/server'
import { createServerSupabase } from '@/lib/supabase-server'
import NotesClient from '@/components/hub/NotesClient'

export const metadata = { title: 'Journal' }

export default async function JournalPage({ params }: { params: { slug: string } }) {
  const hub = await getHub(params.slug)
  if (!hub) notFound()
  const { data: note } = await createServerSupabase()
    .from('the8_session_notes')
    .select('content, updated_at')
    .eq('campaign_id', hub.campaign.id)
    .eq('user_id', hub.user.id)
    .maybeSingle()
  return <NotesClient initialContent={note?.content ?? ''} updatedAt={note?.updated_at ?? null} />
}
