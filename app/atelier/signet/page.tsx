import { getAuthUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import TheSignet from './TheSignet'

export const metadata = {
  title: "The Signet — Name Generator | Braosa's Atelier",
  description: "AI-powered name generator for characters, locations, factions and artifacts. Draw from 100+ real and constructed languages. Now in Alpha.",
}

export default async function SignetPage() {
  const user = await getAuthUser()
  if (!user) redirect('/sign-in?next=/atelier/signet')
  return (
    // Mobile: content starts below the nav. Desktop: the settings sidebar runs full height and the nav floats beside it.
    <div className="pt-[72px] md:pt-0" style={{minHeight:"100vh", background:"#12100D"}}>
      <TheSignet />
    </div>
  )
}
