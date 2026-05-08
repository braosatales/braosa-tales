import Link from 'next/link'

const features = [
  { title: 'World wiki', desc: 'Full lore library with per-article GM/player visibility toggles.', symbol: '✦' },
  { title: 'Character sheets', desc: 'D&D 5e 2024 mechanical sheets, live and editable by players.', symbol: '⚔' },
  { title: 'Encounter builder', desc: 'Design and run combat encounters with initiative tracking.', symbol: '🜲' },
  { title: 'Maps & timelines', desc: 'Visual world maps linked to in-world events and history.', symbol: '◈' },
  { title: 'Session notes', desc: 'GM private notes + player-visible session recaps per session.', symbol: '📜' },
  { title: 'Campaign dashboard', desc: 'Manage multiple campaigns and universes from one hub.', symbol: '⬡' },
]

export default function ToolsSection() {
  return (
    <section className="px-8 py-20 border-t border-brand-border">
      <div className="max-w-6xl mx-auto">
        <div className="mb-14 text-center">
          <p className="section-label">The Tools</p>
          <h2 className="font-cinzel font-black text-brand-parchment text-4xl mb-4 leading-tight">
            Your campaign. Fully yours.
          </h2>
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px w-20 bg-brand-gold-400/30" />
            <span className="text-brand-gold-400/50 text-xs">✦</span>
            <div className="h-px w-20 bg-brand-gold-400/30" />
          </div>
          <p className="font-fell italic text-brand-muted max-w-md mx-auto leading-relaxed">
            GM-first. Share exactly what your players know — and keep everything else in the dark.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <div key={f.title} className="dark-card flex gap-4 items-start">
              <span className="text-brand-gold-400 text-lg mt-0.5 flex-shrink-0">{f.symbol}</span>
              <div>
                <p className="font-cinzel text-xs tracking-widest uppercase text-brand-parchment mb-2">{f.title}</p>
                <p className="font-fell text-brand-muted text-sm leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/tools" className="btn-primary">
            Try the tools free
          </Link>
        </div>
      </div>
    </section>
  )
}
