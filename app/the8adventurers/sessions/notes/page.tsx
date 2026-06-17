import { auth } from '@clerk/nextjs/server'
import { createServerSupabase } from '@/lib/supabase-server'
import NotesClient from '../../_components/NotesClient'

export const metadata = { title: 'My Notes' }

export default async function NotesPage() {
  const { userId } = await auth()
  const supabase = createServerSupabase()

  const { data: note } = await supabase
    .from('the8_session_notes')
    .select('*')
    .eq('user_id', userId!)
    .maybeSingle()

  return <NotesClient initialContent={note?.content ?? ''} />
}
