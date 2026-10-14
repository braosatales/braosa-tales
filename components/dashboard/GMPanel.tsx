'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { CampaignAdminView } from '@/lib/campaigns'

const input =
  'w-full rounded-lg border border-plum-line bg-night px-3.5 py-2.5 text-prose placeholder:text-mist/40 focus:border-leaf focus:outline-none'

function NewCampaign({ onCancel }: { onCancel: () => void }) {
  const router = useRouter()
  const [f, setF] = useState({ title: '', tagline: '', system: 'D&D 5e (2024)', levels: '' })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF((x) => ({ ...x, [k]: e.target.value }))

  async function create(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setErr(null)
    const res = await fetch('/api/campaigns', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) })
    const j = await res.json()
    if (!res.ok) {
      setBusy(false)
      return setErr(j.error ?? 'That didn’t work. Try again.')
    }
    router.push(`/campaigns/${j.slug}/manage`)
  }

  return (
    <form onSubmit={create} className="rounded-2xl border border-leaf/40 bg-plum p-6">
      <h3 className="font-cinzel text-[1.25rem] font-bold text-vellum">New campaign</h3>
      <p className="mt-1 text-[0.92rem] text-mist">You can change all of this later, add a cover, links and players in its Manage tab.</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="nc-title" className="section-label block">Name</label>
          <input id="nc-title" required maxLength={80} value={f.title} onChange={set('title')} placeholder="Curse of the Crimson Tide" className={input} autoFocus />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="nc-tag" className="section-label block">Tagline (optional)</label>
          <input id="nc-tag" maxLength={140} value={f.tagline} onChange={set('tagline')} placeholder="One line that makes someone want a seat." className={input} />
        </div>
        <div>
          <label htmlFor="nc-sys" className="section-label block">System</label>
          <input id="nc-sys" maxLength={60} value={f.system} onChange={set('system')} className={input} />
        </div>
        <div>
          <label htmlFor="nc-lvl" className="section-label block">Levels (optional)</label>
          <input id="nc-lvl" maxLength={20} value={f.levels} onChange={set('levels')} placeholder="1–10" className={input} />
        </div>
      </div>
      {err && <p role="alert" className="mt-4 text-red-300">{err}</p>}
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="submit" disabled={busy || !f.title.trim()} className="btn-gold disabled:opacity-60">{busy ? 'Creating…' : 'Create campaign'}</button>
        <button type="button" onClick={onCancel} className="btn-ghost">Cancel</button>
      </div>
    </form>
  )
}

export default function GMPanel({ campaigns, canCreate }: { campaigns: CampaignAdminView[]; canCreate: boolean }) {
  const [creating, setCreating] = useState(false)

  return (
    <div>
      {canCreate && !creating && (
        <button type="button" onClick={() => setCreating(true)} className="btn-gold">
          <span aria-hidden="true" className="text-[1.1rem] leading-none">+</span> New campaign
        </button>
      )}
      {creating && <NewCampaign onCancel={() => setCreating(false)} />}

      {campaigns.length > 0 && (
        <ul className="mt-8 divide-y divide-plum-line border-y border-plum-line">
          {campaigns.map((c) => {
            const players = c.members.filter((m) => m.role === 'player').length
            return (
              <li key={c.id} className="flex flex-wrap items-center gap-x-6 gap-y-2 py-4">
                <div className="min-w-0 flex-1">
                  <p className="font-cinzel text-[1.15rem] font-bold text-vellum">{c.title}</p>
                  <p className="text-[0.9rem] text-mist">
                    {players} {players === 1 ? 'player' : 'players'}
                    {c.invites.length > 0 && `, ${c.invites.length} invited`}
                    {c.status !== 'active' && ` · ${c.status === 'paused' ? 'on a break' : 'finished'}`}
                  </p>
                </div>
                <div className="flex items-center gap-5">
                  <Link href={`/campaigns/${c.slug}`} className="link-quiet text-[0.92rem]">Open</Link>
                  <Link href={`/campaigns/${c.slug}/manage`} className="btn-ghost px-5 py-2">Manage</Link>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
