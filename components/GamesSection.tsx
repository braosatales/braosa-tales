import Link from 'next/link'

export default function GamesSection() {
  return (
    <section className="mx-8 mb-14 bg-brand-purple-900 rounded-2xl px-8 py-12">
      <p className="section-label text-brand-purple-200 mb-1">The Games</p>
      <h2 className="font-cinzel font-bold text-3xl text-white mb-3 leading-snug">
        Sit at the table.
      </h2>
      <p className="text-brand-purple-200 text-sm leading-loose mb-2 max-w-lg">
        Live campaigns run inside the Braosa Tales universe — no third-party platforms, no rented tables.
        Everything here is ours: the world, the tools, and the game itself.
      </p>
      <p className="text-brand-purple-400 text-sm italic mb-8 max-w-lg">
        Full virtual tabletop launching soon. Join the list to play first.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/games#waitlist"
          className="bg-white text-brand-purple-900 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-brand-purple-50 transition-colors"
        >
          Join the waitlist
        </Link>
        <Link
          href="/games#sessions"
          className="border border-white/30 text-white px-5 py-2.5 rounded-lg text-sm hover:bg-white/10 transition-colors"
        >
          Watch a session
        </Link>
      </div>
    </section>
  )
}
