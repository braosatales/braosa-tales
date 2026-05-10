'use client'

import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

const posts = [
  {
    category: 'Tools',
    date: 'Apr 12, 2025',
    title: 'How the Campaign Suite manages 400+ NPCs without losing your mind',
    excerpt: 'The design decisions behind the character graph — why we store relationships as edges, not nested properties.',
  },
  {
    category: 'Lore',
    date: 'Mar 28, 2025',
    title: "The Founding of the Ashward Compact — a retelling from the loser's side",
    excerpt: "Every great empire has an official history. Here's the version the empire doesn't teach.",
  },
  {
    category: 'Sessions',
    date: 'Mar 14, 2025',
    title: 'Session 47 recap: the party burns down the wrong building (on purpose)',
    excerpt: "I said sandbox campaign. I meant it. This week the players made three NPCs permanently hostile and I loved every second.",
  },
]

const categoryColors: Record<string, string> = {
  Tools: 'text-brand-purple-200 border-brand-purple-600/40',
  Lore: 'text-brand-gold-300 border-brand-gold-400/40',
  Sessions: 'text-brand-parchment border-brand-border',
}

export default function BlogPage() {
  return (
    <main>
      <Nav />

      {/* Hero */}
      <section className="px-8 pt-40 pb-24 text-center border-b border-brand-border">
        <p className="section-label">The Blog</p>
        <h1 className="font-cinzel font-black text-brand-parchment text-5xl md:text-6xl mb-4 leading-tight">
          The Chronicle
        </h1>
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="h-px w-16 bg-brand-gold-400/30" />
          <span className="text-brand-gold-400/50 text-xs">✦</span>
          <div className="h-px w-16 bg-brand-gold-400/30" />
        </div>
        <p className="font-fell italic text-brand-gold-300 text-xl md:text-2xl max-w-lg mx-auto leading-relaxed opacity-90">
          Dev updates, lore drops, session recaps.
        </p>
      </section>

      {/* Post grid */}
      <section className="px-8 py-20 border-b border-brand-border">
        <div className="max-w-6xl mx-auto">
          <p className="section-label mb-8">Recent Posts</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {posts.map((post) => (
              <article key={post.title} className="dark-card flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className={`font-cinzel text-xs tracking-widest uppercase border px-2 py-1 rounded-sm ${categoryColors[post.category]}`}>
                    {post.category}
                  </span>
                  <span className="font-fell text-xs text-brand-muted italic">{post.date}</span>
                </div>
                <h3 className="font-cinzel font-bold text-brand-parchment text-sm leading-snug">
                  {post.title}
                </h3>
                <p className="font-fell text-brand-muted text-sm leading-relaxed flex-1">
                  {post.excerpt}
                </p>
                <a href="#" className="font-cinzel text-xs tracking-widest uppercase text-brand-gold-300 hover:text-brand-gold-300/70 transition-colors mt-auto">
                  Read more →
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="px-8 py-20 border-t border-brand-border text-center">
        <div className="max-w-md mx-auto">
          <p className="section-label">Stay in the loop</p>
          <h2 className="font-cinzel font-bold text-brand-parchment text-2xl mb-2">Join the Chronicle</h2>
          <p className="font-fell italic text-brand-muted mb-8 leading-relaxed">
            New tools, new stories, new sessions. No noise.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 bg-brand-card border border-brand-border rounded-sm px-4 py-3 text-sm text-brand-parchment placeholder-brand-muted focus:outline-none focus:border-brand-purple-600 font-fell"
            />
            <button type="button" className="btn-primary whitespace-nowrap">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
