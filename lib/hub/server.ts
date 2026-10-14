import { cache } from 'react'
import { NextResponse } from 'next/server'
import type { User } from '@supabase/supabase-js'
import { getAuthUser, displayName } from '@/lib/auth'
import { createServerSupabase } from '@/lib/supabase-server'
import type { Campaign, CampaignRole } from '@/lib/campaigns'

export type CampaignLink = { label: string; url: string }
export type HubCampaign = Campaign & { description: string | null; links: CampaignLink[] }
export type HubMember = { user_id: string; role: CampaignRole; name: string | null; email: string | null; avatar: string | null }

export type Hub = {
  campaign: HubCampaign
  user: User
  role: CampaignRole
  /** True for this campaign's game master(s). Controls secrets and editing. */
  gm: boolean
}

/** The campaign, plus who's asking. Null when it doesn't exist or the person isn't at this table. Cached per request. */
export const getHub = cache(async (slug: string): Promise<Hub | null> => {
  const user = await getAuthUser()
  if (!user) return null
  const db = createServerSupabase()
  const { data: campaign } = await db.from('campaigns').select('*').eq('slug', slug).maybeSingle()
  if (!campaign) return null
  const { data: member } = await db
    .from('campaign_members')
    .select('role')
    .eq('campaign_id', campaign.id)
    .eq('user_id', user.id)
    .maybeSingle()
  if (!member) return null
  const role = member.role as CampaignRole
  return {
    campaign: { ...campaign, links: Array.isArray(campaign.links) ? campaign.links : [] } as HubCampaign,
    user,
    role,
    gm: role === 'gm',
  }
})

/** Does a campaign with this slug exist at all? (So non-members see "ask your GM", not a 404.) */
export async function campaignExists(slug: string) {
  const { data } = await createServerSupabase().from('campaigns').select('title').eq('slug', slug).maybeSingle()
  return data as { title: string } | null
}

/** Members with display names, for the party, manage tab and character assignment. */
export const getHubMembers = cache(async (campaignId: string): Promise<HubMember[]> => {
  const db = createServerSupabase()
  const { data: rows } = await db.from('campaign_members').select('user_id, role, joined_at').eq('campaign_id', campaignId).order('joined_at')
  const ids = (rows ?? []).map((r) => r.user_id)
  if (!ids.length) return []
  const { data: users } = await db.from('users').select('id, email, full_name, avatar_url').in('id', ids)
  const byId = new Map((users ?? []).map((u) => [u.id, u]))
  // Prefer the name people chose in Settings (auth metadata) over the provider's.
  const authNames = new Map<string, string>()
  await Promise.all(
    ids.map(async (id) => {
      const { data } = await db.auth.admin.getUserById(id)
      if (data?.user) authNames.set(id, displayName(data.user))
    })
  )
  return (rows ?? []).map((r) => ({
    user_id: r.user_id,
    role: r.role as CampaignRole,
    name: authNames.get(r.user_id) || byId.get(r.user_id)?.full_name || null,
    email: byId.get(r.user_id)?.email ?? null,
    avatar: byId.get(r.user_id)?.avatar_url ?? null,
  }))
})

/** For API routes: resolve the campaign and check membership (and GM role when asked).
 *  Returns the hub, or a ready-made error response: `if (hub instanceof NextResponse) return hub`. */
export async function hubApi(slug: string, opts: { gm?: boolean } = {}): Promise<Hub | NextResponse> {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const hub = await getHub(slug)
  if (!hub) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (opts.gm && !hub.gm) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  return hub
}

/** Does this row (in a hub table) belong to the campaign? Guards child-table writes. */
export async function ownsRow(table: string, id: string, campaignId: string) {
  const { data } = await createServerSupabase().from(table).select('id').eq('id', id).eq('campaign_id', campaignId).maybeSingle()
  return !!data
}

/** Keep only the ids that belong to this campaign (for links between entries, quest players, etc.). */
export async function idsInCampaign(table: string, ids: unknown, campaignId: string): Promise<string[]> {
  if (!Array.isArray(ids) || ids.length === 0) return []
  const clean = ids.filter((x): x is string => typeof x === 'string')
  if (!clean.length) return []
  const { data } = await createServerSupabase().from(table).select('id').eq('campaign_id', campaignId).in('id', clean)
  return (data ?? []).map((r) => r.id as string)
}
