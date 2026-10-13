import Image from 'next/image'
import Link from 'next/link'
import type { Campaign } from '@/lib/sessions'

const statusLabel: Record<Campaign['status'], string> = {
  open: 'Seats open',
  full: 'Table full',
  soon: 'Opening soon',
}

/** A StartPlaying-style listing card for one live campaign. */
export default function CampaignCard({ c, detailed = false }: { c: Campaign; detailed?: boolean }) {
  const canBook = c.status === 'open'
  return (
    <article id={c.slug} className="group flex scroll-mt-28 flex-col overflow-hidden rounded-2xl border border-umber-line bg-umber-deep/80">
      <div className="relative aspect-[16/9] overflow-hidden">
        <Image
          src={c.cover}
          alt={c.coverAlt}
          fill
          sizes="(min-width: 1024px) 560px, 100vw"
          className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-umber-deep via-umber-deep/10 to-transparent" />
        <p
          className={`absolute left-4 top-4 rounded-full px-3 py-1 text-[0.7rem] font-bold tracking-wide backdrop-blur-sm ${
            canBook ? 'bg-night/70 text-leaf-soft' : 'bg-night/70 text-mist'
          }`}
        >
          {statusLabel[c.status]}
        </p>
      </div>

      <div className="flex flex-1 flex-col px-6 pb-6 pt-1 md:px-7">
        <p className="text-[0.8rem] text-ember">
          {c.system}, levels {c.levels}
        </p>
        <h3 className="mt-1 font-cinzel text-[1.6rem] font-bold leading-tight text-vellum">{c.title}</h3>
        <p className="mt-1 text-[0.85rem] italic text-mist">Listed on StartPlaying as “{c.listedAs}”</p>

        <p className="mt-4 text-[1.05rem] font-medium leading-snug text-leaf-soft">{c.hook}</p>
        <p className="mt-2 leading-relaxed text-prose">{c.pitch}</p>

        <ol className="mt-5 space-y-2 border-l border-umber-line pl-4">
          {c.acts.map((a, i) => (
            <li key={a.name} className="text-[0.92rem] leading-snug">
              <span className="text-vellum">
                Act {['I', 'II', 'III', 'IV'][i]} · {a.name}
              </span>{' '}
              <span className="text-mist">levels {a.levels}</span>
              {detailed && <span className="block text-prose/90">{a.summary}</span>}
            </li>
          ))}
        </ol>

        <div className="mt-auto flex flex-wrap items-end justify-between gap-4 pt-7">
          <p className="leading-tight">
            <span className="font-cinzel text-2xl font-bold text-vellum">{c.pricePerSession}</span>
            <span className="text-mist"> per session</span>
            <span className="block text-[0.85rem] text-mist">{c.sessionLength}, weekly</span>
          </p>
          <div className="flex items-center gap-4">
            {!detailed && (
              <Link href={`/games#${c.slug}`} className="link-quiet text-[0.9rem]">
                Details
              </Link>
            )}
            {canBook ? (
              <a href={c.bookUrl} target="_blank" rel="noopener noreferrer" className="btn-gold">
                Book a seat
                <span className="sr-only"> in {c.title} on StartPlaying (opens in a new tab)</span>
              </a>
            ) : (
              <span className="btn-ghost cursor-default opacity-60">{statusLabel[c.status]}</span>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
