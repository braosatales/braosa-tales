'use client'

export default function Newsletter() {
  return (
    <section className="px-8 py-14 text-center border-t border-gray-100">
      <h2 className="font-cinzel font-bold text-2xl text-gray-900 mb-2">Stay in the loop.</h2>
      <p className="text-sm text-gray-500 mb-6">New tools, new stories, new sessions. No noise.</p>
      <div className="flex flex-col sm:flex-row gap-2 justify-center max-w-sm mx-auto">
        <input
          type="email"
          placeholder="your@email.com"
          className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-purple-400"
        />
        <button type="button" className="btn-primary whitespace-nowrap py-2.5">
          Subscribe
        </button>
      </div>
    </section>
  )
}