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
    <section id="quill-end" className="border-t border-plum-line">
      <div className="mx-auto max-w-xl px-6 py-20 text-center md:py-24">
        <h2 className="font-cinzel text-[1.8rem] font-bold text-vellum">The Chronicle</h2>
        <p className="mt-3 leading-relaxed text-prose">
          New seats, new tools and new stories, in one short email when there’s something worth telling.
        </p>
        {success ? (
          <p role="status" className="mt-8 text-leaf-soft">You’re in. Watch your inbox for the next Chronicle.</p>
        ) : (
          <form
            className="mt-8"
            onSubmit={(e) => {
              e.preventDefault()
              handleSubmit()
            }}
          >
            <div className="flex flex-col gap-2 sm:flex-row">
              <label htmlFor="chronicle-email" className="sr-only">Email address</label>
              <input
                id="chronicle-email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 rounded-full border border-plum-line bg-plum px-5 py-3 text-prose placeholder:text-mist/50 focus:border-leaf focus:outline-none"
              />
              <button type="submit" disabled={loading} className="btn-gold whitespace-nowrap disabled:opacity-60">
                {loading ? 'Subscribing…' : 'Subscribe'}
              </button>
            </div>
            {error && (
              <p role="alert" className={`mt-3 text-[0.9rem] ${error.includes('already') ? 'text-leaf-soft' : 'text-red-300'}`}>
                {error}
              </p>
            )}
          </form>
        )}
      </div>
    </section>
  )
}
