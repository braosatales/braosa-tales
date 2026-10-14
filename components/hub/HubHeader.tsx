import Image from 'next/image'
import type { HubCampaign } from '@/lib/hub/server'

const STATUS: Record<string, string> = { paused: 'On a break', finished: 'Finished' }

export default function HubHeader({ campaign, roleLine }: { campaign: HubCampaign; roleLine: string }) {
  const meta = [campaign.system, campaign.levels ? `levels ${campaign.levels}` : null, STATUS[campaign.status]].filter(Boolean).join(' · ')
  return (
    <section className="relative overflow-hidden bg-umber">
      {campaign.cover_url ? (
        <Image src={campaign.cover_url} alt="" fill priority sizes="100vw" className="object-cover opacity-45" />
      ) : (
        <div className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-amethyst-deep/25 blur-[120px]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-night via-night/70 to-night/30" />
      <div className="relative mx-auto max-w-[1180px] px-6 pb-10 pt-32 md:px-10 md:pb-12 md:pt-40">
        {meta && <p className="text-[0.9rem] text-ember">{meta}</p>}
        <p className="mt-1 max-w-[20ch] font-cinzel text-[2.4rem] font-bold leading-[1.05] text-vellum md:text-[3.4rem]">{campaign.title}</p>
        {campaign.tagline && <p className="mt-3 max-w-measure text-[1.15rem] italic text-prose">{campaign.tagline}</p>}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-leaf/40 bg-night/60 px-3 py-1 text-[0.8rem] text-leaf-soft backdrop-blur-sm">{roleLine}</span>
          {campaign.links.map((l) => (
            <a
              key={l.url}
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-vellum/20 bg-night/50 px-3 py-1 text-[0.8rem] text-prose backdrop-blur-sm transition-colors hover:border-leaf hover:text-vellum"
            >
              {l.label}
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M7 17 17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
