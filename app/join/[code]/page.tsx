import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getAuthUser } from '@/lib/auth'
import { createServerSupabase } from '@/lib/supabase-server'
import AuthShell from '@/components/auth/AuthShell'
import { refreshListings } from '@/lib/listings'

export const metadata = { title: 'Join a campaign', robots: { index: false } }

// Invite links look like braosatales.com/join/<code>. Opening one while signed in adds you as a player.
export default async function JoinPage({ params }: { params: { code: string } }) {
  const user = await getAuthUser()
  if (!user) redirect(`/sign-in?next=${encodeURIComponent(`/join/${params.code}`)}`)

  const db = createServerSupabase()
  const { data: campaign } = await db.from('campaigns').select('id, slug, title').eq('invite_code', params.code).maybeSingle()

  if (!campaign) {
    return (
      <AuthShell eyebrow="Invite link" title="Link not valid" subtitle="This invite link has expired or was replaced.">
        <p className="text-center leading-relaxed text-prose">
          Ask your game master for a new link, or check your <Link href="/dashboard" className="link-quiet">dashboard</Link>.
        </p>
      </AuthShell>
    )
  }

  await db
    .from('campaign_members')
    .upsert({ campaign_id: campaign.id, user_id: user.id, role: 'player' }, { onConflict: 'campaign_id,user_id', ignoreDuplicates: true })

  refreshListings()
  redirect(`/dashboard?joined=${campaign.slug}`)
}
