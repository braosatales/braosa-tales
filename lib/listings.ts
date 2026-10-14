import { unstable_cache, revalidateTag } from 'next/cache'
import { createServerSupabase } from '@/lib/supabase-server'
import { seatState, type Listing, type SeatState } from './listing-shared'

export * from './listing-shared'

const ORDER: Record<SeatState, number> = { open: 0, last: 0, paused: 1, full: 2, finished: 3 }

async function load(): Promise<Listing[]> {
  const db = createServerSupabase()
  const { data: campaigns } = await db.from('campaigns').select('*').eq('listed', true).order('sort_order')
  const ids = (campaigns ?? []).map((c) => c.id as string)
  if (!ids.length) return []
  const [{ data: members }, { data: invites }, { data: recaps }] = await Promise.all([
    db.from('campaign_members').select('campaign_id').eq('role', 'player').in('campaign_id', ids),
    db.from('campaign_invites').select('campaign_id').in('campaign_id', ids),
    db.from('the8_session_recaps').select('campaign_id').in('campaign_id', ids),
  ])
  const count = (rows: { campaign_id: string }[] | null, id: string) => (rows ?? []).filter((r) => r.campaign_id === id).length
  return (campaigns ?? []).map((c) => ({
    ...c,
    acts: Array.isArray(c.acts) ? c.acts : [],
    safety: c.safety && typeof c.safety === 'object' ? c.safety : {},
    price: c.price == null ? null : Number(c.price),
    seats_taken: count(members, c.id) + count(invites, c.id),
    recaps: count(recaps, c.id),
  })) as Listing[]
}

/** Campaigns shown on the home page and Sessions, best first: open, on a break, full, finished. Cached for a minute. */
export const getListings = unstable_cache(
  async () => (await load()).sort((a, b) => ORDER[seatState(a)] - ORDER[seatState(b)] || a.sort_order - b.sort_order),
  ['listings-v1'],
  { revalidate: 60, tags: ['listings'] }
)

/** Call after anything that changes a card (details, players, invites). */
export function refreshListings() {
  try {
    revalidateTag('listings')
  } catch {}
}
