import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getHub } from '@/lib/hub/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { loreLabel } from '@/lib/hub/lore'
import RichCard from '@/components/hub/RichCard'
import PinToggle from '@/components/hub/PinToggle'

export async function generateMetadata({ params }: { params: { slug: string; id: string } }) {
  const hub = await getHub(params.slug)
  if (!hub) return { title: 'Lore' }
  const { data } = await createServerSupabase().from('the8_lore_entries').select('title, is_secret').eq('id', params.id).eq('campaign_id', hub.campaign.id).maybeSingle()
  return { title: data && (hub.gm || !data.is_secret) ? data.title : 'Lore' }
}

export default async function LoreEntryPage({ params }: { params: { slug: string; id: string } }) {
  const hub = await getHub(params.slug)
  if (!hub) notFound()
  const base = `/campaigns/${params.slug}`
  const { data: entry } = await createServerSupabase().from('the8_lore_entries').select('*').eq('id', params.id).eq('campaign_id', hub.campaign.id).maybeSingle()
  if (!entry || (!hub.gm && entry.is_secret)) notFound()

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between gap-4">
        <Link href={`${base}/lore/${entry.category}`} className="text-[0.92rem] text-mist hover:text-vellum">
          ← {loreLabel(entry.category)}
        </Link>
        <PinToggle kind="lore" itemId={entry.id} withLabel />
      </div>
      <div className="mt-6">
        <RichCard base={base} portrait_url={entry.portrait_url} title={entry.title} description={entry.description} />
      </div>
      {hub.gm && entry.gm_notes && (
        <section className="mt-6 rounded-2xl border border-ember/30 bg-umber/60 p-5">
          <h2 className="font-cinzel text-[1.05rem] font-bold text-ember">GM notes</h2>
          <p className="mt-2 whitespace-pre-line leading-relaxed text-prose">{entry.gm_notes}</p>
        </section>
      )}
    </div>
  )
}
