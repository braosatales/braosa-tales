import { notFound } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase-server'
import { isAdmin } from '@/lib/the8adventurers/isAdmin'
import type { LoreCategory, LoreEntry } from '@/lib/the8adventurers/types'
import LoreClient from '../../_components/LoreClient'

const URL_TO_DB: Record<string, LoreCategory> = {
  history: 'history',
  locations: 'locations',
  friends: 'friends',
  foes: 'foes',
  factions: 'factions',
  monsters: 'monsters',
}

const LABELS: Record<string, string> = {
  history: 'History',
  locations: 'Locations',
  friends: 'Friends',
  foes: 'Foes',
  factions: 'Factions',
  monsters: 'Monsters',
}

export async function generateMetadata({ params }: { params: { category: string } }) {
  return { title: LABELS[params.category] ?? 'Lore' }
}

export default async function LoreCategoryPage({ params }: { params: { category: string } }) {
  const dbCategory = URL_TO_DB[params.category]
  if (!dbCategory) notFound()

  const admin = await isAdmin()
  const supabase = createServerSupabase()

  let query = supabase
    .from('the8_lore_entries')
    .select('*')
    .eq('category', dbCategory)
    .order('created_at', { ascending: false })

  if (!admin) query = query.eq('is_secret', false)

  const { data: rawEntries } = await query

  const entries: LoreEntry[] = admin
    ? (rawEntries ?? [])
    : (rawEntries ?? []).map(({ gm_notes: _, ...row }) => row)

  return (
    <LoreClient
      initialEntries={entries}
      category={dbCategory}
      label={LABELS[params.category]}
      isAdmin={admin}
    />
  )
}
