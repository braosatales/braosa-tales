import type { Metadata } from 'next'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Nav from '@/components/NavServer'
import Footer from '@/components/Footer'
import SettingsForms from '@/components/settings/SettingsForms'
import { getAuthUser, getUserProfile, displayName, avatarUrl } from '@/lib/auth'
import { TEXT_SIZE_COOKIE, isTextSize } from '@/lib/prefs'

export const metadata: Metadata = { title: 'Account settings', robots: { index: false } }

export default async function SettingsPage() {
  const user = await getAuthUser()
  if (!user) redirect('/sign-in?next=/settings')

  const profile = await getUserProfile(user.id)
  const cookieSize = cookies().get(TEXT_SIZE_COOKIE)?.value
  const savedSize = (profile?.preferences as { textSize?: string } | null)?.textSize
  const textSize = isTextSize(cookieSize) ? cookieSize : isTextSize(savedSize) ? savedSize : 'md'
  const providers = Array.from(new Set((user.identities ?? []).map((i) => i.provider)))

  return (
    <main className="bg-night">
      <Nav />
      <section className="mx-auto max-w-[1180px] px-6 pb-10 pt-32 md:px-10 md:pt-36">
        <Link href="/dashboard" className="text-[0.92rem] text-mist hover:text-vellum">← Your dashboard</Link>
        <h1 className="mt-3 font-cinzel text-[2.4rem] font-bold leading-tight text-vellum md:text-[3rem]">Account settings</h1>
      </section>
      <div className="mx-auto max-w-[1180px] px-6 pb-24 md:px-10">
        <SettingsForms
          initialName={displayName(user)}
          email={user.email ?? ''}
          avatar={avatarUrl(user)}
          providers={providers}
          textSize={textSize}
          tier={profile?.tier ?? null}
          credits={profile ? (profile.credits ?? 0) + (profile.daily_credits ?? 0) : null}
        />
      </div>
      <Footer />
    </main>
  )
}
