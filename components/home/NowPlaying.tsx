import CampaignCard from '@/components/sessions/CampaignCard'
import CampaignCarousel from '@/components/sessions/CampaignCarousel'
import { GM } from '@/lib/sessions'
import { getListings, seatState } from '@/lib/listings'

const WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight']

export default async function NowPlaying() {
  const listings = await getListings()
  const running = listings.filter((l) => seatState(l) !== 'finished').length
  return (
    <section id="campaigns" className="scroll-mt-16 bg-umber">
      <div className="mx-auto max-w-[1180px] px-6 py-20 md:px-10 md:py-28">
        <div className="max-w-2xl">
          <h2 className="font-cinzel text-[2.1rem] font-bold leading-tight text-vellum md:text-[2.6rem]">Now playing</h2>
          <p className="mt-4 text-[1.1rem] leading-relaxed text-prose">
            {running === 1 ? 'One campaign' : `${WORDS[running] ?? running} campaigns`}, each built to run from first level to the end. Pick the
            story that pulls you in, book a seat on StartPlaying, and you’re in.
          </p>
        </div>

        <div className="mt-12">
          <CampaignCarousel label="Campaigns" items={listings.map((c) => ({ key: c.slug, node: <CampaignCard c={c} /> }))} />
        </div>

        <dl className="mt-16 grid gap-10 border-t border-umber-line pt-10 text-[0.98rem] md:grid-cols-3">
          <div>
            <dt className="font-cinzel text-[1.05rem] font-bold text-vellum">New to D&amp;D?</dt>
            <dd className="mt-2 leading-relaxed text-prose">
              Beginners are welcome, and so are veterans. Never played before? You’ll learn as you go.
            </dd>
          </div>
          <div>
            <dt className="font-cinzel text-[1.05rem] font-bold text-vellum">Where we play</dt>
            <dd className="mt-2 leading-relaxed text-prose">
              Voice on Discord, maps on Foundry VTT, character sheets on D&amp;D Beyond. All you need is a
              browser and a microphone.
            </dd>
          </div>
          <div>
            <dt className="font-cinzel text-[1.05rem] font-bold text-vellum">Your campaign, online</dt>
            <dd className="mt-2 leading-relaxed text-prose">
              Campaigns come with their own website for lore, quests, maps and session recaps, built with the
              Atelier.
            </dd>
          </div>
        </dl>
        <p className="mt-8 text-[0.85rem] text-mist">
          Played in English. {GM.name.split(' ')[0]} also speaks Português and Español.
        </p>
      </div>
    </section>
  )
}
