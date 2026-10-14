import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { isCampaignGM } from '@/lib/campaigns'
import { createServerSupabase } from '@/lib/supabase-server'

// POST { campaignId } — replace the campaign's invite link (the old one stops working)
export async function POST(req: Request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { campaignId } = await req.json()
  if (typeof campaignId !== 'string' || !(await isCampaignGM(campaignId, user.id))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const code = crypto.randomUUID().replace(/-/g, '')
  const { error } = await createServerSupabase().from('campaigns').update({ invite_code: code }).eq('id', campaignId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ code })
}
