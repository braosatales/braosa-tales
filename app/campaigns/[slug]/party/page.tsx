import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getHub, getHubMembers } from '@/lib/hub/server'
import { getParty, hasStale } from '@/lib/hub/party'
import PartySync from '@/components/hub/PartySync'
import CharacterCard from '@/components/hub/CharacterCard'
import { HubSectionTitle, EmptyNote } from '@/components/hub/Section'

export const metadata = { title: 'The party' }

export default async function PartyPage({ params }: { params: { slug: string } }) {
  const hub = await getHub(params.slug)
  if (!hub) notFound()
  const base = `/campaigns/${params.slug}`
  const [party, members] = await Promise.all([getParty(hub), getHubMembers(hub.campaign.id)])
  const hasMine = party.some((p) => p.user_id === hub.user.id)
  const nameOf = (uid: string | null) => (uid ? members.find((m) => m.user_id === uid)?.name ?? null : null)
  const unassigned = hub.gm ? members.filter((m) => m.role === 'player' && !party.some((p) => p.user_id === m.user_id)) : []

  return (
    <div>
      {hasStale(party) && <PartySync />}
      <HubSectionTitle
        as="h1"
        action={(hub.gm || !hasMine) && <Link href={`${base}/party/new`} className="btn-primary">{hub.gm ? 'Add a character' : 'Add your character'}</Link>}
      >
        The party
      </HubSectionTitle>
      {party.length ? (
        <ul className="mt-8 grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {party.map((p) => (
            <li key={p.id}>
              <CharacterCard p={p} href={`${base}/party/${p.id}`} playedBy={nameOf(p.user_id)} mine={p.user_id === hub.user.id} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-8">
          <EmptyNote>No characters yet.</EmptyNote>
        </div>
      )}
      {unassigned.length > 0 && (
        <p className="mt-8 text-[0.95rem] text-mist">
          Still without a character: {unassigned.map((m) => m.name || m.email).join(', ')}. They can add their own from this page.
        </p>
      )}
    </div>
  )
}
