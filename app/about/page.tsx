import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <main>
      <Nav />

      {/* Hero */}
      <section className="px-8 pt-24 pb-14 text-center border-b border-brand-border">
        <h1 className="font-cinzel font-black text-brand-parchment text-5xl md:text-6xl mb-4 leading-tight">
          The Lorekeeper
        </h1>
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="h-px w-16 bg-brand-gold-400/30" />
          <span className="text-brand-gold-400/50 text-xs">✦</span>
          <div className="h-px w-16 bg-brand-gold-400/30" />
        </div>
        <p className="font-fell italic text-brand-gold-300 text-xl md:text-2xl max-w-lg mx-auto leading-relaxed opacity-90">
          [SUBTITLE PLACEHOLDER]
        </p>
      </section>

      {/* Portrait + Intro */}
      <section className="px-8 py-20 border-b border-brand-border">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-12 items-start">

          {/* Portrait placeholder */}
          <div className="w-full md:w-64 shrink-0">
            <div className="aspect-square bg-brand-card border border-brand-gold-400/30 rounded-sm relative flex flex-col items-center justify-center gap-6">
              <div className="absolute top-3 left-3 w-5 h-5 border-t border-l border-brand-gold-400/40" />
              <div className="absolute top-3 right-3 w-5 h-5 border-t border-r border-brand-gold-400/40" />
              <div className="absolute bottom-3 left-3 w-5 h-5 border-b border-l border-brand-gold-400/40" />
              <div className="absolute bottom-3 right-3 w-5 h-5 border-b border-r border-brand-gold-400/40" />
              <div className="h-px w-12 bg-brand-gold-400/30" />
              <p className="font-fell italic text-brand-muted text-center text-sm px-8">
                Photo coming soon
              </p>
              <div className="h-px w-12 bg-brand-gold-400/30" />
            </div>
          </div>

          {/* Intro text */}
          <div className="flex-1">
            <p className="section-label mb-4">The Author</p>
            <p className="font-fell text-brand-muted leading-loose text-lg">
              [INTRO TEXT PLACEHOLDER]
            </p>
          </div>
        </div>
      </section>

      {/* How It All Began */}
      <section className="px-8 py-20 border-b border-brand-border">
        <div className="max-w-3xl mx-auto">
          <div className="dark-card">
            <p className="section-label mb-2">Origin</p>
            <h2 className="font-cinzel font-black text-brand-parchment text-3xl mb-3 leading-tight">
              How It All Began
            </h2>
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px flex-1 bg-brand-gold-400/20" />
              <span className="text-brand-gold-400/40 font-cinzel text-xs tracking-widest uppercase">Journal Entry</span>
              <div className="h-px flex-1 bg-brand-gold-400/20" />
            </div>
            <p className="font-fell text-brand-muted leading-loose">
              [DND ORIGIN STORY PLACEHOLDER]
            </p>
          </div>
        </div>
      </section>

      {/* What Is Braosa Tales */}
      <section className="px-8 py-20">
        <div className="max-w-3xl mx-auto">
          <p className="section-label mb-3">The Brand</p>
          <h2 className="font-cinzel font-black text-brand-parchment text-3xl mb-4 leading-tight">
            What Is Braosa Tales?
          </h2>
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px w-16 bg-brand-gold-400/30" />
            <span className="text-brand-gold-400/50 text-xs">✦</span>
          </div>
          <p className="font-fell text-brand-muted leading-loose mb-10">
            [BRAND STORY PLACEHOLDER]
          </p>
          <Link href="/atelier" className="btn-primary">
            Explore the Atelier
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  )
}
