import Image from 'next/image'
import Link from 'next/link'
import type { MyCampaign } from '@/lib/campaigns'

export default function CampaignTile({ c }: { c: MyCampaign }) {
  const body = (
    <>
      <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-umber-line via-umber to-plum">
        {c.cover_url ? (
          <Image src={c.cover_url} alt="" fill sizes="(min-width: 1024px) 380px, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
        ) : (
          <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center font-cinzel text-[3.5rem] font-bold text-vellum/15">
            {c.title.replace(/^The\s+/i, '').charAt(0)}
          </span>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-umber-deep via-transparent to-transparent" />
        <p className="absolute left-3 top-3 rounded-full bg-night/75 px-3 py-1 text-[0.72rem] font-bold text-leaf-soft backdrop-blur-sm">
          {c.role === 'gm' ? 'Game master' : 'Player'}
        </p>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-[0.8rem] text-ember">
          {c.system}
          {c.levels ? `, levels ${c.levels}` : ''}
        </p>
        <h3 className="mt-1 font-cinzel text-[1.3rem] font-bold leading-tight text-vellum">{c.title}</h3>
        {c.tagline && <p className="mt-1 text-[0.95rem] text-mist">{c.tagline}</p>}
        <p className={`mt-auto pt-5 text-[0.92rem] ${c.hub_path ? 'text-leaf-soft group-hover:text-vellum' : 'text-mist/80'}`}>
          {c.hub_path ? 'Enter the campaign site' : 'Campaign site opening soon'}
        </p>
      </div>
    </>
  )

  const cls = 'group flex w-full flex-col overflow-hidden rounded-2xl border border-umber-line bg-umber-deep/80'
  return c.hub_path ? (
    <Link href={c.hub_path} className={`${cls} transition-colors hover:border-leaf/50`}>
      {body}
    </Link>
  ) : (
    <article className={cls}>{body}</article>
  )
}
