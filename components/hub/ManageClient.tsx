'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useHub } from './HubContext'
import type { HubCampaign, CampaignLink } from '@/lib/hub/server'
import { CONTENT_SUGGESTIONS, RATINGS, SAFETY_TOOLS, type Act, type Safety } from '@/lib/listing-shared'

const input =
  'w-full rounded-lg border border-plum-line bg-night px-3.5 py-2.5 text-prose placeholder:text-mist/40 focus:border-leaf focus:outline-none'

const LINK_IDEAS = ['Discord', 'Foundry VTT', 'D&D Beyond campaign', 'StartPlaying', 'Owlbear Rodeo', 'Session notes']

function Block({ title, intro, children }: { title: string; intro?: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-plum-line py-10">
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

/* ───────────────────────── Public listing ───────────────────────── */

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'BRL']

export function ListingForm({ c, seatsTaken }: { c: HubCampaign; seatsTaken: number }) {
  const { api } = useHub()
  const router = useRouter()
  const [f, setF] = useState({
    listed: c.listed,
    listed_as: c.listed_as ?? '',
    pitch: c.pitch ?? '',
    price: c.price == null ? '' : String(c.price),
    currency: c.currency || 'USD',
    session_length: c.session_length ?? '',
    frequency: c.frequency ?? '',
    booking_url: c.booking_url ?? '',
    seats_total: c.seats_total == null ? '' : String(c.seats_total),
    sessions_played: c.sessions_played == null ? '' : String(c.sessions_played),
  })
  const [acts, setActs] = useState<Act[]>(c.acts.length ? c.acts : [])
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF((x) => ({ ...x, [k]: e.target.value }))
  const total = f.seats_total === '' ? null : Number(f.seats_total)
  const left = total == null ? null : Math.max(0, total - seatsTaken)

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setMsg(null)
    const res = await fetch(`${api}/campaign`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...f, acts: acts.filter((a) => a.name.trim()) }),
    })
    const j = await res.json()
    setBusy(false)
    if (!res.ok) return setMsg({ ok: false, text: j.error ?? 'That didn’t save.' })
    setMsg({ ok: true, text: f.listed ? 'Saved. The card on Sessions and the home page updates within a minute.' : 'Saved.' })
    router.refresh()
  }

  return (
    <form onSubmit={save}>
      <Block title="Public listing" intro="The card on the Sessions page and the home page. The hook is the tagline above.">
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-plum-line bg-night/50 px-4 py-3">
          <input type="checkbox" checked={f.listed} onChange={(e) => setF((x) => ({ ...x, listed: e.target.checked }))} className="h-4 w-4 accent-leaf" />
          <span className="text-prose">Show this campaign on Sessions and the home page</span>
        </label>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="l-as" className="section-label block">Listed on StartPlaying as</label>
            <input id="l-as" maxLength={120} value={f.listed_as} onChange={set('listed_as')} placeholder="Tyranny of Dragons" className={input} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="l-url" className="section-label block">StartPlaying link (the Book a seat button)</label>
            <input id="l-url" value={f.booking_url} onChange={set('booking_url')} inputMode="url" placeholder="https://startplaying.games/adventure/…" className={input} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="l-pitch" className="section-label block">Pitch</label>
            <textarea id="l-pitch" rows={4} maxLength={1500} value={f.pitch} onChange={set('pitch')} placeholder="Two or three sentences that sell the story." className={`${input} resize-y`} />
          </div>
          <div className="grid grid-cols-[1fr_6rem] gap-3">
            <div>
              <label htmlFor="l-price" className="section-label block">Price per session</label>
              <input id="l-price" type="number" min={0} step="0.5" value={f.price} onChange={set('price')} placeholder="20" className={input} />
            </div>
            <div>
              <label htmlFor="l-cur" className="section-label block">Currency</label>
              <select id="l-cur" value={f.currency} onChange={set('currency')} className={input}>
                {CURRENCIES.map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="l-len" className="section-label block">Session length</label>
              <input id="l-len" maxLength={40} value={f.session_length} onChange={set('session_length')} placeholder="3 hours" className={input} />
            </div>
            <div>
              <label htmlFor="l-freq" className="section-label block">How often</label>
              <input id="l-freq" maxLength={40} value={f.frequency} onChange={set('frequency')} placeholder="weekly" className={input} />
            </div>
          </div>
          <div>
            <label htmlFor="l-seats" className="section-label block">Seats at the table</label>
            <input id="l-seats" type="number" min={1} max={12} value={f.seats_total} onChange={set('seats_total')} placeholder="5" className={input} />
            <p className="mt-1.5 text-[0.85rem] text-mist">
              {seatsTaken} taken (players and pending email invites)
              {left !== null && `, ${left === 0 ? 'none' : left} left`}
              {left === 1 && '. The card says LAST SEAT'}
              {left === 0 && '. The card shows Full'}
            </p>
          </div>
          <div>
            <label htmlFor="l-told" className="section-label block">Sessions played</label>
            <input id="l-told" type="number" min={0} value={f.sessions_played} onChange={set('sessions_played')} placeholder="Counts your recaps if empty" className={input} />
            <p className="mt-1.5 text-[0.85rem] text-mist">Shown on the stamp once the campaign is Finished.</p>
          </div>
        </div>

        <div className="mt-8">
          <p className="section-label">Acts</p>
          <ul className="space-y-3">
            {acts.map((a, i) => (
              <li key={i} className="rounded-xl border border-plum-line bg-night/40 p-3">
                <div className="grid gap-2 sm:grid-cols-[1fr_7rem_auto]">
                  <input value={a.name} onChange={(e) => setActs((xs) => xs.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} placeholder={`Act ${i + 1} name`} aria-label={`Act ${i + 1} name`} maxLength={60} className={input} />
                  <input value={a.levels} onChange={(e) => setActs((xs) => xs.map((x, j) => (j === i ? { ...x, levels: e.target.value } : x)))} placeholder="Levels 1–5" aria-label={`Act ${i + 1} levels`} maxLength={20} className={input} />
                  <button type="button" onClick={() => setActs((xs) => xs.filter((_, j) => j !== i))} className="px-2 text-[0.9rem] text-mist hover:text-red-300">Remove</button>
                </div>
                <input value={a.summary} onChange={(e) => setActs((xs) => xs.map((x, j) => (j === i ? { ...x, summary: e.target.value } : x)))} placeholder="One line about it (shown on the Sessions page)" aria-label={`Act ${i + 1} summary`} maxLength={240} className={`${input} mt-2`} />
              </li>
            ))}
          </ul>
          {acts.length < 8 && (
            <button type="button" onClick={() => setActs((xs) => [...xs, { name: '', levels: '', summary: '' }])} className="btn-outline mt-3">Add an act</button>
          )}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <button type="submit" disabled={busy} className="btn-primary">{busy ? 'Saving…' : 'Save listing'}</button>
          {msg && <p role="status" className={msg.ok ? 'text-leaf-soft' : 'text-red-300'}>{msg.text}</p>}
        </div>
      </Block>
    </form>
  )
}

export function WaitingList({ watchers }: { watchers: { email: string; created_at: string; notified_at: string | null }[] }) {
  const waiting = watchers.filter((w) => !w.notified_at)
  const told = watchers.filter((w) => w.notified_at)
  return (
    <Block title="Waiting for a seat" intro="People who asked to hear when a seat opens. Each gets one email the moment one does.">
      {watchers.length === 0 ? (
        <p className="text-mist">Nobody yet. When the table is full, the card offers “Notify me when a seat opens”.</p>
      ) : (
        <>
          <ul className="divide-y divide-plum-line border-y border-plum-line">
            {waiting.map((w) => (
              <li key={w.email} className="flex justify-between gap-4 py-2.5 text-[0.95rem]">
                <a href={`mailto:${w.email}`} className="truncate text-prose hover:text-vellum">{w.email}</a>
                <span className="shrink-0 text-mist">waiting</span>
              </li>
            ))}
            {told.map((w) => (
              <li key={w.email} className="flex justify-between gap-4 py-2.5 text-[0.95rem]">
                <span className="truncate text-mist">{w.email}</span>
                <span className="shrink-0 text-mist">emailed {new Date(w.notified_at!).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
              </li>
            ))}
          </ul>
          {waiting.length > 0 && (
            <a href={`mailto:?bcc=${waiting.map((w) => w.email).join(',')}`} className="link-quiet mt-4 inline-block text-[0.92rem]">
              Email everyone waiting
            </a>
          )}
        </>
      )}
    </Block>
  )
}

/* ───────────────────────── Table safety ───────────────────────── */

function TagPicker({ value, onChange, suggestions, placeholder, label }: { value: string[]; onChange: (v: string[]) => void; suggestions: string[]; placeholder: string; label: string }) {
  const [draft, setDraft] = useState('')
  const add = (t: string) => {
    const v = t.trim()
    if (v && !value.some((x) => x.toLowerCase() === v.toLowerCase())) onChange([...value, v])
    setDraft('')
  }
  const rest = suggestions.filter((s) => !value.includes(s))
  return (
    <div>
      {value.length > 0 && (
        <ul className="mb-3 flex flex-wrap gap-2" aria-label={label}>
          {value.map((t) => (
            <li key={t}>
              <button type="button" onClick={() => onChange(value.filter((x) => x !== t))} className="inline-flex items-center gap-1.5 rounded-full border border-leaf/50 bg-leaf/10 px-3 py-1 text-[0.88rem] text-leaf-soft hover:border-red-300 hover:text-red-200" aria-label={`Remove ${t}`}>
                {t} <span aria-hidden="true">×</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              add(draft)
            }
          }}
          placeholder={placeholder}
          aria-label={placeholder}
          maxLength={140}
          className={input}
        />
        <button type="button" onClick={() => add(draft)} className="btn-outline shrink-0">Add</button>
      </div>
      {rest.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {rest.map((s) => (
            <button key={s} type="button" onClick={() => add(s)} className="rounded-full border border-plum-line px-2.5 py-0.5 text-[0.82rem] text-mist hover:border-amethyst hover:text-vellum">
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function SafetyForm({ c, notes }: { c: HubCampaign; notes: { id: string; kind: string; body: string; created_at: string }[] }) {
  const { api } = useHub()
  const router = useRouter()
  const [s, setS] = useState<Safety>({ rating: c.safety.rating ?? '', tools: c.safety.tools ?? [], content: c.safety.content ?? [], lines: c.safety.lines ?? [], veils: c.safety.veils ?? [], notes: c.safety.notes ?? '' })
  const [inbox, setInbox] = useState(notes)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  async function persist(next: Safety) {
    setBusy(true)
    setMsg(null)
    const res = await fetch(`${api}/campaign`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ safety: next }) })
    setBusy(false)
    if (!res.ok) return setMsg({ ok: false, text: (await res.json()).error ?? 'That didn’t save.' }), false
    setMsg({ ok: true, text: 'Saved. Players see it on the campaign overview.' })
    router.refresh()
    return true
  }

  async function resolve(id: string, add?: 'lines' | 'veils') {
    const note = inbox.find((n) => n.id === id)
    if (add && note) {
      const next = { ...s, [add]: Array.from(new Set([...(s[add] ?? []), note.body])) }
      setS(next)
      if (!(await persist(next))) return
    }
    await fetch(`${api}/safety/${id}`, { method: 'DELETE' })
    setInbox((xs) => xs.filter((n) => n.id !== id))
  }

  const toggleTool = (t: string) => setS((x) => ({ ...x, tools: x.tools?.includes(t) ? x.tools.filter((y) => y !== t) : [...(x.tools ?? []), t] }))

  return (
    <Block title="Table safety" intro="What the table agreed to. Players see this on the overview, and the rating, content and tools appear on the Sessions card.">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          persist(s)
        }}
        className="space-y-8"
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="s-rating" className="section-label block">Rating</label>
            <select id="s-rating" value={s.rating ?? ''} onChange={(e) => setS((x) => ({ ...x, rating: e.target.value }))} className={input}>
              <option value="">Not set</option>
              {RATINGS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
        </div>

        <fieldset>
          <legend className="section-label">Safety tools at this table</legend>
          <div className="flex flex-wrap gap-2">
            {SAFETY_TOOLS.map((t) => {
              const on = s.tools?.includes(t)
              return (
                <button key={t} type="button" aria-pressed={on} onClick={() => toggleTool(t)} className={`rounded-full border px-3.5 py-1.5 text-[0.9rem] transition-colors ${on ? 'border-leaf bg-leaf/15 text-leaf-soft' : 'border-plum-line text-prose hover:border-amethyst'}`}>
                  {on ? '✓ ' : ''}
                  {t}
                </button>
              )
            })}
          </div>
        </fieldset>

        <div>
          <p className="section-label">Content that may come up</p>
          <TagPicker label="Content" value={s.content ?? []} onChange={(v) => setS((x) => ({ ...x, content: v }))} suggestions={CONTENT_SUGGESTIONS} placeholder="Add a theme" />
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <p className="section-label">Lines: never in the game</p>
            <TagPicker label="Lines" value={s.lines ?? []} onChange={(v) => setS((x) => ({ ...x, lines: v }))} suggestions={[]} placeholder="Add a line" />
          </div>
          <div>
            <p className="section-label">Veils: happen off-screen only</p>
            <TagPicker label="Veils" value={s.veils ?? []} onChange={(v) => setS((x) => ({ ...x, veils: v }))} suggestions={[]} placeholder="Add a veil" />
          </div>
        </div>

        <div>
          <label htmlFor="s-notes" className="section-label block">Anything else players should know</label>
          <textarea id="s-notes" rows={3} maxLength={1000} value={s.notes ?? ''} onChange={(e) => setS((x) => ({ ...x, notes: e.target.value }))} placeholder="Tap the X-card in Discord with :x:, anyone can pause the game, we check in after heavy scenes…" className={`${input} resize-y`} />
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button type="submit" disabled={busy} className="btn-primary">{busy ? 'Saving…' : 'Save table safety'}</button>
          {msg && <p role="status" className={msg.ok ? 'text-leaf-soft' : 'text-red-300'}>{msg.text}</p>}
        </div>
      </form>

      <div className="mt-10 rounded-2xl border border-plum-line bg-night/40 p-5">
        <h3 className="font-cinzel text-[1.1rem] font-bold text-vellum">From your players</h3>
        <p className="mt-1 text-[0.9rem] text-mist">Lines and veils sent from the overview. They arrive without a name, so nobody has to explain themselves.</p>
        {inbox.length === 0 ? (
          <p className="mt-4 text-[0.95rem] text-mist">Nothing waiting.</p>
        ) : (
          <ul className="mt-4 divide-y divide-plum-line border-y border-plum-line">
            {inbox.map((n) => (
              <li key={n.id} className="py-3">
                <p className="text-[0.8rem] text-ember">{n.kind === 'line' ? 'Suggested line' : n.kind === 'veil' ? 'Suggested veil' : 'Note'}</p>
                <p className="whitespace-pre-line text-prose">{n.body}</p>
                <div className="mt-2 flex flex-wrap gap-4 text-[0.88rem]">
                  <button type="button" onClick={() => resolve(n.id, 'lines')} className="text-leaf-soft hover:text-vellum">Add to lines</button>
                  <button type="button" onClick={() => resolve(n.id, 'veils')} className="text-leaf-soft hover:text-vellum">Add to veils</button>
                  <button type="button" onClick={() => resolve(n.id)} className="text-mist hover:text-vellum">Dismiss</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Block>
  )
}
