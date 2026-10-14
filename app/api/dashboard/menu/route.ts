import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { getMyCampaigns } from '@/lib/campaigns'
import { createServerSupabase } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

// What the account menu shows: active campaigns and favourite apps.
export async function GET() {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [campaigns, { data: pins }] = await Promise.all([
    getMyCampaigns(user.id),
    createServerSupabase().from('user_pinned_tools').select('tool_slug').eq('user_id', user.id).order('pinned_at'),
  ])

  return NextResponse.json(
    {
      campaigns: campaigns
        .filter((c) => c.status === 'active')
        .map((c) => ({ slug: c.slug, title: c.title, role: c.role, href: `/campaigns/${c.slug}`, cover: c.cover_url })),
      favourites: (pins ?? []).map((p) => p.tool_slug as string),
    },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}
