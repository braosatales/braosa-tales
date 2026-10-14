import type { User } from '@supabase/supabase-js'
import { createServerSupabase } from '@/lib/supabase-server'

export type CampaignRole = 'gm' | 'player'

export type Campaign = {
  id: string
  slug: string
  title: string
  tagline: string | null
  system: string | null
  levels: string | null
  cover_url: string | null
  hub_path: string | null
  status: 'active' | 'paused' | 'finished'
  invite_code: string
  sort_order: number
}

export type MyCampaign = Campaign & { role: CampaignRole }

/** Turn any email invites for this (confirmed) user into memberships. Safety net for the DB trigger. */
export async function claimInvites(user: User) {
  if (!user.email || !user.email_confirmed_at) return
  const db = createServerSupabase()
  const email = user.email.toLowerCase()
  const { data: invites } = await db.from('campaign_invites').select('campaign_id, email').ilike('email', email)
  if (!invites?.length) return
  await db
    .from('campaign_members')
    .upsert(invites.map((i) => ({ campaign_id: i.campaign_id, user_id: user.id, role: 'player' })), {
      onConflict: 'campaign_id,user_id',
      ignoreDuplicates: true,
    })
  await db.from('campaign_invites').delete().ilike('email', email)
}

export async function getMyCampaigns(userId: string): Promise<MyCampaign[]> {
  const { data } = await createServerSupabase()
    .from('campaign_members')
    .select('role, campaigns(*)')
    .eq('user_id', userId)
  return (data ?? [])
    .map((row) => ({ ...(row.campaigns as unknown as Campaign), role: row.role as CampaignRole }))
    .filter((c) => c && c.id)
    .sort((a, b) => a.sort_order - b.sort_order)
}

export type MemberView = { user_id: string; role: CampaignRole; email: string | null; name: string | null }
export type CampaignAdminView = Campaign & { members: MemberView[]; invites: string[] }

/** Campaigns this person runs, with members and pending invites (for the dashboard and the Manage tab). */
export async function getCampaignsForGM(userId: string, onlyCampaignId?: string): Promise<CampaignAdminView[]> {
  const db = createServerSupabase()
  const { data: mine } = await db.from('campaign_members').select('campaign_id').eq('user_id', userId).eq('role', 'gm')
  let ids = (mine ?? []).map((m) => m.campaign_id as string)
  if (onlyCampaignId) ids = ids.filter((id) => id === onlyCampaignId)
  if (!ids.length) return []
  const [{ data: campaigns }, { data: members }, { data: invites }] = await Promise.all([
    db.from('campaigns').select('*').in('id', ids).order('sort_order'),
    db.from('campaign_members').select('campaign_id, user_id, role, joined_at').in('campaign_id', ids).order('joined_at'),
    db.from('campaign_invites').select('campaign_id, email').in('campaign_id', ids).order('invited_at'),
  ])
  const userIds = Array.from(new Set((members ?? []).map((m) => m.user_id)))
  const { data: users } = userIds.length
    ? await db.from('users').select('id, email, full_name').in('id', userIds)
    : { data: [] as { id: string; email: string; full_name: string | null }[] }
  const byId = new Map((users ?? []).map((u) => [u.id, u]))
  return (campaigns ?? []).map((c) => ({
    ...(c as Campaign),
    members: (members ?? [])
      .filter((m) => m.campaign_id === c.id)
      .map((m) => ({
        user_id: m.user_id,
        role: m.role as CampaignRole,
        email: byId.get(m.user_id)?.email ?? null,
        name: byId.get(m.user_id)?.full_name || null,
      })),
    invites: (invites ?? []).filter((i) => i.campaign_id === c.id).map((i) => i.email),
  }))
}

/** Is this person a game master of this campaign? */
export async function isCampaignGM(campaignId: string, userId: string) {
  const { data } = await createServerSupabase()
    .from('campaign_members')
    .select('role')
    .eq('campaign_id', campaignId)
    .eq('user_id', userId)
    .maybeSingle()
  return data?.role === 'gm'
}

/** URL-safe, unique slug from a title: "Curse of the Crimson Tide" → "curse-of-the-crimson-tide". */
export async function uniqueSlug(title: string) {
  const base =
    title
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48) || 'campaign'
  const db = createServerSupabase()
  const { data } = await db.from('campaigns').select('slug').like('slug', `${base}%`)
  const taken = new Set((data ?? []).map((r) => r.slug as string))
  if (!taken.has(base)) return base
  for (let i = 2; ; i++) if (!taken.has(`${base}-${i}`)) return `${base}-${i}`
}
