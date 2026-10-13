import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import Nav from '@/components/NavServer'
import Footer from '@/components/Footer'
import PageHero, { SectionTitle } from '@/components/PageHero'
import { GM } from '@/lib/sessions'

export const metadata: Metadata = {
  title: 'About',
  description: 'John Rodrigues: game master, worldbuilder and the person behind Braosa Tales.',
  alternates: { canonical: 'https://braosatales.com/about' },
}

export default function AboutPage() {
  return (
    <main className="bg-night">
      <Nav />
      <PageHero title="The Lorekeeper" intro="Built worlds at the table. Now building the tools to run them." />

      {/* Portrait + intro */}
      <section className="mx-auto max-w-[1180px] px-6 pb-20 md:px-10 md:pb-24">
        <div className="grid gap-10 md:grid-cols-[280px_1fr] md:gap-16">
          <div>
            <div className="aspect-square overflow-hidden rounded-2xl border border-leaf/30">
              <Image
                src="https://spg-images.s3.us-west-1.amazonaws.com/f69a921e-053a-4e68-90b1-eebd75156274"
                alt="John Rodrigues, game master and worldbuilder"
                width={560}
                height={560}
                className="h-full w-full object-cover"
              />
            </div>
            <p className="mt-4 text-[0.92rem] leading-snug text-mist">
              <span className="text-vellum">{GM.rating.toFixed(1)} stars from {GM.reviews} reviews</span>
              <br />
              {GM.gamesRun} games run on{' '}
              <a href={GM.profileUrl} target="_blank" rel="noopener noreferrer" className="link-quiet">StartPlaying</a>
            </p>
          </div>
          <div className="max-w-measure">
            <p className="text-[1.15rem] leading-relaxed text-prose">
              John Rodrigues started his D&amp;D career by accident, volunteering to run “just a one-shot” for friends who
              thought GMing was too hard. That was five years ago. The one-shot never ended.
            </p>
            <p className="mt-5 leading-relaxed text-prose">
              What started at a table in Portugal became a passion: building worlds deep enough to get lost in, running
              games where the story belongs to the players, and eventually, when no tool did exactly what he needed,
              building the tools himself.
            </p>
          </div>
        </div>
      </section>

      {/* How it all began */}
      <section className="bg-umber">
        <div className="mx-auto max-w-[1180px] px-6 py-20 md:px-10 md:py-24">
          <div className="grid gap-10 md:grid-cols-[280px_1fr] md:gap-16">
            <SectionTitle>How it all began</SectionTitle>
            <div className="max-w-measure">
              <p className="leading-relaxed text-prose">
                The first campaigns were borrowed. Pre-made adventures, familiar worlds, learning the craft of the GM one
                session at a time. But the real spark came later, with the slow realisation that the most interesting
                stories weren’t in any module. They were the ones happening at the table, shaped by the players sitting
                around it.
              </p>
              <p className="mt-5 leading-relaxed text-prose">
                That’s when Braosa was born. Not launched: born. Quietly, across years of sessions and scrapped notebooks,
                a world began taking shape that belonged entirely to the people who played in it. It wasn’t until last year
                that those stories finally had a home to live in.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What is Braosa Tales */}
      <section className="mx-auto max-w-[1180px] px-6 py-20 md:px-10 md:py-24">
        <div className="grid gap-10 md:grid-cols-[280px_1fr] md:gap-16">
          <SectionTitle>What is Braosa Tales?</SectionTitle>
          <div className="max-w-measure">
            <p className="leading-relaxed text-prose">
              Braosa Tales is the platform John is building for the kind of GM he is, and the kind of players who deserve
              that experience.
            </p>
            <ul className="mt-6 space-y-4 border-l border-plum-line pl-5">
              <li className="leading-relaxed text-prose">
                <Link href="/games" className="font-cinzel font-bold text-vellum hover:text-leaf-soft">Sessions</Link>: the
                campaigns he runs every week, open to new players.
              </li>
              <li className="leading-relaxed text-prose">
                <Link href="/atelier" className="font-cinzel font-bold text-vellum hover:text-leaf-soft">The Atelier</Link>:
                the tools he needed and couldn’t find.
              </li>
              <li className="leading-relaxed text-prose">
                <Link href="/stories" className="font-cinzel font-bold text-vellum hover:text-leaf-soft">Stories</Link>: the
                world his players lived, written down at last. Eventually the novels and the worldsetting books.
              </li>
            </ul>
            <p className="mt-6 leading-relaxed text-leaf-soft">It’s all the same world. You’re just arriving early.</p>
          </div>
        </div>
      </section>

      {/* A bit more */}
      <section className="border-t border-plum-line">
        <div className="mx-auto max-w-[1180px] px-6 py-20 md:px-10 md:py-24">
          <div className="grid gap-10 md:grid-cols-[280px_1fr] md:gap-16">
            <SectionTitle>A bit more</SectionTitle>
            <div className="max-w-measure">
              <p className="leading-relaxed text-prose">
                When not at the table, John manages construction teams in Portugal, coordinating the kind of complex,
                moving-parts work that turns out to be surprisingly good training for running campaigns. He’s married,
                father of three, a committed Tolkien obsessive (The Silmarillion is the correct answer), and has been known
                to use genuinely terrible accents for NPCs.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/games" className="btn-gold">Play at his table</Link>
                <Link href="/atelier" className="btn-ghost">Explore the Atelier</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
