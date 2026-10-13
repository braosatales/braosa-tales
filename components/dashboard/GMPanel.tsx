'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { CampaignAdminView } from '@/lib/campaigns'

function CampaignAdmin({ c }: { c: CampaignAdminView }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState<string | null>(null)
  const [code, setCode] = useState(c.invite_code)
  const [copied, setCopied] = useState(false)
  const link = typeof window !== 'undefined' ? `${window.location.origin}/join/${code}` : `/join/${code}`

  async function add(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setNote(null)
    const res = await fetch('/api/campaigns/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaignId: c.id, email }),
    })
    const data = await res.json()
    setBusy(false)
    if (!res.ok) return setNote(data.error ?? 'That didn’t work. Try again.')
    setNote(data.status === 'added' ? `${email} added.` : `${email} has no account yet. They’ll join when they sign up with that email.`)
    setEmail('')
    router.refresh()
  }

  async function remove(body: { userId?: string; email?: string }) {
    await fetch('/api/campaigns/members', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaignId: c.id, ...body }),
    })
    router.refresh()
  }

  async function regenerate() {
    const res = await fetch('/api/campaigns/invite-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaignId: c.id }),
    })
    if (res.ok) {
      setCode((await res.json()).code)
      setCopied(false)
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  const players = c.members.filter((m) => m.role === 'player')

  return (
    <details className="group border-b border-plum-line py-5">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
        <span className="font-cinzel text-[1.15rem] font-bold text-vellum">{c.title}</span>
        <span className="text-[0.9rem] text-mist">
          {players.length} {players.length === 1 ? 'player' : 'players'}
          {c.invites.length > 0 && `, ${c.invites.length} invited`}
          <span aria-hidden="true" className="ml-3 inline-block text-leaf transition-transform group-open:rotate-45">+</span>
        </span>
      </summary>

      <div className="mt-5 grid gap-8 lg:grid-cols-2">
        <div>
          <h4 className="text-[0.9rem] text-mist">Players</h4>
          <ul className="mt-2 divide-y divide-plum-line border-y border-plum-line">
            {players.length === 0 && c.invites.length === 0 && <li className="py-3 text-[0.95rem] text-mist">No players yet.</li>}
            {players.map((m) => (
              <li key={m.user_id} className="flex items-center justify-between gap-3 py-2.5">
                <span className="min-w-0 truncate text-[0.95rem] text-prose">
                  {m.name || m.email || 'Unnamed player'}
                  {m.name && m.email && <span className="text-mist"> ({m.email})</span>}
                </span>
                <button type="button" onClick={() => remove({ userId: m.user_id })} className="shrink-0 text-[0.85rem] text-mist hover:text-red-300">
                  Remove
                </button>
              </li>
            ))}
            {c.invites.map((e) => (
              <li key={e} className="flex items-center justify-between gap-3 py-2.5">
                <span className="min-w-0 truncate text-[0.95rem] text-mist">{e} <span className="text-[0.8rem]">(invited, no account yet)</span></span>
                <button type="button" onClick={() => remove({ email: e })} className="shrink-0 text-[0.85rem] text-mist hover:text-red-300">
                  Cancel
                </button>
              </li>
            ))}
          </ul>

          <form onSubmit={add} className="mt-4 flex flex-col gap-2 sm:flex-row">
            <label htmlFor={`add-${c.id}`} className="sr-only">Player’s email</label>
            <input
              id={`add-${c.id}`}
              type="email"
              required
              placeholder="player@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 rounded-full border border-plum-line bg-night px-4 py-2 text-[0.95rem] text-prose placeholder:text-mist/50 focus:border-leaf focus:outline-none"
            />
            <button type="submit" disabled={busy} className="btn-gold px-5 py-2 disabled:opacity-60">
              {busy ? 'Adding…' : 'Add player'}
            </button>
          </form>
          {note && <p role="status" className="mt-2 text-[0.9rem] text-leaf-soft">{note}</p>}
        </div>

        <div>
          <h4 className="text-[0.9rem] text-mist">Invite link</h4>
          <p className="mt-2 text-[0.95rem] leading-relaxed text-prose">
            Anyone who opens this while signed in joins as a player. Share it in your Discord.
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input readOnly value={link} aria-label="Invite link" className="min-w-0 flex-1 rounded-full border border-plum-line bg-night px-4 py-2 text-[0.85rem] text-mist" onFocus={(e) => e.target.select()} />
            <button type="button" onClick={copy} className="btn-ghost px-5 py-2">
              {copied ? 'Copied' : 'Copy link'}
            </button>
          </div>
          <button type="button" onClick={regenerate} className="mt-3 text-[0.85rem] text-mist underline decoration-mist/40 underline-offset-[0.3em] hover:text-vellum">
            Make a new link (the old one stops working)
          </button>
        </div>
      </div>
    </details>
  )
}

export default function GMPanel({ campaigns }: { campaigns: CampaignAdminView[] }) {
  return (
    <div className="border-t border-plum-line">
      {campaigns.map((c) => (
        <CampaignAdmin key={c.id} c={c} />
      ))}
    </div>
  )
}
