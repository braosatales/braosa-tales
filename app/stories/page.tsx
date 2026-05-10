import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function StoriesPage() {
  return (
    <main>
      <Nav />

      {/* Hero */}
      <section className="px-8 pt-40 pb-24 text-center border-b border-brand-border">
        <p className="section-label">The Stories</p>
        <h1 className="font-cinzel font-black text-brand-parchment text-5xl md:text-6xl mb-4 leading-tight">
          The Library
        </h1>
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="h-px w-16 bg-brand-gold-400/30" />
          <span className="text-brand-gold-400/50 text-xs">✦</span>
          <div className="h-px w-16 bg-brand-gold-400/30" />
        </div>
        <p className="font-fell italic text-brand-gold-300 text-xl md:text-2xl max-w-lg mx-auto leading-relaxed opacity-90">
          Worlds built by hand. Stories told by one.
        </p>
      </section>

      {/* Coming Soon — Featured Book */}
      <section className="px-8 py-20 border-b border-brand-border">
        <div className="max-w-6xl mx-auto">
          <p className="section-label mb-6">Featured Release</p>
          <div className="flex flex-col md:flex-row gap-10 items-start">
            {/* Placeholder book cover */}
            <div className="dark-card flex-shrink-0 w-full md:w-56 h-80 flex flex-col items-center justify-center gap-3">
              <span className="text-brand-gold-400/40 text-5xl">📖</span>
              <p className="font-cinzel text-xs tracking-widest uppercase text-brand-muted">Cover Reveal Soon</p>
            </div>
            {/* Book info */}
            <div className="flex-1">
              <span className="inline-block font-cinzel text-xs tracking-widest uppercase text-brand-purple-200 border border-brand-purple-600/40 px-3 py-1 rounded-sm mb-4">
                Coming Soon
              </span>
              <h2 className="font-cinzel font-black text-brand-parchment text-3xl mb-2 leading-snug">
                Title Unrevealed
              </h2>
              <p className="font-fell italic text-brand-gold-300 text-lg mb-4 opacity-80">
                Book I of the Braosa Chronicles
              </p>
              <div className="flex items-center gap-4 mb-6">
                <div className="h-px w-10 bg-brand-gold-400/30" />
                <span className="text-brand-gold-400/40 text-xs">✦</span>
              </div>
              <p className="font-fell text-brand-muted leading-loose mb-6">
                The first novel set in the Braosa Tales universe. Born from years at the table,
                this world has been lived in before it was ever written down. The book will be
                available in digital and physical editions — direct from the author.
              </p>
              <button type="button" className="btn-primary">
                Notify me on release
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Free Lore — World Wiki */}
      <section className="px-8 py-20 border-b border-brand-border">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-16 items-start">
            <div className="flex-1">
              <p className="section-label">The World Wiki</p>
              <h2 className="font-cinzel font-black text-brand-parchment text-3xl mb-4 leading-tight">
                Free lore for your table
              </h2>
              <div className="flex items-center gap-4 mb-6">
                <div className="h-px w-12 bg-brand-gold-400/30" />
                <span className="text-brand-gold-400/50 text-xs">✦</span>
              </div>
              <p className="font-fell text-brand-muted leading-loose mb-4">
                The Braosa Tales wiki is an open reference for the universe — factions, locations,
                histories, and pantheons. If you&apos;re running a campaign set in this world,
                everything your players need to get oriented is here.
              </p>
              <p className="font-fell text-brand-muted leading-loose mb-8">
                Some lore is open. Some is locked — it&apos;ll spoil things that haven&apos;t
                happened at your table yet. That&apos;s by design.
              </p>
              <Link href="#" className="font-cinzel text-xs tracking-widest uppercase text-brand-gold-300 hover:text-brand-gold-300/70 transition-colors">
                Explore the wiki →
              </Link>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-4">
              {[
                { symbol: '🏛', title: 'Factions', desc: 'Guilds, empires, and secret orders' },
                { symbol: '🗺', title: 'Locations', desc: 'Cities, ruins, and unmarked places' },
                { symbol: '⚔', title: 'Histories', desc: 'Wars, eras, and founding myths' },
                { symbol: '🌑', title: 'The Pantheon', desc: 'Gods that breathe, bleed, and lie' },
              ].map((c) => (
                <div key={c.title} className="dark-card">
                  <span className="text-xl">{c.symbol}</span>
                  <p className="font-cinzel text-xs tracking-widest uppercase text-brand-parchment mt-3 mb-1">{c.title}</p>
                  <p className="font-fell text-brand-muted text-xs leading-relaxed">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Buy Section */}
      <section className="px-8 py-20 border-b border-brand-border">
        <div className="max-w-6xl mx-auto">
          <p className="section-label mb-4">The Shop</p>
          <h2 className="font-cinzel font-black text-brand-parchment text-3xl mb-4 leading-tight">
            Own a piece of the world
          </h2>
          <p className="font-fell text-brand-muted leading-loose max-w-xl mb-10">
            Books, maps, and lore documents — direct from the author. No platform cut.
            When the shop opens, everything sold here supports the world being built.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: 'Digital Books', desc: 'DRM-free ePub & PDF editions', icon: '📄' },
              { title: 'Physical Editions', desc: 'Print-on-demand, limited runs', icon: '📚' },
              { title: 'Lore Supplements', desc: 'Player-facing campaign documents', icon: '🗒' },
            ].map((item) => (
              <div key={item.title} className="dark-card">
                <span className="text-2xl">{item.icon}</span>
                <p className="font-cinzel text-xs tracking-widest uppercase text-brand-parchment mt-3 mb-1">{item.title}</p>
                <p className="font-fell text-brand-muted text-sm leading-relaxed mb-4">{item.desc}</p>
                <span className="inline-block font-cinzel text-xs tracking-widest uppercase text-brand-purple-200 border border-brand-purple-600/40 px-2 py-1 rounded-sm">
                  Opening soon
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
