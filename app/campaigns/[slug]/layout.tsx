import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import Nav from '@/components/NavServer'
import Footer from '@/components/Footer'
import HubHeader from '@/components/hub/HubHeader'
import HubTabs from '@/components/hub/HubTabs'
import { HubProvider } from '@/components/hub/HubContext'
import { getAuthUser } from '@/lib/auth'
import { campaignExists, getHub, getHubMembers } from '@/lib/hub/server'
import { createServerSupabase } from '@/lib/supabase-server'

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const hub = await getHub(params.slug)
  return {
    title: { default: hub?.campaign.title ?? 'Campaign', template: `%s · ${hub?.campaign.title ?? 'Campaign'}` },
    robots: { index: false },
  }
}

export default async function CampaignLayout({ children, params }: { children: React.ReactNode; params: { slug: string } }) {
  const user = await getAuthUser()
  if (!user) redirect(`/sign-in?next=${encodeURIComponent(`/campaigns/${params.slug}`)}`)

  const hub = await getHub(params.slug)
  if (!hub) {
    const exists = await campaignExists(params.slug)
    if (!exists) notFound()
    return (
      <main className="bg-night">
        <Nav />
        <section className="mx-auto max-w-[1180px] px-6 pb-24 pt-36 md:px-10">
          <p className="text-[0.9rem] text-ember">Members only</p>
          <h1 className="mt-1 font-cinzel text-[2.4rem] font-bold leading-tight text-vellum">{exists.title}</h1>
          <p className="mt-4 max-w-measure leading-relaxed text-prose">
            This campaign’s site is for the people at its table. If you play in it, ask your game master to add{' '}
            <span className="text-vellum">{user.email}</span>, or open the invite link they shared.
          </p>
          <Link href="/dashboard" className="btn-ghost mt-8">Back to your dashboard</Link>
        </section>
        <Footer />
      </main>
    )
  }

  const db = createServerSupabase()
  const [members, { data: pins }, { data: myCharacter }] = await Promise.all([
    getHubMembers(hub.campaign.id),
    db.from('campaign_pins').select('item_id').eq('user_id', user.id).eq('campaign_id', hub.campaign.id),
    db.from('the8_players').select('name').eq('campaign_id', hub.campaign.id).eq('user_id', user.id).limit(1),
  ])

  const roleLine = hub.gm ? 'You’re the game master' : myCharacter?.[0]?.name ? `You play ${myCharacter[0].name}` : 'You’re a player'

  return (
    <HubProvider
      value={{
        slug: params.slug,
        base: `/campaigns/${params.slug}`,
        api: `/api/hub/${params.slug}`,
        campaignId: hub.campaign.id,
        title: hub.campaign.title,
        gm: hub.gm,
        userId: user.id,
        members: members.map((m) => ({ user_id: m.user_id, name: m.name, email: m.email, role: m.role })),
        pinned: (pins ?? []).map((p) => p.item_id as string),
      }}
    >
      <div className="min-h-screen bg-night">
        <Nav />
        <HubHeader campaign={hub.campaign} roleLine={roleLine} />
        <HubTabs />
        <div className="mx-auto max-w-[1180px] px-6 pb-24 pt-10 md:px-10 md:pt-12">{children}</div>
        <Footer />
      </div>
    </HubProvider>
  )
}
