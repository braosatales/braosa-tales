'use client'

import { useState } from 'react'

export default function NotifyForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'games' }),
      })
      if (res.status === 409) setError('You’re already on the list.')
      else if (!res.ok) setError('That didn’t go through. Check the address and try again.')
      else setDone(true)
    } catch {
      setError('That didn’t go through. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  if (done) return <p role="status" className="text-leaf-soft">Done. You’ll hear from us when a new table opens.</p>

  return (
    <form onSubmit={submit}>
      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor="notify-email" className="sr-only">Email address</label>
        <input
          id="notify-email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 rounded-full border border-umber-line bg-umber-deep px-5 py-3 text-prose placeholder:text-mist/50 focus:border-leaf focus:outline-none"
        />
        <button type="submit" disabled={loading} className="btn-gold whitespace-nowrap disabled:opacity-60">
          {loading ? 'Adding…' : 'Notify me'}
        </button>
      </div>
      {error && <p role="alert" className="mt-3 text-[0.9rem] text-leaf-soft">{error}</p>}
    </form>
  )
}
