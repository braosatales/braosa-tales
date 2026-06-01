'use client'

import { useState } from 'react'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (res.status === 409) {
        setError("You're already subscribed.")
      } else if (!res.ok) {
        setError('Something went wrong — try again.')
      } else {
        setSuccess(true)
      }
    } catch {
      setError('Something went wrong — try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="px-8 py-10 md:py-20 border-t border-brand-border text-center">
      <div className="max-w-md mx-auto">
        <p className="section-label">Stay in the loop</p>
        <h2 className="font-cinzel font-bold text-brand-parchment text-2xl mb-2">Join the Chronicle</h2>
        <p className="font-fell italic text-brand-muted mb-8 leading-relaxed">
          New tools, new stories, new sessions. No noise.
        </p>
        {success ? (
          <p className="font-fell text-[#D4AE58]">Welcome to the Chronicle.</p>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-brand-card border border-brand-border rounded-sm px-4 py-3 text-sm text-brand-parchment placeholder-brand-muted focus:outline-none focus:border-brand-purple-600 font-fell"
              />
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary whitespace-nowrap"
              >
                {loading ? 'Subscribing...' : 'Subscribe'}
              </button>
            </div>
            {error && (
              <p className={`font-fell text-sm mt-3 ${error.includes('already') ? 'text-[#D4AE58]' : 'text-red-400'}`}>
                {error}
              </p>
            )}
          </>
        )}
      </div>
    </section>
  )
}
