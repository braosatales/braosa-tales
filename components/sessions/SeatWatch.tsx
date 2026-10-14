'use client'

import { useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'

/** "Tell me when a seat opens" for one campaign. Signed in: one click with your account email. */
export default function SeatWatch({ slug, title }: { slug: string; title: string }) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  async function watch(addr?: string) {
    setBusy(true)
    setErr(null)
    const res = await fetch('/api/campaigns/watch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, email: addr }),
    })
    const j = await res.json().catch(() => ({}))
    setBusy(false)
    if (!res.ok) return setErr(j.error ?? 'That didn’t go through. Try again.')
    setDone(j.email)
  }

  if (done)
    return (
      <p role="status" className="max-w-[18rem] text-right text-[0.9rem] leading-snug text-leaf-soft">
        Done. We’ll email {done} when a seat opens in {title}.
      </p>
    )

  if (user?.email)
    return (
      <div className="text-right">
        <button type="button" onClick={() => watch()} disabled={busy} className="btn-ghost disabled:opacity-60">
          {busy ? 'Adding…' : 'Notify me when a seat opens'}
        </button>
        {err && <p role="alert" className="mt-2 text-[0.85rem] text-red-300">{err}</p>}
      </div>
    )

  if (!open)
    return (
      <button type="button" onClick={() => setOpen(true)} className="btn-ghost">
        Notify me when a seat opens
      </button>
    )

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        watch(email)
      }}
      className="flex w-full flex-col gap-2 sm:flex-row"
    >
      <label htmlFor={`watch-${slug}`} className="sr-only">Your email</label>
      <input
        id={`watch-${slug}`}
        type="email"
        required
        autoFocus
        autoComplete="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="min-w-0 flex-1 rounded-full border border-umber-line bg-night px-4 py-2.5 text-prose placeholder:text-mist/50 focus:border-leaf focus:outline-none"
      />
      <button type="submit" disabled={busy} className="btn-gold whitespace-nowrap disabled:opacity-60">{busy ? 'Adding…' : 'Notify me'}</button>
      {err && <p role="alert" className="text-[0.85rem] text-red-300 sm:basis-full">{err}</p>}
    </form>
  )
}
