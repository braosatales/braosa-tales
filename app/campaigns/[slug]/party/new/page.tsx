import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getHub } from '@/lib/hub/server'
import { createServerSupabase } from '@/lib/supabase-server'
import CharacterForm from '@/components/hub/CharacterForm'

export const metadata = { title: 'Add a character' }

export default async function NewCharacterPage({ params }: { params: { slug: string } }) {
  const hub = await getHub(params.slug)
  if (!hub) notFound()
  const base = `/campaigns/${params.slug}`
  if (!hub.gm) {
    const { data: mine } = await createServerSupabase().from('the8_players').select('id').eq('campaign_id', hub.campaign.id).eq('user_id', hub.user.id).limit(1)
    if (mine?.length) redirect(`${base}/party/${mine[0].id}`)
  }
  return (
    <div className="max-w-3xl">
      <Link href={`${base}/party`} className="text-[0.92rem] text-mist hover:text-vellum">← The party</Link>
      <h1 className="mt-3 font-cinzel text-[2rem] font-bold text-vellum">{hub.gm ? 'Add a character' : 'Add your character'}</h1>
      <div className="mt-8">
        <CharacterForm mode="new" />
      </div>
    </div>
  )
}
