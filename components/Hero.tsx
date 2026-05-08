import Link from 'next/link'

export default function Hero() {
  return (
    <section className="text-center py-24 px-8 bg-brand-parchment">
      <p className="section-label text-brand-purple-600 mb-5">
        TTRPG Tools &nbsp;·&nbsp; Original Stories &nbsp;·&nbsp; Live Games
      </p>
      <h1 className="font-cinzel font-bold text-brand-purple-800 text-6xl md:text-7xl leading-tight mb-5">
        Braosa Tales
      </h1>
      <p className="font-body italic text-xl text-amber-900 mb-10 max-w-md mx-auto leading-relaxed">
        Forge the world. Tell the story. Run the game.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Link href="/tools" className="btn-primary">
          Explore the tools
        </Link>
        <Link href="/stories" className="btn-outline">
          Read the stories
        </Link>
      </div>
    </section>
  )
}
