import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/auth'
import { createServerSupabase } from '@/lib/supabase-server'
import NotesClient from '../../_components/NotesClient'

export const metadata = { title: 'My Notes' }

export default async function NotesPage() {
  const user = await getAuthUser()
  if (!user) redirect('/sign-in?next=/the8adventurers/sessions/notes')
  const supabase = createServerSupabase()

  const { data: note } = await supabase
    .from('the8_session_notes')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  return <NotesClient initialContent={note?.content ?? ''} />
}
