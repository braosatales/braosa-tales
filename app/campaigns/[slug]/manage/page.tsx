import { notFound, redirect } from 'next/navigation'
import { getHub } from '@/lib/hub/server'
import { getCampaignsForGM } from '@/lib/campaigns'
import MembersAdmin from '@/components/hub/MembersAdmin'
import { CoverForm, DeleteBlock, DetailsForm, MembersBlock } from '@/components/hub/ManageClient'

export const metadata = { title: 'Manage' }

// Game masters only. Players never see this tab.
export default async function ManagePage({ params }: { params: { slug: string } }) {
  const hub = await getHub(params.slug)
  if (!hub) notFound()
  if (!hub.gm) redirect(`/campaigns/${params.slug}`)
  const [admin] = await getCampaignsForGM(hub.user.id, hub.campaign.id)

  return (
    <div>
      <h1 className="font-cinzel text-[2rem] font-bold text-vellum">Manage</h1>
      <p className="mt-1 text-mist">Only game masters see this tab.</p>
      <div className="mt-10">
        <DetailsForm c={hub.campaign} />
        <CoverForm cover={hub.campaign.cover_url} />
        {admin && (
          <MembersBlock>
            <MembersAdmin c={admin} />
          </MembersBlock>
        )}
        <DeleteBlock title={hub.campaign.title} />
      </div>
    </div>
  )
}
