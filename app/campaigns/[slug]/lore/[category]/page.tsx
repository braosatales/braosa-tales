import { notFound } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase-server'
import { getHub } from '@/lib/hub/server'
import LoreNav from '@/components/hub/LoreNav'
import type { LoreCategory, LoreEntry } from '@/lib/hub/types'
import { hydrateLore } from '@/lib/hub/reveal'
import LoreClient from '@/components/hub/LoreClient'

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

export async function generateMetadata({ params }: { params: { slug: string; category: string } }) {
  return { title: LABELS[params.category] ?? 'Lore' }
}

export default async function LoreCategoryPage({ params }: { params: { slug: string; category: string } }) {
  const dbCategory = URL_TO_DB[params.category]
  if (!dbCategory) notFound()

  const hub = await getHub(params.slug)
  if (!hub) notFound()
  const admin = hub.gm
  const supabase = createServerSupabase()

  let query = supabase
    .from('the8_lore_entries')
    .select('*')
    .eq('campaign_id', hub.campaign.id)
    .eq('category', dbCategory)
    .order('title', { ascending: true })

  if (!admin) query = query.eq('is_secret', false)

  const { data: rawEntries } = await query

  const entries: LoreEntry[] = await hydrateLore(supabase, hub.campaign.id, rawEntries ?? [], admin)

  return (
    <div>
      <LoreNav base={`/campaigns/${params.slug}`} active={dbCategory} />
      <div className="mt-8">
        <LoreClient initialEntries={entries} category={dbCategory} label={LABELS[params.category]} isAdmin={admin} />
      </div>
    </div>
  )
}
