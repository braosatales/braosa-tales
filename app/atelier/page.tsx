import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'The Atelier',
  description: 'Your worldbuilding workshop. AI-powered generators and campaign tools for game masters and storytellers.',
}

type Tool = {
  name: string
  desc: string
  ready?: boolean
  href?: string
}

const workshopTools: Tool[] = [
  { name: 'The Athenaeum', desc: 'World wiki with GM and player visibility controls.' },
  { name: 'The Atlas', desc: 'Interactive maps linked to locations and in-world lore.' },
  { name: 'The Chronicle', desc: 'Session notes with GM-private and player-visible layers.' },
  { name: 'The Easel', desc: 'Visual mood boards and scene reference galleries.' },
  { name: 'The Journal', desc: 'Private GM notes, never visible to players.' },
  { name: 'The Blade', desc: 'Encounter builder with initiative and combat tracking.' },
  { name: 'The Hourglass', desc: 'Campaign timeline for in-world events and history.' },
  { name: 'The Armature', desc: 'D&D 5e character sheets, live and player-editable.' },
  { name: 'The Tome', desc: 'Central dashboard for managing all your campaigns.' },
]

const generatorTools: Tool[] = [
  { name: 'The Signet', desc: 'Name generator for characters, places, and factions.' },
  { name: 'The Mallet', desc: 'Forge unique weapons, armour, and magical items.' },
  { name: 'The Chisel', desc: 'Build rich NPCs with personality, secrets, and hooks.' },
  { name: 'The Blueprint', desc: 'Generate detailed locations — towns, dungeons, ruins.' },
  { name: 'The Compass', desc: 'Craft quest hooks, objectives, and complications.' },
  { name: 'The Bestiary', desc: 'Create original creatures with lore and stat blocks.' },
  { name: 'The Crucible', desc: 'Build factions with goals, tensions, and hierarchies.' },
  { name: 'The Loupe', desc: 'Generate tavern rumours, gossip, and local intrigue.' },
  { name: 'The Letter', desc: 'Write in-world handouts — letters, notices, inscriptions.' },
  { name: 'The Loom', desc: 'Weave story threads into cohesive narrative arcs.' },
  { name: 'The Cipher', desc: 'Create invented languages, scripts, and ciphers.' },
  { name: 'The Charter', desc: 'Define the laws, customs, and taboos of your world.' },
  { name: 'The Dice Cup', desc: 'Random tables for encounters, weather, events, and more.' },
]

function ToolCard({ tool }: { tool: Tool }) {
  return (
    <div className="dark-card flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <p className="font-cinzel text-xs tracking-widest uppercase text-brand-parchment leading-relaxed">
          {tool.name}
        </p>
        {tool.ready && tool.href ? (
          <Link
            href={tool.href}
            className="shrink-0 inline-flex items-center border border-brand-gold-400 text-brand-gold-300 px-2 py-0.5 rounded-sm text-[10px] tracking-widest uppercase font-cinzel hover:bg-brand-gold-400/10 transition-colors"
          >
            Try it
          </Link>
        ) : (
          <span className="shrink-0 inline-flex items-center border border-brand-border text-brand-muted/50 px-2 py-0.5 rounded-sm text-[10px] tracking-widest uppercase font-cinzel">
            Coming soon
          </span>
        )}
      </div>
      <p className="font-fell italic text-brand-muted text-sm leading-relaxed">{tool.desc}</p>
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
      <Nav />

      {/* Hero */}
      <section className="px-8 pt-22 pb-10 border-b border-brand-border">
        <div className="max-w-4xl mx-auto text-center">
          <p className="section-label">The Atelier</p>
          <h1 className="font-cinzel font-black text-brand-parchment text-5xl md:text-6xl mb-4 leading-tight">
            The Creative Hub
          </h1>
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-20 bg-brand-gold-400/30" />
            <span className="text-brand-gold-400/50 text-xs">✦</span>
            <div className="h-px w-20 bg-brand-gold-400/30" />
          </div>
          <p className="font-fell italic text-brand-muted text-lg max-w-lg mx-auto leading-relaxed">
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
            <p className="font-fell italic text-brand-muted max-w-md leading-relaxed">
              Campaign management tools. GM-first, built for long-running worlds.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
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
            <p className="font-fell italic text-brand-muted max-w-md leading-relaxed">
              AI-powered creative tools to fill your world with names, creatures, factions, and stories.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
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
