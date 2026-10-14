'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useHub } from './HubContext'
import type { HubCampaign, CampaignLink } from '@/lib/hub/server'

const input =
  'w-full rounded-lg border border-plum-line bg-night px-3.5 py-2.5 text-prose placeholder:text-mist/40 focus:border-leaf focus:outline-none'

const LINK_IDEAS = ['Discord', 'Foundry VTT', 'D&D Beyond campaign', 'StartPlaying', 'Owlbear Rodeo', 'Session notes']

function Block({ title, intro, children }: { title: string; intro?: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-plum-line py-10 first:border-t-0 first:pt-0">
      <div className="grid gap-6 md:grid-cols-[14rem_1fr] md:gap-12">
        <div>
          <h2 className="font-cinzel text-[1.25rem] font-bold text-vellum">{title}</h2>
          {intro && <p className="mt-1 text-[0.92rem] leading-snug text-mist">{intro}</p>}
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  )
}

export function DetailsForm({ c }: { c: HubCampaign }) {
  const { api } = useHub()
  const router = useRouter()
  const [f, setF] = useState({
    title: c.title,
    tagline: c.tagline ?? '',
    system: c.system ?? '',
    levels: c.levels ?? '',
    status: c.status,
    description: c.description ?? '',
  })
  const [links, setLinks] = useState<CampaignLink[]>(c.links.length ? c.links : [])
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF((x) => ({ ...x, [k]: e.target.value }))

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setMsg(null)
    const res = await fetch(`${api}/campaign`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...f, links: links.filter((l) => l.label.trim() && l.url.trim()) }),
    })
    const j = await res.json()
    setBusy(false)
    if (!res.ok) return setMsg({ ok: false, text: j.error ?? 'That didn’t save.' })
    setLinks(j.links ?? [])
    setMsg({ ok: true, text: 'Saved.' })
    router.refresh()
  }

  return (
    <form onSubmit={save} className="space-y-10">
      <Block title="Details" intro="What players see at the top of the campaign site and on their dashboard.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="m-title" className="section-label block">Name</label>
            <input id="m-title" required maxLength={80} value={f.title} onChange={set('title')} className={input} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="m-tag" className="section-label block">Tagline</label>
            <input id="m-tag" maxLength={140} value={f.tagline} onChange={set('tagline')} placeholder="Who gets to remake the world?" className={input} />
          </div>
          <div>
            <label htmlFor="m-sys" className="section-label block">System</label>
            <input id="m-sys" maxLength={60} value={f.system} onChange={set('system')} placeholder="D&D 5e (2024)" className={input} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="m-lvl" className="section-label block">Levels</label>
              <input id="m-lvl" maxLength={20} value={f.levels} onChange={set('levels')} placeholder="1–20" className={input} />
            </div>
            <div>
              <label htmlFor="m-status" className="section-label block">Status</label>
              <select id="m-status" value={f.status} onChange={set('status')} className={input}>
                <option value="active">Running</option>
                <option value="paused">On a break</option>
                <option value="finished">Finished</option>
              </select>
            </div>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="m-desc" className="section-label block">About the campaign</label>
            <textarea id="m-desc" rows={5} maxLength={4000} value={f.description} onChange={set('description')} placeholder="Shown at the top of the overview." className={`${input} resize-y`} />
          </div>
        </div>
      </Block>

      <Block title="Links" intro="Shown as buttons under the campaign name: Discord, the VTT, the D&D Beyond campaign.">
        <ul className="space-y-3">
          {links.map((l, i) => (
            <li key={i} className="grid gap-2 sm:grid-cols-[12rem_1fr_auto]">
              <input
                value={l.label}
                onChange={(e) => setLinks((ls) => ls.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))}
                placeholder="Label"
                aria-label="Link label"
                list="link-ideas"
                maxLength={40}
                className={input}
              />
              <input
                value={l.url}
                onChange={(e) => setLinks((ls) => ls.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))}
                placeholder="https://"
                aria-label="Link address"
                inputMode="url"
                className={input}
              />
              <button type="button" onClick={() => setLinks((ls) => ls.filter((_, j) => j !== i))} className="px-2 text-[0.9rem] text-mist hover:text-red-300">
                Remove
              </button>
            </li>
          ))}
        </ul>
        <datalist id="link-ideas">
          {LINK_IDEAS.map((x) => (
            <option key={x} value={x} />
          ))}
        </datalist>
        {links.length < 12 && (
          <button type="button" onClick={() => setLinks((ls) => [...ls, { label: '', url: '' }])} className="btn-outline mt-4">
            Add a link
          </button>
        )}
        <div className="mt-8 flex items-center gap-4">
          <button type="submit" disabled={busy} className="btn-primary">{busy ? 'Saving…' : 'Save details and links'}</button>
          {msg && <p role="status" className={msg.ok ? 'text-leaf-soft' : 'text-red-300'}>{msg.text}</p>}
        </div>
      </Block>
    </form>
  )
}

