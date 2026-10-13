import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import Footer from '@/components/Footer'
import PageHero, { SectionTitle } from '@/components/PageHero'

export const metadata: Metadata = {
  title: 'The Atelier',
  description:
    'Tools for game masters: The Signet name generator is open now in alpha, with a world wiki, maps, session notes, character sheets and more on the way.',
  alternates: { canonical: 'https://braosatales.com/atelier' },
}

type Tool = { name: string; description: string; icon: string; href?: string }

const workshop: Tool[] = [
  { name: 'The Athenaeum', description: 'World wiki with GM and player visibility controls.', icon: '01 The Athenaeum.svg' },
  { name: 'The Atlas', description: 'Interactive maps linked to locations and in-world lore.', icon: '02 The Atlas.svg' },
  { name: 'The Chronicle', description: 'Session notes with private GM and player-visible layers.', icon: '03 The Chronicle.svg' },
  { name: 'The Easel', description: 'Mood boards and scene reference galleries.', icon: '04 The Easel.svg' },
  { name: 'The Journal', description: 'Private GM notes, never visible to players.', icon: '05 The Journal.svg' },
  { name: 'The Blade', description: 'Encounter builder with initiative and combat tracking.', icon: '06 The Blade.svg' },
  { name: 'The Hourglass', description: 'Campaign timeline for in-world events and history.', icon: '07 The Hourglass.svg' },
  { name: 'The Armature', description: 'D&D 5e character sheets, live and player-editable.', icon: '08 The Armature.svg' },
  { name: 'The Tome', description: 'One dashboard for every campaign you run.', icon: '09 The Tome.svg' },
]

const generators: Tool[] = [
  { name: 'The Mallet', description: 'Weapons, armour and magic items.', icon: '11 The Mallet.svg' },
  { name: 'The Chisel', description: 'NPCs with personality, secrets and hooks.', icon: '12 The Chisel.svg' },
  { name: 'The Blueprint', description: 'Towns, dungeons and ruins in detail.', icon: '13 The Blueprint.svg' },
  { name: 'The Compass', description: 'Quest hooks, objectives and complications.', icon: '14 The Compass.svg' },
  { name: 'The Bestiary', description: 'Original creatures with lore and stat blocks.', icon: '15 The Bestiary.svg' },
  { name: 'The Crucible', description: 'Factions with goals, tensions and hierarchies.', icon: '16 The Crucible.svg' },
  { name: 'The Loupe', description: 'Tavern rumours, gossip and local intrigue.', icon: '17 The Loupe.svg' },
  { name: 'The Letter', description: 'In-world handouts: letters, notices, inscriptions.', icon: '18 The Letter.svg' },
  { name: 'The Loom', description: 'Story threads woven into narrative arcs.', icon: '19 The Loom.svg' },
  { name: 'The Cipher', description: 'Invented languages, scripts and ciphers.', icon: '20 The Cipher.svg' },
  { name: 'The Charter', description: 'Laws, customs and taboos of your world.', icon: '21 The Charter.svg' },
  { name: 'The Dice Cup', description: 'Random tables for encounters, weather and events.', icon: '22 The Dice Cup.svg' },
]

function ToolList({ tools }: { tools: Tool[] }) {
  return (
    <ul className="grid gap-x-12 border-t border-plum-line md:grid-cols-2">
      {tools.map((t) => (
        <li key={t.name} className="flex items-center gap-4 border-b border-plum-line py-4">
          <Image src={`/icons/atelier/48/${t.icon}`} width={36} height={36} alt="" unoptimized className="opacity-80" />
          <div className="min-w-0 flex-1">
            <p className="font-cinzel text-[0.98rem] font-bold text-vellum">{t.name}</p>
            <p className="text-[0.92rem] leading-snug text-mist">{t.description}</p>
          </div>
          <span className="shrink-0 text-[0.78rem] text-mist/80">Coming soon</span>
        </li>
      ))}
    </ul>
  )
}

export default function AtelierPage() {
  return (
    <main className="bg-night">
      <PageHero
        tone="plum"
        title="The Atelier"
        intro="The workshop behind the table. These are the tools that run our campaigns, and one by one they’re opening to every game master."
      >
        <div className="grid max-w-3xl gap-x-12 gap-y-4 text-[0.95rem] text-mist sm:grid-cols-3">
          <p className="leading-snug"><span className="text-vellum">1 tool open now</span><br />The Signet, in alpha</p>
          <p className="leading-snug"><span className="text-vellum">21 in the workshop</span><br />Campaign tools and generators</p>
          <p className="leading-snug"><span className="text-vellum">Free to start</span><br /><Link href="/pricing" className="link-quiet">See plans</Link></p>
        </div>
      </PageHero>

      {/* Open now */}
      <section className="bg-plum">
        <div className="mx-auto max-w-[1180px] px-6 pb-20 md:px-10">
          <div className="grid gap-10 rounded-2xl border border-amethyst/30 bg-night/60 p-7 md:grid-cols-[auto_1fr_auto] md:items-center md:gap-10 md:p-10">
            <Image src="/icons/atelier/512/10 The Signet.svg" width={120} height={120} alt="" unoptimized className="h-24 w-24 md:h-28 md:w-28" />
            <div>
              <p className="text-[0.85rem] text-amethyst">Open now, in alpha</p>
              <h2 className="mt-1 font-cinzel text-[2rem] font-bold text-vellum">The Signet</h2>
              <p className="mt-3 max-w-measure leading-relaxed text-prose">
                Names for characters, places, factions and artifacts, drawn from more than a hundred real and invented
                languages. Every name comes with its pronunciation, its roots and what it means. Save the ones you love
                and keep presets for your world.
              </p>
            </div>
            <div className="flex flex-col items-start gap-3 md:items-end">
              <Link href="/atelier/signet" className="btn-amethyst">Open The Signet</Link>
              <p className="text-[0.85rem] text-mist">100 free credits every month</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-6 py-20 md:px-10 md:py-24">
        <div className="max-w-2xl">
          <SectionTitle>Campaign tools</SectionTitle>
          <p className="mt-3 leading-relaxed text-prose">
            For long-running worlds. Built GM-first: share exactly what your players know and keep the rest in the dark.
          </p>
        </div>
        <div className="mt-10"><ToolList tools={workshop} /></div>
      </section>

      <section className="border-t border-plum-line">
        <div className="mx-auto max-w-[1180px] px-6 py-20 md:px-10 md:py-24">
          <div className="max-w-2xl">
            <SectionTitle>Generators</SectionTitle>
            <p className="mt-3 leading-relaxed text-prose">
              AI-assisted tools to fill your world with items, people, places and stories, in the same spirit as The Signet.
            </p>
          </div>
          <div className="mt-10"><ToolList tools={generators} /></div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
