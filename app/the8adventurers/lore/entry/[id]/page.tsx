import { notFound } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase-server'
import { isAdmin } from '@/lib/the8adventurers/isAdmin'
import RichCard from '@/components/the8adventurers/RichCard'
import Link from 'next/link'

export async function generateMetadata({ params }: { params: { id: string } }) {
  const supabase = createServerSupabase()
  const { data } = await supabase.from('the8_lore_entries').select('title').eq('id', params.id).single()
  return { title: data?.title ?? 'Lore Entry' }
}

export default async function LoreEntryPage({ params }: { params: { id: string } }) {
  const admin = await isAdmin()
  const supabase = createServerSupabase()

  const { data: entry } = await supabase
    .from('the8_lore_entries')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!entry) notFound()
  if (!admin && entry.is_secret) notFound()

  const CATEGORY_SLUGS: Record<string, string> = {
    history: 'history', locations: 'locations', friends: 'friends',
    foes: 'foes', factions: 'factions', monsters: 'monsters',
  }

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      <Link
        href={`/the8adventurers/lore/${CATEGORY_SLUGS[entry.category] ?? entry.category}`}
        className="inline-block mb-6 font-fell text-sm text-brand-muted hover:text-brand-parchment transition-colors"
      >
        ← Back to {entry.category}
      </Link>
      <RichCard
        portrait_url={entry.portrait_url}
        title={entry.title}
        description={entry.description}
      />
    </div>
  )
}
