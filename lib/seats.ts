import { createServerSupabase } from '@/lib/supabase-server'
import { sendEmail, emailHtml } from '@/lib/email'
import { refreshListings } from '@/lib/listings'
import { GM } from '@/lib/sessions'

/** How many seats are left (null if the campaign has no seat limit). */
export async function seatsLeftFor(campaignId: string) {
  const db = createServerSupabase()
  const [{ data: c }, { count: players }, { count: invites }] = await Promise.all([
    db.from('campaigns').select('seats_total, status').eq('id', campaignId).maybeSingle(),
    db.from('campaign_members').select('user_id', { count: 'exact', head: true }).eq('campaign_id', campaignId).eq('role', 'player'),
    db.from('campaign_invites').select('email', { count: 'exact', head: true }).eq('campaign_id', campaignId),
  ])
  if (!c || c.seats_total == null) return { left: null as number | null, status: c?.status ?? 'active' }
  return { left: Math.max(0, c.seats_total - (players ?? 0) - (invites ?? 0)), status: c.status as string }
}

/**
 * Call after a player leaves, an invite is cancelled, or seats are added.
 * If the campaign is running and has a free seat, everyone waiting gets one email.
 */
export async function onSeatsMaybeOpened(campaignId: string) {
  refreshListings()
  const { left, status } = await seatsLeftFor(campaignId)
  if (status !== 'active' || (left !== null && left < 1)) return
  const db = createServerSupabase()
  const [{ data: c }, { data: waiting }] = await Promise.all([
    db.from('campaigns').select('title, booking_url').eq('id', campaignId).single(),
    db.from('campaign_seat_watchers').select('id, email').eq('campaign_id', campaignId).is('notified_at', null),
  ])
  if (!c || !waiting?.length) return
  const url = c.booking_url || GM.profileUrl
  const sent: string[] = []
  for (const w of waiting) {
    const ok = await sendEmail({
      to: w.email,
      subject: `A seat opened in ${c.title}`,
      text: `A seat just opened in ${c.title}. Seats go first come, first served: ${url}`,
      html: emailHtml({
        heading: `A seat opened in ${c.title}`,
        body: 'You asked us to tell you. Seats go first come, first served, so if you want it, book it now.',
        cta: { label: 'Book the seat', url },
      }),
    })
    if (ok) sent.push(w.id)
  }
  if (sent.length) await db.from('campaign_seat_watchers').update({ notified_at: new Date().toISOString() }).in('id', sent)
}
