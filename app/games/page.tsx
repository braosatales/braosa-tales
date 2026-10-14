import type { Metadata } from 'next'
import Nav from '@/components/NavServer'
import Footer from '@/components/Footer'
import CampaignCard from '@/components/sessions/CampaignCard'
import LocalTime from '@/components/sessions/LocalTime'
import NotifyForm from '@/components/sessions/NotifyForm'
import { GM } from '@/lib/sessions'
import { getListings, seatState, formatPrice } from '@/lib/listings'
import CampaignCarousel from '@/components/sessions/CampaignCarousel'

export const metadata: Metadata = {
  title: 'Sessions',
  description:
    'Live D&D 5e campaigns online with John Rodrigues, from first level to the final battle. Beginners welcome. Book a seat on StartPlaying.',
  alternates: { canonical: 'https://braosatales.com/games' },
}

const steps = [
  { title: 'Choose a campaign', text: 'Read the campaigns above and pick the one that pulls you in.' },
  { title: 'Book on StartPlaying', text: 'Reserve your seat and pay per session through StartPlaying, which handles payments and refunds.' },
  { title: 'Get your invites', text: 'Before the first session you’ll get the Discord server, the Foundry table and the D&D Beyond campaign.' },
]

const faqsFor = (price: string) => [
  {
    q: 'I’ve never played D&D. Can I join?',
    a: 'Yes. Beginners are welcome at every table. Rules are explained as they come up, so you can learn while you play.',
  },
  {
    q: 'What do I need?',
    a: 'A computer with a browser and a microphone. We use Discord for voice, Foundry VTT for maps and tokens (it runs in your browser, nothing to buy) and D&D Beyond for character sheets (a free account is enough).',
  },
  {
    q: 'When do sessions run?',
    a: 'On weekday mornings in Lisbon, 5:00 to 8:00. For the Americas that’s the evening before; for Australia and New Zealand it’s afternoon or evening. Each listing on StartPlaying shows its exact day.',
  },
  {
    q: 'How much does it cost?',
    a: `${price}, paid through StartPlaying. You book and pay session by session.`,
  },
  {
    q: 'What language are games played in?',
    a: 'English. John also speaks Português and Español, so you’re welcome to ask questions in either.',
  },
]

const WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight']

export default async function SessionsPage() {
  const listings = await getListings()
  const running = listings.filter((l) => seatState(l) !== 'finished')
  const prices = Array.from(new Set(running.map((l) => l.price).filter((p): p is number => p != null)))
  const currency = running.find((l) => l.price != null)?.currency ?? 'USD'
  const priceLine = prices.length === 0 ? 'Priced per session' : prices.length === 1 ? `${formatPrice(prices[0], currency)} per session` : `From ${formatPrice(Math.min(...prices), currency)} per session`
  const lengths = Array.from(new Set(running.map((l) => l.session_length).filter(Boolean)))
  const faqs = faqsFor(priceLine)
  const count = running.length === 1 ? 'One long campaign' : `${WORDS[running.length] ?? running.length} long campaigns`

  return (
    <main className="bg-night">
      <Nav />

      <section className="bg-umber">
        <div className="mx-auto max-w-[1180px] px-6 pb-16 pt-32 md:px-10 md:pb-20 md:pt-40">
          <h1 className="max-w-[16ch] font-cinzel text-[2.6rem] font-bold leading-[1.05] text-vellum md:text-[3.6rem]">
            Live D&amp;D, every week
          </h1>
          <p className="mt-5 max-w-measure text-[1.15rem] leading-relaxed text-prose">
            {count} run online by {GM.name}, from first level to the final battle. Beginners welcome.
          </p>
          <div className="mt-10 grid max-w-3xl gap-x-12 gap-y-5 text-[0.95rem] text-mist sm:grid-cols-3">
            <LocalTime className="leading-snug" />
            <p className="leading-snug">
              <span className="text-vellum">{priceLine}</span>
              <br />
              {lengths.length === 1 ? `${lengths[0]}, booked on StartPlaying` : 'Booked on StartPlaying'}
            </p>
            <p className="leading-snug">
              <span className="text-vellum">
                {GM.rating.toFixed(1)} stars, {GM.reviews} reviews
              </span>
              <br />
              <a href={GM.profileUrl} target="_blank" rel="noopener noreferrer" className="link-quiet">
                Read them on StartPlaying
              </a>
            </p>
          </div>
        </div>
      </section>

      <section id="campaigns" className="scroll-mt-16 bg-umber">
        <div className="mx-auto max-w-[1180px] px-6 pb-20 md:px-10">
          <CampaignCarousel label="Campaigns" items={listings.map((c) => ({ key: c.slug, node: <CampaignCard c={c} detailed /> }))} />
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-6 py-20 md:px-10 md:py-24">
        <h2 className="font-cinzel text-[2rem] font-bold text-vellum">How to join</h2>
        <ol className="mt-10 grid gap-10 md:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.title}>
              <p className="font-cinzel text-[2rem] font-bold leading-none text-leaf/70">{i + 1}</p>
              <h3 className="mt-3 font-cinzel text-[1.15rem] font-bold text-vellum">{s.title}</h3>
              <p className="mt-2 leading-relaxed text-prose">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-t border-plum-line">
        <div className="mx-auto grid max-w-[1180px] gap-12 px-6 py-20 md:px-10 md:py-24 lg:grid-cols-[1fr_2fr]">
          <h2 className="font-cinzel text-[2rem] font-bold text-vellum">Questions</h2>
          <div className="divide-y divide-plum-line border-y border-plum-line">
            {faqs.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-[1.08rem] text-vellum marker:hidden">
                  {f.q}
                  <span aria-hidden="true" className="text-leaf transition-transform duration-300 group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 max-w-measure leading-relaxed text-prose">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section id="notify" className="scroll-mt-16 bg-umber">
        <div className="mx-auto grid max-w-[1180px] items-center gap-8 px-6 py-16 md:grid-cols-2 md:px-10">
          <div>
            <h2 className="font-cinzel text-[1.6rem] font-bold text-vellum">Tables full, or the time doesn’t work?</h2>
            <p className="mt-2 leading-relaxed text-prose">Leave your email and you’ll hear first when a new table opens.</p>
          </div>
          <NotifyForm />
        </div>
      </section>

      <Footer />
    </main>
  )
}
