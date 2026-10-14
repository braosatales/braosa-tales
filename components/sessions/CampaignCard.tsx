import Image from 'next/image'
import Link from 'next/link'
import { GM } from '@/lib/sessions'
import { formatPrice, seatState, seatsLeft, RATINGS, type Listing } from '@/lib/listings'
import SeatWatch from './SeatWatch'

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII']

function Badge({ l }: { l: Listing }) {
  const state = seatState(l)
  const left = seatsLeft(l)
  if (state === 'finished') return null
  const base = 'absolute left-4 top-4 rounded-full px-3 py-1 text-[0.72rem] font-bold backdrop-blur-sm'
  if (state === 'last') return <p className={`${base} bg-leaf tracking-[0.12em] text-night shadow-[0_0_18px_rgba(212,174,88,0.45)]`}>LAST SEAT</p>
  if (state === 'full') return <p className={`${base} bg-night/75 text-mist`}>Full</p>
  if (state === 'paused') return <p className={`${base} bg-night/75 text-mist`}>On a break</p>
  return <p className={`${base} bg-night/70 text-leaf-soft`}>{left ? `${left} seats open` : 'Seats open'}</p>
}

/** A StartPlaying-style listing card, driven by the campaign's Manage tab. */
export default function CampaignCard({ c, detailed = false }: { c: Listing; detailed?: boolean }) {
  const state = seatState(c)
  const finished = state === 'finished'
  const canBook = state === 'open' || state === 'last'
  const price = formatPrice(c.price, c.currency)
  const told = c.sessions_played ?? c.recaps
  const meta = [c.system, c.levels ? `levels ${c.levels}` : null].filter(Boolean).join(', ')
  const rating = RATINGS.find((r) => r.value === c.safety.rating)?.label
  const content = c.safety.content ?? []
  const tools = c.safety.tools ?? []

  return (
    <article className={`group flex h-full flex-col overflow-hidden rounded-2xl border bg-umber-deep/80 ${state === 'last' ? 'border-leaf/50' : 'border-umber-line'}`}>
      <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-umber-line via-umber to-plum">
        {c.cover_url && (
          <Image
            src={c.cover_url}
            alt={`${c.title} cover art`}
            fill
            sizes="(min-width: 1024px) 540px, 86vw"
            className={`object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03] ${finished ? 'grayscale brightness-[0.55]' : ''}`}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-umber-deep via-umber-deep/10 to-transparent" />
        <Badge l={c} />
        {finished && (
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div className="-rotate-[7deg] rounded-md border-[3px] border-double border-leaf/80 bg-night/40 px-6 py-3 text-center backdrop-blur-[2px]">
              <p className="font-cinzel text-[1.35rem] font-bold tracking-[0.14em] text-leaf-soft">CAMPAIGN COMPLETE</p>
              {told > 0 && (
                <p className="mt-1 font-cinzel text-[0.78rem] tracking-[0.16em] text-vellum/90">
                  THIS STORY WAS TOLD IN {told} {told === 1 ? 'SESSION' : 'SESSIONS'}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col px-6 pb-6 pt-1 md:px-7">
        {meta && <p className="text-[0.8rem] text-ember">{meta}</p>}
        <h3 className="mt-1 font-cinzel text-[1.6rem] font-bold leading-tight text-vellum">{c.title}</h3>
        {c.listed_as && <p className="mt-1 text-[0.85rem] italic text-mist">Listed on StartPlaying as “{c.listed_as}”</p>}

        {c.tagline && <p className="mt-4 text-[1.05rem] font-medium leading-snug text-leaf-soft">{c.tagline}</p>}
        {c.pitch && <p className="mt-2 leading-relaxed text-prose">{c.pitch}</p>}

        {c.acts.length > 0 && (
          <ol className="mt-5 space-y-2 border-l border-umber-line pl-4">
            {c.acts.map((a, i) => (
              <li key={`${a.name}-${i}`} className="text-[0.92rem] leading-snug">
                <span className="text-vellum">
                  Act {ROMAN[i] ?? i + 1} · {a.name}
                </span>{' '}
                {a.levels && <span className="text-mist">levels {a.levels}</span>}
                {detailed && a.summary && <span className="block text-prose/90">{a.summary}</span>}
              </li>
            ))}
          </ol>
        )}

        {detailed && (rating || content.length > 0 || tools.length > 0) && (
          <div className="mt-5 rounded-xl border border-umber-line bg-night/30 px-4 py-3 text-[0.88rem] leading-relaxed">
            {rating && <p className="text-vellum">{rating}</p>}
            {content.length > 0 && (
              <p className="text-prose">
                <span className="text-mist">May include: </span>
                {content.join(', ')}
              </p>
            )}
            {tools.length > 0 && (
              <p className="text-prose">
                <span className="text-mist">Safety tools: </span>
                {tools.join(', ')}
              </p>
            )}
          </div>
        )}

        <div className="mt-auto flex flex-wrap items-end justify-between gap-4 pt-7">
          {!finished && price ? (
            <p className="leading-tight">
              <span className="font-cinzel text-2xl font-bold text-vellum">{price}</span>
              <span className="text-mist"> per session</span>
              {(c.session_length || c.frequency) && (
                <span className="block text-[0.85rem] text-mist">{[c.session_length, c.frequency].filter(Boolean).join(', ')}</span>
              )}
            </p>
          ) : (
            <span />
          )}
          <div className="flex flex-wrap items-center gap-4">
            {!detailed && !finished && (
              <Link href={`/games#${c.slug}`} className="link-quiet text-[0.9rem]">
                Details
              </Link>
            )}
            {canBook && (
              <a href={c.booking_url || GM.profileUrl} target="_blank" rel="noopener noreferrer" className="btn-gold">
                Book a seat
                <span className="sr-only"> in {c.title} on StartPlaying (opens in a new tab)</span>
              </a>
            )}
            {(state === 'full' || state === 'paused') && <SeatWatch slug={c.slug} title={c.title} />}
            {finished && (
              <Link href="/games#notify" className="link-quiet text-[0.9rem]">
                Hear about new tables
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
