import Image from 'next/image'
import Nav from '@/components/NavServer'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <main>
      <Nav />

      {/* Hero */}
      <section className="px-8 pt-[calc(64px+1.5rem)] md:pt-24 pb-8 md:pb-14 text-center border-b border-brand-border">
        <h1 className="font-cinzel font-black text-brand-parchment text-5xl md:text-6xl mb-4 leading-tight">
          The Lorekeeper
        </h1>
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="h-px w-16 bg-brand-gold-400/30" />
          <span className="text-brand-gold-400/50 text-xs">✦</span>
          <div className="h-px w-16 bg-brand-gold-400/30" />
        </div>
        <p className="font-fell text-[#D4AE58] text-xl md:text-2xl max-w-lg mx-auto leading-relaxed opacity-90">
          Built worlds at the table. Now building the tools to run them.
        </p>
      </section>

      {/* Portrait + Intro */}
      <section className="px-8 py-10 md:py-20 border-b border-brand-border">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-6 md:gap-12 items-start">

          {/* Portrait */}
          <div className="w-full md:w-64 shrink-0">
            <div className="aspect-square border border-brand-gold-400/30 rounded-sm overflow-hidden">
              <Image
                src="https://spg-images.s3.us-west-1.amazonaws.com/f69a921e-053a-4e68-90b1-eebd75156274"
                alt="John Rodrigues — Game Master and Worldbuilder"
                width={400}
                height={400}
                className="rounded object-cover w-full h-full"
              />
            </div>
          </div>

          {/* Intro text */}
          <div className="flex-1">
            <p className="section-label mb-4">The Author</p>
            <p className="font-fell text-brand-muted leading-loose text-lg mb-4">
              John Rodrigues started his D&amp;D career by accident — volunteering to run &apos;just a one-shot&apos; for friends who thought GMing was too hard. That was five years ago. The one-shot never ended.
            </p>
            <p className="font-fell text-brand-muted leading-loose text-lg">
              What started at a table in Portugal became a passion: building worlds deep enough to get lost in, running games where the story belongs to the players, and eventually — when no tool did exactly what he needed — building the tools himself.
            </p>
          </div>
        </div>
      </section>

      {/* How It All Began */}
      <section className="px-8 py-10 md:py-20 border-b border-brand-border">
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
            <p className="font-fell text-brand-muted leading-loose mb-4">
              The first campaigns were borrowed. Pre-made adventures, familiar worlds, learning the craft of the GM one session at a time. But the real spark came later — the slow realisation that the most interesting stories weren&apos;t in any module. They were the ones happening at the table, shaped by the players sitting around it.
            </p>
            <p className="font-fell text-brand-muted leading-loose">
              That&apos;s when Braosa was born. Not launched — born. Quietly, across years of sessions and scrapped notebooks, a world began taking shape that belonged entirely to the people who played in it. It wasn&apos;t until last year that those stories finally had a home to live in.
            </p>
          </div>
        </div>
      </section>

      {/* What Is Braosa Tales */}
      <section className="px-8 py-10 md:py-20 border-b border-brand-border">
        <div className="max-w-3xl mx-auto">
          <p className="section-label mb-3">The Brand</p>
          <h2 className="font-cinzel font-black text-brand-parchment text-3xl mb-4 leading-tight">
            What Is Braosa Tales?
          </h2>
          <div className="flex items-center gap-4 mb-4 md:mb-8">
            <div className="h-px w-16 bg-brand-gold-400/30" />
            <span className="text-brand-gold-400/50 text-xs">✦</span>
          </div>
          <p className="font-fell text-brand-muted leading-loose mb-4">
            Braosa Tales is the platform John is building for the kind of GM he is — and the kind of players who deserve that experience.
          </p>
          <p className="font-fell text-brand-muted leading-loose mb-4">
            The tools in the Atelier are the ones he needed and couldn&apos;t find. The stories coming to the Chronicle are the ones his players lived. The games in the Arena are the campaigns still running.
          </p>
          <p className="font-fell text-brand-muted leading-loose mb-4">
            Eventually: the novels. The worldsetting books. The published universe that started as a borrowed adventure and became something entirely its own.
          </p>
          <p className="font-fell text-brand-muted leading-loose">
            It&apos;s all the same world. You&apos;re just arriving early.
          </p>
        </div>
      </section>

      {/* A Bit More */}
      <section className="px-8 py-10 md:py-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-cinzel font-black text-brand-parchment text-3xl mb-4 leading-tight">
            A Bit More
          </h2>
          <div className="flex items-center gap-4 mb-4 md:mb-8">
            <div className="h-px w-16 bg-brand-gold-400/30" />
            <span className="text-brand-gold-400/50 text-xs">✦</span>
          </div>
          <div className="dark-card mb-5 md:mb-10">
            <p className="font-fell text-brand-muted leading-loose">
              When not at the table, John manages construction teams in Portugal — coordinating the kind of complex, moving-parts work that turns out to be surprisingly good training for running campaigns. He&apos;s married, father of three, a committed Tolkien obsessive (The Silmarillion is the correct answer), and has been known to use genuinely terrible accents for NPCs.
            </p>
          </div>
          <Link href="/atelier" className="btn-primary">
            Explore the Atelier
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  )
}
