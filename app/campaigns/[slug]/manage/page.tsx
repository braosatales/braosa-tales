import { notFound, redirect } from 'next/navigation'
import { getHub } from '@/lib/hub/server'
import { getCampaignsForGM } from '@/lib/campaigns'
import { createServerSupabase } from '@/lib/supabase-server'
import MembersAdmin from '@/components/hub/MembersAdmin'
import { DiscordSessions, DiscordSettings, type ManageMessage, type ManageSession } from '@/components/hub/DiscordManage'
import { CoverForm, DeleteBlock, DetailsForm, ListingForm, MembersBlock, SafetyForm, WaitingList } from '@/components/hub/ManageClient'

export const metadata = { title: 'Manage' }

const SECTIONS = [
  ['details', 'Details'],
  ['listing', 'Listing'],
  ['safety', 'Table safety'],
  ['sessions', 'Sessions'],
  ['discord', 'Discord'],
  ['players', 'Players'],
  ['danger', 'Delete'],
] as const

// Game masters only. Players never see this tab.
export default async function ManagePage({ params }: { params: { slug: string } }) {
  const hub = await getHub(params.slug)
  if (!hub) notFound()
  if (!hub.gm) redirect(`/campaigns/${params.slug}`)
  const db = createServerSupabase()
  const cid = hub.campaign.id
  const since = new Date(Date.now() - 14 * 86400 * 1000).toISOString()
  const [[admin], { data: watchers }, { data: notes }, { data: sessions }] = await Promise.all([
    getCampaignsForGM(hub.user.id, cid),
    db.from('campaign_seat_watchers').select('email, created_at, notified_at').eq('campaign_id', cid).order('created_at'),
    db.from('campaign_safety_notes').select('id, kind, body, created_at').eq('campaign_id', cid).order('created_at'),
    db.from('campaign_sessions').select('id, session_number, title, starts_at, ends_at, status').eq('campaign_id', cid).gte('ends_at', since).order('starts_at').limit(20),
  ])
  const sessionIds = (sessions ?? []).map((s) => s.id as string)
  const { data: messages } = sessionIds.length
    ? await db
        .from('discord_messages')
        .select('id, session_id, kind, send_at, expires_at, draft_content, status, sent_at, sent_content, used_fallback, last_error')
        .in('session_id', sessionIds)
    : { data: [] }
  const pending = (messages ?? []).filter((m) => m.kind === 'post_session' && m.status === 'draft' && new Date(m.send_at) <= new Date()).length
  const seatsTaken = admin ? admin.members.filter((m) => m.role === 'player').length + admin.invites.length : 0

  return (
    <div>
      <h1 className="font-cinzel text-[2rem] font-bold text-vellum">Manage</h1>
      <p className="mt-1 text-mist">Only game masters see this tab.</p>
      <nav aria-label="Manage sections" className="mt-6 flex flex-wrap gap-2">
        {SECTIONS.map(([id, label]) => (
          <a key={id} href={`#${id}`} className="rounded-full border border-plum-line px-3.5 py-1 text-[0.88rem] text-prose hover:border-leaf hover:text-vellum">
            {label}
            {id === 'safety' && (notes?.length ?? 0) > 0 && <span className="ml-1.5 rounded-full bg-leaf px-1.5 text-[0.75rem] font-bold text-night">{notes!.length}</span>}
            {id === 'sessions' && pending > 0 && <span className="ml-1.5 rounded-full bg-leaf px-1.5 text-[0.75rem] font-bold text-night">{pending}</span>}
          </a>
        ))}
      </nav>
      <div className="mt-8">
        <div id="details" className="scroll-mt-40">
          <DetailsForm c={hub.campaign} />
          <CoverForm cover={hub.campaign.cover_url} />
        </div>
        <div id="listing" className="scroll-mt-40">
          <ListingForm c={hub.campaign} seatsTaken={seatsTaken} />
          <WaitingList watchers={watchers ?? []} />
        </div>
        <div id="safety" className="scroll-mt-40">
          <SafetyForm c={hub.campaign} notes={notes ?? []} />
        </div>
        <DiscordSessions c={hub.campaign} sessions={(sessions ?? []) as ManageSession[]} messages={(messages ?? []) as ManageMessage[]} />
        <DiscordSettings c={hub.campaign} />
        <div id="players" className="scroll-mt-40">
          {admin && (
            <MembersBlock>
              <MembersAdmin c={admin} />
            </MembersBlock>
          )}
        </div>
        <div id="danger" className="scroll-mt-40">
          <DeleteBlock title={hub.campaign.title} />
        </div>
      </div>
    </div>
  )
}
