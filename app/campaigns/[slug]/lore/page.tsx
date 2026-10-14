import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getHub } from '@/lib/hub/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { LORE_CATEGORIES } from '@/lib/hub/lore'

export const metadata = { title: 'Lore' }

export default async function LoreIndex({ params }: { params: { slug: string } }) {
  const hub = await getHub(params.slug)
  if (!hub) notFound()
  const base = `/campaigns/${params.slug}`
  let q = createServerSupabase().from('the8_lore_entries').select('category, title, updated_at, is_secret').eq('campaign_id', hub.campaign.id).order('updated_at', { ascending: false })
  if (!hub.gm) q = q.eq('is_secret', false)
  const { data } = await q
  const rows = data ?? []

  return (
    <div>
      <h1 className="font-cinzel text-[2rem] font-bold text-vellum">Lore</h1>
      <p className="mt-1 text-mist">Everything the party has learned about this world.</p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LORE_CATEGORIES.map((c) => {
          const items = rows.filter((r) => r.category === c.slug)
          return (
            <li key={c.slug}>
              <Link href={`${base}/lore/${c.slug}`} className="group flex h-full flex-col rounded-2xl border border-plum-line bg-plum p-5 transition-colors hover:border-leaf/50">
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="font-cinzel text-[1.25rem] font-bold text-vellum group-hover:text-leaf-soft">{c.label}</h2>
                  <span className="text-[0.85rem] tabular-nums text-mist">{items.length}</span>
                </div>
                <p className="mt-1 text-[0.92rem] text-mist">{c.blurb}</p>
                {items.length > 0 && (
                  <p className="mt-4 line-clamp-2 text-[0.9rem] text-prose/90">{items.slice(0, 4).map((i) => i.title).join(' · ')}</p>
                )}
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
