'use client'

import Image from 'next/image'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export default function GamesClient() {
  return (
    <main>
      <Nav />

      {/* Hero */}
      <section className="px-8 pt-24 pb-14 text-center border-b border-brand-border">
        <h1 className="font-cinzel font-black text-brand-parchment text-5xl md:text-6xl mb-4 leading-tight">
          The Table
        </h1>
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="h-px w-16 bg-brand-gold-400/30" />
          <span className="text-brand-gold-400/50 text-xs">✦</span>
          <div className="h-px w-16 bg-brand-gold-400/30" />
        </div>
        <p className="font-fell text-brand-gold-300 text-xl md:text-2xl max-w-lg mx-auto leading-relaxed opacity-90">
          Live campaigns in the Braosa Tales universe.
        </p>
      </section>

      {/* Waitlist */}
      <section className="px-8 py-20 border-b border-brand-border">
        <div className="max-w-md mx-auto text-center">
          <p className="section-label">Join the Waitlist</p>
          <h2 className="font-cinzel font-bold text-brand-parchment text-2xl mb-2">
            Claim your seat at the table
          </h2>
          <p className="font-fell text-brand-muted mb-8 leading-relaxed">
            Campaigns fill fast. Get early access before seats open to the public.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 bg-brand-card border border-brand-border rounded-sm px-4 py-3 text-sm text-brand-parchment placeholder-brand-muted focus:outline-none focus:border-brand-purple-600 font-fell"
            />
            <button type="button" className="btn-primary whitespace-nowrap">
              Join waitlist
            </button>
          </div>
        </div>
      </section>

      {/* Watch a Session */}
      <section className="px-8 py-20 border-b border-brand-border">
        <div className="max-w-6xl mx-auto">
          <p className="section-label mb-4">Watch a Session</p>
          <h2 className="font-cinzel font-black text-brand-parchment text-3xl mb-4 leading-tight">
            See how the world plays
          </h2>
          <p className="font-fell text-brand-muted leading-loose max-w-xl mb-10">
            Session recordings capture the chaos, the decisions, and the moments that
            become canon. Watch before you apply — know what kind of table this is.
          </p>
          {/* Placeholder video embed */}
          <div className="dark-card w-full max-w-3xl mx-auto aspect-video flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-full border border-brand-gold-400/40 flex items-center justify-center">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" className="text-brand-gold-400 ml-1">
                <path d="M6 4l14 8-14 8V4z" fill="currentColor" />
              </svg>
            </div>
            <p className="font-cinzel text-xs tracking-widest uppercase text-brand-muted">Session footage coming soon</p>
          </div>
        </div>
      </section>

      {/* VTT Vision */}
      <section className="px-8 py-20 border-b border-brand-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-16 items-start">
          <div className="flex-1">
            <p className="section-label">The VTT Vision</p>
            <h2 className="font-cinzel font-black text-brand-parchment text-3xl mb-4 leading-tight">
              A virtual table built for this world
            </h2>
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px w-12 bg-brand-gold-400/30" />
              <span className="text-brand-gold-400/50 text-xs">✦</span>
            </div>
            <p className="font-fell text-brand-muted leading-loose mb-4">
              Every tool on this site was built to run actual campaigns — the same ones
              you&apos;d watch in the session recordings. The next step is a VTT layer:
              maps, tokens, and initiative tracking woven directly into the Braosa Tales lore engine.
            </p>
            <p className="font-fell text-brand-muted leading-loose">
              The goal isn&apos;t to compete with Foundry or Roll20. It&apos;s to build the
              table this specific world deserves. Purpose-built, not general purpose.
            </p>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-4">
            {[
              { icon: 'living-maps.svg', title: 'Living maps', desc: 'World-aware, not just image uploads' },
              { icon: 'rule-sets.svg', title: 'Rule sets', desc: 'Custom mechanics for the Braosa world' },
              { icon: 'tool-sync.svg', title: 'Tool sync', desc: 'Hooks directly into the Campaign Suite' },
              { icon: 'live-sessions.svg', title: 'Live sessions', desc: 'Streamed or private, your call' },
            ].map((c) => (
              <div key={c.title} className="dark-card">
                <Image src={`/icons/${c.icon}`} width={48} height={48} alt={c.title} />
                <p className="font-cinzel text-xs tracking-widest uppercase text-brand-parchment mt-3 mb-1">{c.title}</p>
                <p className="font-fell text-brand-muted text-xs leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
