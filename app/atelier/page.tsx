import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'The Atelier',
  description: 'Your worldbuilding workshop. AI-powered generators and campaign tools for game masters and storytellers.',
}

type Tool = {
  name: string
  description: string
  icon: string
  ready?: boolean
  href?: string
}

const workshopTools: Tool[] = [
  { name: 'The Athenaeum', description: 'World wiki with GM and player visibility controls.', icon: '01 The Athenaeum.svg' },
  { name: 'The Atlas', description: 'Interactive maps linked to locations and in-world lore.', icon: '02 The Atlas.svg' },
  { name: 'The Chronicle', description: 'Session notes with GM-private and player-visible layers.', icon: '03 The Chronicle.svg' },
  { name: 'The Easel', description: 'Visual mood boards and scene reference galleries.', icon: '04 The Easel.svg' },
  { name: 'The Journal', description: 'Private GM notes, never visible to players.', icon: '05 The Journal.svg' },
  { name: 'The Blade', description: 'Encounter builder with initiative and combat tracking.', icon: '06 The Blade.svg' },
  { name: 'The Hourglass', description: 'Campaign timeline for in-world events and history.', icon: '07 The Hourglass.svg' },
  { name: 'The Armature', description: 'D&D 5e character sheets, live and player-editable.', icon: '08 The Armature.svg' },
  { name: 'The Tome', description: 'Central dashboard for managing all your campaigns.', icon: '09 The Tome.svg' },
]

const generatorTools: Tool[] = [
  { name: 'The Signet', description: 'Name generator for characters, places, and factions.', icon: '10 The Signet.svg', ready: true, href: '/atelier/signet' },
  { name: 'The Mallet', description: 'Forge unique weapons, armour, and magical items.', icon: '11 The Mallet.svg' },
  { name: 'The Chisel', description: 'Build rich NPCs with personality, secrets, and hooks.', icon: '12 The Chisel.svg' },
  { name: 'The Blueprint', description: 'Generate detailed locations — towns, dungeons, ruins.', icon: '13 The Blueprint.svg' },
  { name: 'The Compass', description: 'Craft quest hooks, objectives, and complications.', icon: '14 The Compass.svg' },
  { name: 'The Bestiary', description: 'Create original creatures with lore and stat blocks.', icon: '15 The Bestiary.svg' },
  { name: 'The Crucible', description: 'Build factions with goals, tensions, and hierarchies.', icon: '16 The Crucible.svg' },
  { name: 'The Loupe', description: 'Generate tavern rumours, gossip, and local intrigue.', icon: '17 The Loupe.svg' },
  { name: 'The Letter', description: 'Write in-world handouts — letters, notices, inscriptions.', icon: '18 The Letter.svg' },
  { name: 'The Loom', description: 'Weave story threads into cohesive narrative arcs.', icon: '19 The Loom.svg' },
  { name: 'The Cipher', description: 'Create invented languages, scripts, and ciphers.', icon: '20 The Cipher.svg' },
  { name: 'The Charter', description: 'Define the laws, customs, and taboos of your world.', icon: '21 The Charter.svg' },
  { name: 'The Dice Cup', description: 'Random tables for encounters, weather, events, and more.', icon: '22 The Dice Cup.svg' },
]

function ToolCard({ tool }: { tool: Tool }) {
  return (
    <div className="relative flex flex-row items-center gap-4 p-4 rounded-lg border border-brand-border bg-brand-card hover:border-brand-purple-600/50 transition-all min-h-[80px] group">

      {!tool.ready && (
        <span className="absolute top-2 right-2 text-[9px] uppercase tracking-widest text-brand-muted font-sans">
          Coming soon
        </span>
      )}

      <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-md bg-brand-bg border border-brand-border">
        <Image src={`/icons/atelier/48/${tool.icon}`} width={48} height={48} alt={tool.name} unoptimized />
      </div>

      <div className="flex flex-col gap-1 min-w-0">
        <span className="font-cinzel text-base font-semibold text-brand-parchment leading-tight">
          {tool.name}
        </span>
        <span className="font-fell text-sm text-[#F0E8FF] leading-snug line-clamp-2">
          {tool.description}
        </span>
      </div>

      {tool.ready && tool.href && (
        <Link href={tool.href} className="absolute inset-0 rounded-lg" aria-label={tool.name} />
      )}
    </div>
  )
}

function SectionDivider() {
  return (
    <div className="flex items-center gap-4 mb-4">
      <div className="h-px w-16 bg-brand-gold-400/30" />
      <span className="text-brand-gold-400/50 text-xs">✦</span>
    </div>
  )
}

export default function AtelierPage() {
  return (
    <main className="relative">
      {/* Hero */}
      <section className="px-8 pt-24 pb-10 border-b border-brand-border">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-cinzel font-black text-brand-parchment text-5xl md:text-6xl mb-4 leading-tight">
            The Atelier
          </h1>
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-20 bg-brand-gold-400/30" />
            <span className="text-brand-gold-400/50 text-xs">✦</span>
            <div className="h-px w-20 bg-brand-gold-400/30" />
          </div>
          <p className="font-fell text-[#D4AE58] text-xl max-w-lg mx-auto leading-relaxed">
            Every tool you need to forge worlds, run campaigns, and bring stories to life — gathered under one roof.
          </p>
        </div>
      </section>

      {/* Wing I — Workshop */}
      <section className="px-8 py-20 border-b border-brand-border">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <p className="section-label">Wing I</p>
            <h2 className="font-cinzel font-black text-brand-parchment text-3xl mb-3 leading-tight">
              The Workshop
            </h2>
            <SectionDivider />
            <p className="font-fell text-brand-muted max-w-md leading-relaxed">
              Campaign management tools. GM-first, built for long-running worlds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workshopTools.map((tool) => (
              <ToolCard key={tool.name} tool={tool} />
            ))}
          </div>
        </div>
      </section>

      {/* Wing II — Generators */}
      <section className="px-8 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <p className="section-label">Wing II</p>
            <h2 className="font-cinzel font-black text-brand-parchment text-3xl mb-3 leading-tight">
              The Generators
            </h2>
            <SectionDivider />
            <p className="font-fell text-brand-muted max-w-md leading-relaxed">
              AI-powered creative tools to fill your world with names, creatures, factions, and stories.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {generatorTools.map((tool) => (
              <ToolCard key={tool.name} tool={tool} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
