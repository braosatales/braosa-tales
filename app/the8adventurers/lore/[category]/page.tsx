import { notFound } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase-server'
import { isAdmin } from '@/lib/the8adventurers/isAdmin'
import type { LoreCategory } from '@/lib/the8adventurers/types'
import LoreClient from '../../_components/LoreClient'

const URL_TO_DB: Record<string, LoreCategory> = {
  'enemy-boss': 'enemy_boss',
  'enemy-monster': 'enemy_monster',
  'friend': 'friend',
  'location': 'location',
  'faction': 'faction',
}

const LABELS: Record<string, string> = {
  'enemy-boss': 'Enemies — Bosses',
  'enemy-monster': 'Enemies — Monsters',
  'friend': 'Friends',
  'location': 'Locations',
  'faction': 'Factions',
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

  const { data: entries } = await query

  return (
    <LoreClient
      initialEntries={entries ?? []}
      category={dbCategory}
      categorySlug={params.category}
      label={LABELS[params.category]}
      isAdmin={admin}
    />
  )
}
