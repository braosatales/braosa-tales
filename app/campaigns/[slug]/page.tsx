import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getHub, getHubMembers } from '@/lib/hub/server'
import { getParty } from '@/lib/hub/party'
import { QUEST_SELECT } from '@/lib/hub/quests'
import { createServerSupabase } from '@/lib/supabase-server'
import CharacterCard from '@/components/hub/CharacterCard'
import { HubSectionTitle, EmptyNote } from '@/components/hub/Section'
import PinToggle from '@/components/hub/PinToggle'
import type { Quest } from '@/lib/hub/types'

export const metadata = { title: 'Overview' }

const LORE_LABEL: Record<string, string> = { history: 'History', locations: 'Location', friends: 'Friend', foes: 'Foe', factions: 'Faction', monsters: 'Monster' }

function excerpt(text: string | null, max = 520) {
  if (!text) return ''
  const plain = text.replace(/@\[([^\]]+)\]\([a-f0-9-]+\)/g, '$1').trim()
  return plain.length > max ? `${plain.slice(0, plain.lastIndexOf(' ', max))}…` : plain
}

function longDate(d: string | null) {
  if (!d) return null
  return new Date(`${d}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default async function CampaignOverview({ params }: { params: { slug: string } }) {
  const hub = await getHub(params.slug)
  if (!hub) notFound()
  const base = `/campaigns/${params.slug}`
  const db = createServerSupabase()
  const cid = hub.campaign.id

  const [party, members, { data: recaps }, { data: note }, { data: questRows }, { data: pins }] = await Promise.all([
    getParty(hub),
    getHubMembers(cid),
    db.from('the8_session_recaps').select('*').eq('campaign_id', cid).order('session_number', { ascending: false, nullsFirst: false }).order('created_at', { ascending: false }).limit(1),
    db.from('the8_session_notes').select('content, updated_at').eq('campaign_id', cid).eq('user_id', hub.user.id).maybeSingle(),
    db.from('the8_quests').select(QUEST_SELECT).eq('campaign_id', cid).eq('status', 'in_progress').order('sort_order').order('title'),
    db.from('campaign_pins').select('kind, item_id, pinned_at').eq('campaign_id', cid).eq('user_id', hub.user.id).order('pinned_at', { ascending: false }),
  ])

  const loreIds = (pins ?? []).filter((p) => p.kind === 'lore').map((p) => p.item_id)
  const questIds = (pins ?? []).filter((p) => p.kind === 'quest').map((p) => p.item_id)
  const [{ data: pinnedLore }, { data: pinnedQuests }] = await Promise.all([
    loreIds.length ? db.from('the8_lore_entries').select('id, title, category, is_secret, portrait_url').eq('campaign_id', cid).in('id', loreIds) : Promise.resolve({ data: [] }),
    questIds.length ? db.from('the8_quests').select('id, title, status, is_secret').eq('campaign_id', cid).in('id', questIds) : Promise.resolve({ data: [] }),
  ])
  type PinnedItem = { kind: 'lore' | 'quest'; id: string; title: string; sub: string; href: string }
  const pinned: PinnedItem[] = (pins ?? [])
    .map((p): PinnedItem | null => {
      if (p.kind === 'lore') {
        const e = (pinnedLore ?? []).find((x) => x.id === p.item_id)
        if (!e || (e.is_secret && !hub.gm)) return null
        return { kind: 'lore', id: e.id, title: e.title, sub: LORE_LABEL[e.category] ?? 'Lore', href: `${base}/lore/entry/${e.id}` }
      }
      const q = (pinnedQuests ?? []).find((x) => x.id === p.item_id)
      if (!q || (q.is_secret && !hub.gm)) return null
      return { kind: 'quest', id: q.id, title: q.title, sub: 'Quest', href: `${base}/quests?open=${q.id}` }
    })
    .filter((x): x is PinnedItem => !!x)

  const quests = ((questRows ?? []) as Quest[]).filter((q) => hub.gm || !q.is_secret)
  const recap = recaps?.[0]
  const nameOf = (uid: string | null) => (uid ? members.find((m) => m.user_id === uid)?.name ?? null : null)
  const hasMine = party.some((p) => p.user_id === hub.user.id)

  return (
    <>
    <h1 className="sr-only">{hub.campaign.title}: overview</h1>
    <div className="space-y-16">
      {hub.campaign.description && (
        <p className="max-w-[44em] whitespace-pre-line text-[1.08rem] leading-relaxed text-prose">{hub.campaign.description}</p>
      )}

      {/* Party */}
      <section aria-labelledby="party-h">
        <HubSectionTitle
          action={
            <div className="flex flex-wrap items-center gap-4">
              {(hub.gm || !hasMine) && (
                <Link href={`${base}/party/new`} className="btn-primary">
                  {hub.gm ? 'Add a character' : 'Add your character'}
                </Link>
              )}
              {party.length > 0 && <Link href={`${base}/party`} className="link-quiet text-[0.92rem]">Party sheets</Link>}
            </div>
          }
        >
          <span id="party-h">The party</span>
        </HubSectionTitle>
        {party.length > 0 ? (
          <ul className="mt-6 grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {party.map((p) => (
              <li key={p.id}>
                <CharacterCard p={p} href={`${base}/party/${p.id}`} playedBy={nameOf(p.user_id)} mine={p.user_id === hub.user.id} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-6">
            <EmptyNote>
              No characters yet. {hub.gm ? 'Add them yourself, or let each player add their own.' : 'Add yours: paste your D&D Beyond link and the sheet fills itself in.'}
            </EmptyNote>
          </div>
        )}
      </section>

      {/* Last session + journal */}
      <div className="grid gap-10 lg:grid-cols-[1.35fr_1fr] lg:gap-12">
        <section aria-labelledby="recap-h" className="min-w-0">
          <HubSectionTitle action={{ href: `${base}/recaps`, label: 'All recaps' }}>
            <span id="recap-h">Last time at the table</span>
          </HubSectionTitle>
          {recap ? (
            <article className="mt-5 rounded-2xl border border-umber-line bg-umber/70 p-6">
              <p className="text-[0.85rem] text-ember">
                {[recap.session_number ? `Session ${recap.session_number}` : null, longDate(recap.session_date)].filter(Boolean).join(' · ')}
              </p>
              {recap.title && <h3 className="mt-1 font-cinzel text-[1.25rem] font-bold text-vellum">{recap.title}</h3>}
              <p className="mt-3 whitespace-pre-line leading-relaxed text-prose">{excerpt(recap.content)}</p>
              <Link href={`${base}/recaps`} className="link-quiet mt-4 inline-block text-[0.92rem]">Read the full recap</Link>
            </article>
          ) : (
            <div className="mt-5">
              <EmptyNote>{hub.gm ? 'Write the first recap after your next session.' : 'Recaps appear here after each session.'}</EmptyNote>
            </div>
          )}
        </section>

        <section aria-labelledby="journal-h" className="min-w-0">
          <HubSectionTitle action={{ href: `${base}/journal`, label: note?.content ? 'Open journal' : 'Start writing' }}>
            <span id="journal-h">Your journal</span>
          </HubSectionTitle>
          <div className="mt-5 rounded-2xl border border-plum-line bg-plum p-6">
            {note?.content ? (
              <p className="whitespace-pre-line leading-relaxed text-prose">{excerpt(note.content, 360)}</p>
            ) : (
              <p className="leading-relaxed text-mist">Private notes, just for you. Names you heard, debts you owe, who you don’t trust.</p>
            )}
            <p className="mt-4 text-[0.8rem] text-mist/80">Private to you.</p>
          </div>
        </section>
      </div>

      {/* Quests + pinned */}
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
        <section aria-labelledby="quests-h" className="min-w-0">
          <HubSectionTitle action={{ href: `${base}/quests`, label: 'All quests' }}>
            <span id="quests-h">Quests underway</span>
          </HubSectionTitle>
          {quests.length ? (
            <ul className="mt-5 divide-y divide-plum-line border-y border-plum-line">
              {quests.map((q) => {
                const items = q.the8_quest_items ?? []
                const done = items.filter((i) => i.is_done).length
                return (
                  <li key={q.id} className="flex items-center gap-4 py-3.5">
                    <Link href={`${base}/quests?open=${q.id}`} className="min-w-0 flex-1 group">
                      <p className="truncate font-cinzel text-[1.05rem] font-bold text-vellum group-hover:text-leaf-soft">{q.title}</p>
                      {items.length > 0 && (
                        <div className="mt-1.5 flex items-center gap-3">
                          <div className="h-1 w-28 overflow-hidden rounded-full bg-plum-line">
                            <div className="h-full rounded-full bg-leaf" style={{ width: `${(done / items.length) * 100}%` }} />
                          </div>
                          <span className="text-[0.8rem] tabular-nums text-mist">
                            {done} of {items.length} steps
                          </span>
                        </div>
                      )}
                    </Link>
                    <PinToggle kind="quest" itemId={q.id} />
                  </li>
                )
              })}
            </ul>
          ) : (
            <div className="mt-5">
              <EmptyNote>No quests underway right now.</EmptyNote>
            </div>
          )}
        </section>

        <section aria-labelledby="pinned-h" className="min-w-0">
          <HubSectionTitle>
            <span id="pinned-h">Pinned</span>
          </HubSectionTitle>
          {pinned.length ? (
            <ul className="mt-5 divide-y divide-plum-line border-y border-plum-line">
              {pinned.map((p) => (
                <li key={`${p.kind}-${p.id}`} className="flex items-center gap-4 py-3.5">
                  <Link href={p.href} className="group min-w-0 flex-1">
                    <span className="block text-[0.78rem] text-ember">{p.sub}</span>
                    <span className="block truncate font-cinzel text-[1.05rem] font-bold text-vellum group-hover:text-leaf-soft">{p.title}</span>
                  </Link>
                  <PinToggle kind={p.kind} itemId={p.id} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-5">
              <EmptyNote>Pin the people, places and quests you want close at hand. Look for the pin on any lore entry or quest.</EmptyNote>
            </div>
          )}
        </section>
      </div>
    </div>
    </>
  )
}
