'use client'

import { useState } from 'react'
import { useHub } from './HubContext'

/** Send the GM a line or veil without a name attached. */
export default function SafetyNoteForm() {
  const { api } = useHub()
  const [kind, setKind] = useState<'line' | 'veil' | 'other'>('line')
  const [body, setBody] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  async function send(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setMsg(null)
    const res = await fetch(`${api}/safety`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind, body }) })
    setBusy(false)
    if (!res.ok) return setMsg({ ok: false, text: (await res.json().catch(() => ({}))).error ?? 'That didn’t go through.' })
    setBody('')
    setMsg({ ok: true, text: 'Sent. Your game master sees it without your name.' })
  }

  return (
    <form onSubmit={send} className="rounded-2xl border border-plum-line bg-plum p-5">
      <p className="font-cinzel text-[1.05rem] font-bold text-vellum">Tell the GM privately</p>
      <p className="mt-1 text-[0.9rem] text-mist">Sent without your name. You don’t have to explain why.</p>
      <div role="radiogroup" aria-label="What is it" className="mt-4 flex flex-wrap gap-2">
        {(
          [
            ['line', 'A line: keep it out of the game'],
            ['veil', 'A veil: keep it off-screen'],
            ['other', 'Something else'],
          ] as const
        ).map(([v, label]) => (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={kind === v}
            onClick={() => setKind(v)}
            className={`rounded-full border px-3 py-1 text-[0.85rem] ${kind === v ? 'border-leaf bg-leaf/15 text-leaf-soft' : 'border-plum-line text-prose hover:border-amethyst'}`}
          >
            {label}
          </button>
        ))}
      </div>
      <label htmlFor="safety-note" className="sr-only">Your note</label>
      <textarea
        id="safety-note"
        rows={3}
        maxLength={500}
        required
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="For example: harm to animals, or graphic descriptions of injuries"
        className="mt-3 w-full resize-y rounded-lg border border-plum-line bg-night px-3.5 py-2.5 text-prose placeholder:text-mist/40 focus:border-leaf focus:outline-none"
      />
      <div className="mt-3 flex flex-wrap items-center gap-4">
        <button type="submit" disabled={busy || !body.trim()} className="btn-primary">{busy ? 'Sending…' : 'Send'}</button>
        {msg && <p role="status" className={`text-[0.9rem] ${msg.ok ? 'text-leaf-soft' : 'text-red-300'}`}>{msg.text}</p>}
      </div>
    </form>
  )
}
