import Link from 'next/link'

const cards = [
  { icon: '🖋️', title: 'Original worlds', desc: 'Built at the table, years in the making' },
  { icon: '📖', title: 'Written fiction', desc: 'Short stories, lore books, campaign journals' },
  { icon: '🪙', title: 'Buy the books', desc: 'Digital & physical, direct from the author' },
  { icon: '🌍', title: 'Free lore', desc: 'Open wiki for any player at your table' },
]

export default function StoriesSection() {
  return (
    <section className="px-8 py-16 flex flex-col md:flex-row gap-12 items-start">
      <div className="flex-1">
        <p className="section-label text-brand-amber-400">The Stories</p>
        <h2 className="font-cinzel font-bold text-3xl text-gray-900 mt-1 mb-4 leading-snug">
          Worlds built by hand.<br />Stories told by one.
        </h2>
        <p className="text-sm text-gray-500 leading-loose mb-3">
          These aren&apos;t generated worlds — they&apos;re ones built at actual tables over years.
          The lore here predates every tool on this site. The tools came later, to manage what already existed.
        </p>
        <p className="text-sm text-gray-500 leading-loose mb-6">
          Read the fiction. Buy the books. Explore the lore — some of it free, some locked behind
          the campaign you haven&apos;t played yet.
        </p>
        <Link href="/stories" className="text-sm font-medium text-brand-amber-400 hover:underline">
          Browse the library →
        </Link>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-3">
        {cards.map((c) => (
          <div
            key={c.title}
            className="bg-brand-parchment border border-brand-amber-50 rounded-xl p-4"
          >
            <span className="text-lg" aria-hidden="true">{c.icon}</span>
            <p className="font-medium text-xs text-gray-900 mt-2 mb-1">{c.title}</p>
            <p className="text-xs text-gray-500 leading-snug">{c.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
