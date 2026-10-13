import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import Nav from '@/components/NavServer'
import Footer from '@/components/Footer'
import { SectionTitle } from '@/components/PageHero'
import CampaignTile from '@/components/dashboard/CampaignTile'
import AtelierPanel from '@/components/dashboard/AtelierPanel'
import GMPanel from '@/components/dashboard/GMPanel'
import { getAuthUser, getUserProfile, displayName } from '@/lib/auth'
import { claimInvites, getMyCampaigns, getCampaignsForGM } from '@/lib/campaigns'
import { isAdmin } from '@/lib/the8adventurers/isAdmin'
import { createServerSupabase } from '@/lib/supabase-server'

export const metadata: Metadata = { title: 'Your dashboard', robots: { index: false } }

type SavedName = { id: string; name: string; pronunciation: string | null; language: string | null; meaning: string | null }
type Preset = { id: string; name: string; favourite: boolean | null }

export default async function DashboardPage({ searchParams }: { searchParams: { joined?: string } }) {
  const user = await getAuthUser()
  if (!user) redirect('/sign-in?next=/dashboard')

  await claimInvites(user)

  const db = createServerSupabase()
  const admin = await isAdmin()
  const [profile, campaigns, savedRes, presetsRes, pinsRes, gmCampaigns] = await Promise.all([
    getUserProfile(user.id),
    getMyCampaigns(user.id),
    db.from('saved_names').select('id, name, pronunciation, language, meaning').eq('user_id', user.id).order('saved_at', { ascending: false }).limit(6),
    db.from('presets').select('id, name, favourite').eq('user_id', user.id).order('created_at', { ascending: false }),
    db.from('user_pinned_tools').select('tool_slug').eq('user_id', user.id),
    admin ? getCampaignsForGM() : Promise.resolve([]),
  ])

  const saved = (savedRes.data ?? []) as SavedName[]
  const presets = ((presetsRes.data ?? []) as Preset[]).sort((a, b) => Number(!!b.favourite) - Number(!!a.favourite))
  const pins = (pinsRes.data ?? []).map((p) => p.tool_slug as string)
  const firstName = displayName(user).split(' ')[0]
  const joined = searchParams.joined ? campaigns.find((c) => c.slug === searchParams.joined) : null
  const credits = profile ? (profile.credits ?? 0) + (profile.daily_credits ?? 0) : null

  return (
    <main className="bg-night">
      <Nav />

      {/* Welcome */}
      <section className="mx-auto max-w-[1180px] px-6 pb-12 pt-32 md:px-10 md:pt-36">
        <h1 className="font-cinzel text-[2.4rem] font-bold leading-tight text-vellum md:text-[3rem]">
          {firstName ? `Welcome back, ${firstName}.` : 'Welcome back.'}
        </h1>
        <p className="mt-3 text-mist">
          {profile?.tier && <span className="capitalize text-vellum">{profile.tier} plan</span>}
          {credits !== null && <> with {credits.toLocaleString()} credits to spend.</>}{' '}
          <Link href="/pricing" className="link-quiet">Plans</Link>
        </p>
        {joined && (
          <p role="status" className="mt-6 rounded-xl border border-leaf/40 bg-leaf/10 px-4 py-3 text-leaf-soft">
            You’ve joined {joined.title}. It’s in your campaigns below.
          </p>
        )}
      </section>

      {/* Campaigns */}
      <section className="bg-umber">
        <div className="mx-auto max-w-[1180px] px-6 py-16 md:px-10 md:py-20">
          <SectionTitle>Your campaigns</SectionTitle>
          {campaigns.length > 0 ? (
            <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {campaigns.map((c) => (
                <li key={c.id} className="flex">
                  <CampaignTile c={c} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-6 max-w-measure">
              <p className="leading-relaxed text-prose">
                You’re not at a table yet. Book a seat in one of the live campaigns, and your game master will add you here.
                If they sent you an invite link, open it while signed in.
              </p>
              <Link href="/games" className="btn-gold mt-6">Find a campaign</Link>
            </div>
          )}
        </div>
      </section>

      {/* Atelier */}
      <section className="bg-plum">
        <div className="mx-auto grid max-w-[1180px] gap-14 px-6 py-16 md:px-10 md:py-20 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <div>
            <SectionTitle>Your Atelier</SectionTitle>
            <p className="mt-2 text-mist">Open tools are always here. Star any other tool to pin it.</p>
            <div className="mt-8">
              <AtelierPanel initialPins={pins} />
            </div>
          </div>

          <div className="space-y-12">
            <div>
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="font-cinzel text-[1.25rem] font-bold text-vellum">Saved names</h3>
                {saved.length > 0 && <Link href="/atelier/signet?tab=saved" className="link-quiet text-[0.9rem]">See all</Link>}
              </div>
              {saved.length > 0 ? (
                <ul className="mt-4 divide-y divide-plum-line border-y border-plum-line">
                  {saved.map((n) => (
                    <li key={n.id} className="py-3">
                      <p className="font-cinzel text-[1.05rem] font-bold text-vellum">
                        {n.name}
                        {n.pronunciation && <span className="ml-2 font-text text-[0.88rem] font-normal italic text-mist">{n.pronunciation}</span>}
                      </p>
                      {(n.meaning || n.language) && (
                        <p className="text-[0.9rem] leading-snug text-mist">
                          {n.meaning}
                          {n.meaning && n.language ? ' — ' : ''}
                          {n.language && <span className="text-mist/80">{n.language}</span>}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 leading-relaxed text-prose">
                  Star a name in The Signet and it shows up here.{' '}
                  <Link href="/atelier/signet" className="link-quiet">Open The Signet</Link>
                </p>
              )}
            </div>

            <div>
              <h3 className="font-cinzel text-[1.25rem] font-bold text-vellum">Presets</h3>
              {presets.length > 0 ? (
                <ul className="mt-4 flex flex-wrap gap-2">
                  {presets.map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/atelier/signet?preset=${p.id}`}
                        className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[0.92rem] transition-colors ${
                          p.favourite ? 'border-leaf/60 text-leaf-soft hover:bg-leaf/10' : 'border-plum-line text-prose hover:border-amethyst hover:text-vellum'
                        }`}
                      >
                        {p.favourite && <span aria-label="Default preset">★</span>}
                        {p.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 leading-relaxed text-prose">
                  Save your favourite language and style mix as a preset in The Signet to start from it in one click.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* GM tools */}
      {admin && gmCampaigns.length > 0 && (
        <section className="mx-auto max-w-[1180px] px-6 py-16 md:px-10 md:py-20">
          <SectionTitle>Game master</SectionTitle>
          <p className="mt-2 max-w-measure text-mist">
            Add players by email or share a campaign’s invite link. Only you can see this section.
          </p>
          <div className="mt-8">
            <GMPanel campaigns={gmCampaigns} />
          </div>
        </section>
      )}

      <Footer />
    </main>
  )
}
