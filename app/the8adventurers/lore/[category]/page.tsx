import { notFound } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase-server'
import { isAdmin } from '@/lib/the8adventurers/isAdmin'
import type { LoreCategory, LoreEntry, LinkedLoreEntry } from '@/lib/the8adventurers/types'
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

  let entries: LoreEntry[] = admin
    ? (rawEntries ?? [])
    : (rawEntries ?? []).map(({ gm_notes: _, ...row }) => row)

  // Enrich friends/foes with faction + location links
  if ((dbCategory === 'friends' || dbCategory === 'foes') && entries.length > 0) {
    const entryIds = entries.map((e) => e.id)

    const [{ data: factionLinks }, { data: locationLinks }] = await Promise.all([
      supabase.from('the8_lore_entry_factions').select('lore_entry_id, faction_entry_id').in('lore_entry_id', entryIds),
      supabase.from('the8_lore_entry_locations').select('lore_entry_id, location_entry_id').in('lore_entry_id', entryIds),
    ])

    const allLinkedIds = [
      ...(factionLinks ?? []).map((f) => f.faction_entry_id),
      ...(locationLinks ?? []).map((l) => l.location_entry_id),
    ]
    const uniqueIds = Array.from(new Set(allLinkedIds))

    const { data: linkedEntries } = uniqueIds.length > 0
      ? await supabase.from('the8_lore_entries').select('id, title, category').in('id', uniqueIds)
      : { data: [] as { id: string; title: string; category: LoreCategory }[] }

    const entryMap = Object.fromEntries((linkedEntries ?? []).map((e) => [e.id, e]))

    entries = entries.map((e) => ({
      ...e,
      linked_factions: (factionLinks ?? [])
        .filter((f) => f.lore_entry_id === e.id && entryMap[f.faction_entry_id])
        .map((f): LinkedLoreEntry => ({
          id: f.faction_entry_id,
          title: entryMap[f.faction_entry_id].title,
          category: entryMap[f.faction_entry_id].category,
        })),
      linked_locations: (locationLinks ?? [])
        .filter((l) => l.lore_entry_id === e.id && entryMap[l.location_entry_id])
        .map((l): LinkedLoreEntry => ({
          id: l.location_entry_id,
          title: entryMap[l.location_entry_id].title,
          category: entryMap[l.location_entry_id].category,
        })),
    }))
  }

  return (
    <LoreClient
      initialEntries={entries}
      category={dbCategory}
      label={LABELS[params.category]}
      isAdmin={admin}
    />
  )
}
