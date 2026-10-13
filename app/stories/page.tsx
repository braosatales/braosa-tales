import type { Metadata } from 'next'
import Image from 'next/image'
import Nav from '@/components/NavServer'
import Footer from '@/components/Footer'
import Newsletter from '@/components/Newsletter'
import PageHero, { SectionTitle } from '@/components/PageHero'

export const metadata: Metadata = {
  title: 'Stories',
  description: 'The world of Braosa: the first novel, an open lore wiki for players, and books direct from the author.',
  alternates: { canonical: 'https://braosatales.com/stories' },
}

const wiki = [
  { title: 'Factions', desc: 'Guilds, empires and secret orders' },
  { title: 'Locations', desc: 'Cities, ruins and unmarked places' },
  { title: 'Histories', desc: 'Wars, eras and founding myths' },
  { title: 'The Pantheon', desc: 'Gods that breathe, bleed and lie' },
]

const shop = [
  { title: 'Digital books', desc: 'DRM-free ePub and PDF editions' },
  { title: 'Physical editions', desc: 'Print-on-demand and limited runs' },
  { title: 'Lore supplements', desc: 'Player-facing campaign documents' },
]

export default function StoriesPage() {
  return (
    <main className="bg-night">
      <Nav />
      <PageHero
        title="The world of Braosa"
        intro="Worlds built by hand, stories told by one. Braosa was lived in at real tables for years before a word of it was written down. Now it’s being written."
      />

      {/* Map + first book */}
      <section className="mx-auto max-w-[1180px] px-6 pb-20 md:px-10 md:pb-24">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-16">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-plum-line">
            <Image src="/world-map.jpg" alt="Hand-drawn map of the world of Braosa" fill sizes="(min-width: 1024px) 620px, 100vw" className="object-cover opacity-85 sepia-[0.25]" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-night/60 to-transparent" />
          </div>
          <div>
            <p className="text-[0.9rem] text-leaf-soft">In progress</p>
            <SectionTitle className="mt-1">Book I of the Braosa Chronicles</SectionTitle>
            <p className="mt-4 max-w-measure leading-relaxed text-prose">
              The first novel set in the Braosa universe. Born from years at the table, it tells a story this world has
              been carrying for a long time. It will be published in digital and physical editions, direct from the author.
            </p>
            <p className="mt-4 max-w-measure leading-relaxed text-mist">
              The title and cover are still under wraps. Subscribe to The Chronicle below and you’ll be the first to see them.
            </p>
          </div>
        </div>
      </section>

      {/* Wiki */}
      <section className="border-t border-plum-line">
        <div className="mx-auto grid max-w-[1180px] gap-12 px-6 py-20 md:px-10 md:py-24 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <div>
            <SectionTitle>Open lore for your table</SectionTitle>
            <p className="mt-4 max-w-measure leading-relaxed text-prose">
              A free reference to the universe for players and game masters: who rules where, what happened before, and
              which gods are listening.
            </p>
            <p className="mt-4 max-w-measure leading-relaxed text-mist">
              Some of it stays locked until the campaign you’re playing reaches it, so nothing gets spoiled. The wiki is being
              built now.
            </p>
          </div>
          <ul className="grid gap-x-10 border-t border-plum-line sm:grid-cols-2">
            {wiki.map((w) => (
              <li key={w.title} className="border-b border-plum-line py-5">
                <p className="font-cinzel text-[1.05rem] font-bold text-vellum">{w.title}</p>
                <p className="mt-1 text-[0.95rem] text-mist">{w.desc}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Shop */}
      <section className="bg-umber">
        <div className="mx-auto max-w-[1180px] px-6 py-20 md:px-10 md:py-24">
          <div className="max-w-2xl">
            <SectionTitle>Direct from the author</SectionTitle>
            <p className="mt-4 leading-relaxed text-prose">
              Books, maps and lore documents, sold here with no platform in between. Everything sold supports the world
              being built.
            </p>
          </div>
          <ul className="mt-10 grid gap-8 border-t border-umber-line pt-8 md:grid-cols-3">
            {shop.map((s) => (
              <li key={s.title}>
                <p className="font-cinzel text-[1.1rem] font-bold text-vellum">{s.title}</p>
                <p className="mt-1 text-prose">{s.desc}</p>
                <p className="mt-2 text-[0.85rem] text-ember">Coming soon</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Newsletter />
      <Footer />
    </main>
  )
}
