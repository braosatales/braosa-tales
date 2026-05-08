import Link from 'next/link'

export default function GamesSection() {
  return (
    <section className="px-8 py-20 border-t border-brand-border">
      <div className="max-w-6xl mx-auto">
        <div className="relative overflow-hidden rounded-sm border border-brand-purple-800/50 bg-gradient-to-br from-brand-purple-900/40 to-brand-bg p-12 text-center">

          {/* Corner ornaments */}
          <span className="absolute top-4 left-4 text-brand-gold-400/20 text-2xl">✦</span>
          <span className="absolute top-4 right-4 text-brand-gold-400/20 text-2xl">✦</span>
          <span className="absolute bottom-4 left-4 text-brand-gold-400/20 text-2xl">✦</span>
          <span className="absolute bottom-4 right-4 text-brand-gold-400/20 text-2xl">✦</span>

          <p className="section-label text-brand-purple-200 mb-2">The Games</p>
          <h2 className="font-cinzel font-black text-brand-parchment text-4xl mb-4 leading-tight">
            Sit at the table.
          </h2>
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-16 bg-brand-purple-600/40" />
            <span className="text-brand-purple-400/60 text-xs">✦</span>
            <div className="h-px w-16 bg-brand-purple-600/40" />
          </div>
          <p className="font-fell italic text-brand-purple-200 max-w-lg mx-auto leading-loose mb-3">
            Live campaigns inside the Braosa Tales universe — no third-party platforms, no rented tables.
            The world, the tools, and the game itself, all ours.
          </p>
          <p className="font-fell italic text-brand-muted mb-10">
            Full virtual tabletop launching soon. Join the list to play first.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/games#waitlist" className="btn-primary">
              Join the waitlist
            </Link>
            <Link href="/games#sessions" className="btn-outline">
              Watch a session
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
