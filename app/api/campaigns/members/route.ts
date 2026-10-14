import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { isCampaignGM } from '@/lib/campaigns'
import { createServerSupabase } from '@/lib/supabase-server'

const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)

// Only a game master of that campaign may change who's in it.
async function guard(campaignId: unknown) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (typeof campaignId !== 'string' || !(await isCampaignGM(campaignId, user.id))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  return null
}

// POST { campaignId, email } — add a player. If they have no account yet, it's saved
// as an invite and turns into a membership when they sign up with that email.
export async function POST(req: Request) {
  const { campaignId, email: raw } = await req.json()
  const denied = await guard(campaignId)
  if (denied) return denied

  const email = String(raw ?? '').trim().toLowerCase()
  if (!campaignId || !isEmail(email)) return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })

  const db = createServerSupabase()
  const { data: existing } = await db.from('users').select('id').ilike('email', email).limit(1)
  // Only accounts that are linked to a login (users.id = auth.uid()) can be members.
  const userId = existing?.[0]?.id as string | undefined

  if (userId) {
    const { error } = await db
      .from('campaign_members')
      .upsert({ campaign_id: campaignId, user_id: userId, role: 'player' }, { onConflict: 'campaign_id,user_id', ignoreDuplicates: true })
    if (!error) return NextResponse.json({ status: 'added' })
    // Old account that hasn't signed in since the move to the new login: fall back to an invite.
  }

  const { error } = await db
    .from('campaign_invites')
    .upsert({ campaign_id: campaignId, email }, { onConflict: 'campaign_id,email', ignoreDuplicates: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ status: 'invited' })
}

// DELETE { campaignId, userId } or { campaignId, email } — remove a member or a pending invite
export async function DELETE(req: Request) {
  const { campaignId, userId, email } = await req.json()
  const denied = await guard(campaignId)
  if (denied) return denied

  if (!campaignId || (!userId && !email)) return NextResponse.json({ error: 'Missing member' }, { status: 400 })

  const db = createServerSupabase()
  const { error } = userId
    ? await db.from('campaign_members').delete().eq('campaign_id', campaignId).eq('user_id', userId).neq('role', 'gm')
    : await db.from('campaign_invites').delete().eq('campaign_id', campaignId).ilike('email', String(email).toLowerCase())
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (userId) {
    // Their character stays in the party, just no longer linked to their account.
    await db.from('the8_players').update({ user_id: null }).eq('campaign_id', campaignId).eq('user_id', userId)
    await db.from('campaign_pins').delete().eq('campaign_id', campaignId).eq('user_id', userId)
  }
  return NextResponse.json({ ok: true })
}
