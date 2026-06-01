import Link from 'next/link'
import Image from 'next/image'

export default function StoriesSection() {
  return (
    <section className="px-8 py-10 md:py-20 border-t border-brand-border">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-16 items-start">

        <div className="flex-1">
          <p className="section-label">The Stories</p>
          <h2 className="font-cinzel font-black text-brand-parchment text-4xl mb-4 leading-tight">
            Worlds built by hand.<br />Stories told by one.
          </h2>
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px w-12 bg-brand-gold-400/30" />
            <span className="text-brand-gold-400/50 text-xs">✦</span>
          </div>
          <p className="font-fell text-brand-muted leading-loose mb-4">
            These aren&apos;t generated worlds — they&apos;re ones built at actual tables over years.
            The lore here predates every tool on this site. The tools came later, to manage what already existed.
          </p>
          <p className="font-fell text-brand-muted leading-loose mb-8">
            Read the fiction. Buy the books. Explore the lore — some of it free, some locked
            behind the campaign you haven&apos;t played yet.
          </p>
          <Link href="/stories" className="font-cinzel text-xs tracking-widest uppercase text-brand-gold-300 hover:text-brand-gold-300/70 transition-colors">
            Browse the library →
          </Link>
        </div>

        <div className="flex-1 grid grid-cols-2 gap-4">
          {[
            { icon: 'original-worlds-sq.svg', title: 'Original worlds', desc: 'Built at the table, years in the making' },
            { icon: 'written-fiction.svg', title: 'Written fiction', desc: 'Short stories, lore books, campaign journals' },
            { icon: 'buy-the-books-sq.svg', title: 'Buy the books', desc: 'Digital & physical, direct from the author' },
            { icon: 'free-lore.svg', title: 'Free lore', desc: 'Open wiki for players at your table' },
          ].map((c) => (
            <div key={c.title} className="dark-card">
              <Image src={`/icons/${c.icon}`} width={48} height={48} alt={c.title} unoptimized />
              <p className="font-cinzel text-xs tracking-widest uppercase text-brand-parchment mt-3 mb-1">{c.title}</p>
              <p className="font-fell text-brand-muted text-xs leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