export function CoverForm({ cover }: { cover: string | null }) {
  const { api } = useHub()
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const ref = useRef<HTMLInputElement>(null)

  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setBusy(true)
    setErr(null)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch(`${api}/cover`, { method: 'POST', body: fd })
    setBusy(false)
    if (!res.ok) return setErr((await res.json()).error ?? 'Upload failed')
    router.refresh()
  }

  async function remove() {
    setBusy(true)
    await fetch(`${api}/cover`, { method: 'DELETE' })
    setBusy(false)
    router.refresh()
  }

  return (
    <Block title="Cover image" intro="Behind the campaign name, and on everyone’s dashboard. Wide images work best (16:9).">
      <div className="flex flex-wrap items-center gap-5">
        <div className="relative aspect-video w-64 overflow-hidden rounded-xl border border-plum-line bg-gradient-to-br from-umber-line via-umber to-plum">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {cover && <img src={cover} alt="Current cover" className="h-full w-full object-cover" />}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={pick} aria-label="Upload a cover image" />
          <button type="button" onClick={() => ref.current?.click()} disabled={busy} className="btn-outline">
            {busy ? 'Working…' : cover ? 'Change cover' : 'Upload a cover'}
          </button>
          {cover && (
            <button type="button" onClick={remove} disabled={busy} className="text-[0.9rem] text-mist hover:text-vellum">Remove</button>
          )}
        </div>
      </div>
      {err && <p role="alert" className="mt-3 text-red-300">{err}</p>}
    </Block>
  )
}

export function MembersBlock({ children }: { children: React.ReactNode }) {
  return (
    <Block title="Players" intro="Who can open this site. Players added by email join as soon as they sign up with that address.">
      {children}
    </Block>
  )
}

export function DeleteBlock({ title }: { title: string }) {
  const { api } = useHub()
  const router = useRouter()
  const [typed, setTyped] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function del(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    const res = await fetch(`${api}/campaign`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ confirm: typed }) })
    if (!res.ok) {
      setBusy(false)
      return setErr((await res.json()).error ?? 'That didn’t work.')
    }
    router.replace('/dashboard')
    router.refresh()
  }

  return (
    <Block title="Delete campaign" intro="Permanent. There’s no undo.">
      <div className="rounded-xl border border-red-400/30 bg-red-950/10 p-5">
        <p className="leading-relaxed text-prose">
          This deletes the whole site: lore, quests, maps, the party, recaps, every player’s journal and pins, and all memberships. If the story is just
          on a break, set its status to <span className="text-vellum">On a break</span> instead.
        </p>
        <form onSubmit={del} className="mt-4 flex max-w-xl flex-col gap-2 sm:flex-row">
          <label htmlFor="del-confirm" className="sr-only">Type the campaign name to confirm</label>
          <input id="del-confirm" value={typed} onChange={(e) => setTyped(e.target.value)} placeholder={title} autoComplete="off" className={input} />
          <button type="submit" disabled={typed.trim() !== title || busy} className="shrink-0 rounded-full bg-red-800 px-5 py-2 text-[0.78rem] font-bold tracking-[0.08em] text-vellum transition-colors hover:bg-red-700 disabled:opacity-40">
            {busy ? 'Deleting…' : 'Delete campaign'}
          </button>
        </form>
        <p className="mt-2 text-[0.85rem] text-mist">Type the name exactly as shown to confirm.</p>
        {err && <p role="alert" className="mt-2 text-red-300">{err}</p>}
      </div>
    </Block>
  )
}
