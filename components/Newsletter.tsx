'use client'

export default function Newsletter() {
  return (
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
  )
}
