import Link from 'next/link'

const features = [
  {
    title: 'World wiki',
    desc: 'Full lore library with per-article GM/player visibility toggles.',
    icon: '📚',
  },
  {
    title: 'Character sheets',
    desc: 'D&D 5e 2024 mechanical sheets, live and editable by players.',
    icon: '🧙',
  },
  {
    title: 'Encounter builder',
    desc: 'Design and run combat encounters with initiative tracking.',
    icon: '⚔️',
  },
  {
    title: 'Maps & timelines',
    desc: 'Visual world maps linked to in-world events and history.',
    icon: '🗺️',
  },
  {
    title: 'Session notes',
    desc: 'GM private notes + player-visible session recaps, per session.',
    icon: '📜',
  },
  {
    title: 'Campaign dashboard',
    desc: 'Manage multiple campaigns and universes from one hub.',
    icon: '🏰',
  },
]

export default function ToolsSection() {
  return (
    <section className="px-8 py-14 bg-brand-parchment">
      <div className="max-w-xl mb-10">
        <p className="section-label text-brand-purple-600">The Tools</p>
        <h2 className="font-cinzel font-bold text-3xl text-brand-purple-800 mt-1 mb-3 leading-snug">
          Your campaign. Fully yours.
        </h2>
        <p className="text-gray-600 leading-relaxed">
          GM-first. Share exactly what your players know — and keep everything else in the dark.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {features.map((f) => (
          <div
            key={f.title}
            className="bg-white border border-gray-100 rounded-xl p-5 flex gap-4 items-start hover:shadow-sm transition-shadow"
          >
            <span className="text-xl mt-0.5" aria-hidden="true">{f.icon}</span>
            <div>
              <p className="font-medium text-sm text-gray-900 mb-1">{f.title}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link href="/tools" className="btn-primary inline-block">
          Try the tools free
        </Link>
      </div>
    </section>
  )
}
