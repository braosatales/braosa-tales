'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useHub } from './HubContext'
import type { HubCampaign } from '@/lib/hub/server'

export type ManageSession = {
  id: string
  session_number: number | null
  title: string | null
  starts_at: string
  ends_at: string
  status: 'scheduled' | 'played' | 'cancelled'
}
export type ManageMessage = {
  id: string
  session_id: string | null
  kind: 'post_session' | 'confirm_3d' | 'final_24h' | 'announcement'
  send_at: string
  expires_at: string | null
  draft_content: string | null
  status: 'draft' | 'approved' | 'sending' | 'sent' | 'skipped' | 'cancelled' | 'failed'
  sent_at: string | null
  sent_content: string | null
  used_fallback: boolean
  last_error: string | null
}

const input =
  'w-full rounded-lg border border-plum-line bg-night px-3.5 py-2.5 text-prose placeholder:text-mist/40 focus:border-leaf focus:outline-none'

const KIND_LABEL: Record<ManageMessage['kind'], string> = {
  confirm_3d: '3 days before',
  final_24h: '24 hours before',
  post_session: 'After the session',
  announcement: 'Announcement',
}
const KIND_ORDER: ManageMessage['kind'][] = ['confirm_3d', 'final_24h', 'post_session']

const STATUS_STYLE: Record<ManageMessage['status'], string> = {
  draft: 'border-plum-line text-mist',
  approved: 'border-leaf/60 text-leaf-soft',
  sending: 'border-amethyst text-vellum',
  sent: 'border-leaf bg-leaf/15 text-leaf-soft',
  skipped: 'border-plum-line text-mist/70',
  cancelled: 'border-plum-line text-mist/70',
  failed: 'border-red-400/60 text-red-300',
}

const fmt = (iso: string) =>
  new Date(iso).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

/** Local "YYYY-MM-DDTHH:mm" for a datetime-local input. */
function toLocalInput(d: Date) {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
}

function Block({ id, title, intro, children }: { id?: string; title: string; intro?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-40 border-t border-plum-line py-10">
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

function Status({ text, ok }: { text: string; ok: boolean }) {
  return <p role="status" className={ok ? 'text-leaf-soft' : 'text-red-300'}>{text}</p>
}

/* ───────────────────────── Settings ───────────────────────── */

export function DiscordSettings({ c }: { c: HubCampaign }) {
  const { api } = useHub()
  const router = useRouter()
  const [f, setF] = useState({
    discord_channel_id: c.discord_channel_id ?? '',
    discord_language: c.discord_language,
    confirm_3d: c.discord_templates.confirm_3d ?? '',
    final_24h: c.discord_templates.final_24h ?? '',
  })
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF((x) => ({ ...x, [k]: e.target.value }))

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setMsg(null)
    const res = await fetch(`${api}/campaign`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        discord_channel_id: f.discord_channel_id,
        discord_language: f.discord_language,
        discord_templates: { confirm_3d: f.confirm_3d, final_24h: f.final_24h },
      }),
    })
    const j = await res.json()
    setBusy(false)
    if (!res.ok) return setMsg({ ok: false, text: j.error ?? 'That didn’t save.' })
    setMsg({ ok: true, text: 'Saved.' })
    router.refresh()
  }

  return (
    <form onSubmit={save}>
      <Block
        id="discord"
        title="Discord"
        intro="Where Vôr posts this table’s reminders, and the fixed texts that go out when you haven’t approved a draft in time."
      >
        <div className="grid gap-4 sm:grid-cols-[1fr_10rem]">
          <div>
            <label htmlFor="d-ch" className="section-label block">Channel id</label>
            <input id="d-ch" value={f.discord_channel_id} onChange={set('discord_channel_id')} inputMode="numeric" placeholder="Right-click the channel → Copy Channel ID" className={input} />
          </div>
          <div>
            <label htmlFor="d-lang" className="section-label block">Language</label>
            <select id="d-lang" value={f.discord_language} onChange={set('discord_language')} className={input}>
              <option value="en">English</option>
              <option value="pt">Português</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="d-3d" className="section-label block">Fixed text, 3 days before</label>
            <textarea id="d-3d" rows={3} maxLength={1500} value={f.confirm_3d} onChange={set('confirm_3d')} className={`${input} resize-y`} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="d-24" className="section-label block">Fixed text, 24 hours before</label>
            <textarea id="d-24" rows={3} maxLength={1500} value={f.final_24h} onChange={set('final_24h')} className={`${input} resize-y`} />
          </div>
        </div>
        <p className="mt-3 text-[0.88rem] text-mist">
          You can use <code>{'{campaign}'}</code>, <code>{'{session}'}</code>, <code>{'{when}'}</code> (date and time, in each player’s own timezone) and <code>{'{in}'}</code> (“in 3 days”), in these and in drafts.
        </p>
        <div className="mt-6 flex items-center gap-4">
          <button type="submit" disabled={busy} className="btn-primary">{busy ? 'Saving…' : 'Save Discord settings'}</button>
          {msg && <Status {...msg} />}
        </div>
      </Block>
    </form>
  )
}

/* ───────────────────────── Sessions and their messages ───────────────────────── */

function MessageRow({ m, fallback }: { m: ManageMessage; fallback?: string }) {
  const { api } = useHub()
  const router = useRouter()
  const [text, setText] = useState(m.draft_content ?? '')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const editable = m.status === 'draft' || m.status === 'approved'
  const changed = text.trim() !== (m.draft_content ?? '')

  async function save(approved: boolean) {
    setBusy(true)
    setMsg(null)
    const res = await fetch(`${api}/discord/${m.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ draft_content: text, approved }),
    })
    const j = await res.json()
    setBusy(false)
    if (!res.ok) return setMsg({ ok: false, text: j.error ?? 'That didn’t save.' })
    setMsg({ ok: true, text: approved ? 'Approved. Vôr posts it on time.' : 'Saved as a draft.' })
    router.refresh()
  }

  const rule =
    m.kind === 'post_session'
      ? 'Only goes out once you approve it. Skipped if not approved within 24 hours of the end.'
      : 'If you don’t approve a draft, the fixed text goes out.'

  return (
    <li className="py-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-semibold text-vellum">
          {KIND_LABEL[m.kind]} <span className="font-normal text-mist">· {fmt(m.send_at)}</span>
        </p>
        <span className={`rounded-full border px-2.5 py-0.5 text-[0.8rem] ${STATUS_STYLE[m.status]}`}>
          {m.status === 'sent' && m.used_fallback ? 'sent (fixed text)' : m.status}
        </span>
      </div>

      {m.status === 'sent' ? (
        <p className="mt-2 whitespace-pre-wrap rounded-lg border border-plum-line bg-night/50 px-3.5 py-2.5 text-[0.95rem] text-prose">{m.sent_content}</p>
      ) : editable ? (
        <>
          <p className="mt-1 text-[0.85rem] text-mist">{rule}</p>
          <textarea
            rows={m.kind === 'post_session' ? 6 : 3}
            maxLength={1900}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={fallback ? `Fixed text if left empty: ${fallback}` : 'What Vôr should say after the session.'}
            aria-label={`${KIND_LABEL[m.kind]} message`}
            className={`${input} mt-2 resize-y`}
          />
          <div className="mt-2 flex flex-wrap items-center gap-3">
            {m.status === 'approved' && !changed ? (
              <button type="button" disabled={busy} onClick={() => save(false)} className="btn-outline">Take back approval</button>
            ) : (
              <button type="button" disabled={busy || !text.trim()} onClick={() => save(true)} className="btn-primary">
                {m.status === 'approved' ? 'Approve changes' : 'Approve'}
              </button>
            )}
            {changed && (
              <button type="button" disabled={busy} onClick={() => save(false)} className="link-quiet text-[0.92rem]">Save as draft</button>
            )}
            <span className="text-[0.82rem] text-mist">{text.length}/1900</span>
            {msg && <Status {...msg} />}
          </div>
        </>
      ) : (
        <p className="mt-1 text-[0.88rem] text-mist">{m.last_error ?? (m.status === 'cancelled' ? 'Session cancelled.' : '')}</p>
      )}
      {m.status === 'failed' && m.last_error && <p className="mt-1 text-[0.88rem] text-red-300">{m.last_error}</p>}
    </li>
  )
}

function SessionCard({ s, messages, c }: { s: ManageSession; messages: ManageMessage[]; c: HubCampaign }) {
  const { api } = useHub()
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function patch(body: Record<string, unknown>) {
    setBusy(true)
    setErr(null)
    const res = await fetch(`${api}/sessions/${s.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const j = await res.json()
    setBusy(false)
    if (!res.ok) return setErr(j.error ?? 'That didn’t save.')
    router.refresh()
  }

  const byKind = new Map(messages.map((m) => [m.kind, m]))
  const label = [s.session_number ? `Session ${s.session_number}` : 'Session', s.title].filter(Boolean).join(' · ')

  return (
    <li className={`rounded-xl border border-plum-line bg-night/40 px-5 py-4 ${s.status === 'cancelled' ? 'opacity-60' : ''}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="font-cinzel text-[1.05rem] font-bold text-vellum">{label}</p>
          <p className="text-[0.92rem] text-mist">
            {fmt(s.starts_at)} – {new Date(s.ends_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
            {s.status !== 'scheduled' && <span className="ml-2 uppercase tracking-wide">· {s.status}</span>}
          </p>
        </div>
        <div className="flex gap-3 text-[0.9rem]">
          {s.status === 'cancelled' ? (
            <button type="button" disabled={busy} onClick={() => patch({ status: 'scheduled' })} className="link-quiet">Restore</button>
          ) : (
            <>
              {s.status === 'scheduled' && new Date(s.ends_at) < new Date() && (
                <button type="button" disabled={busy} onClick={() => patch({ status: 'played' })} className="link-quiet">Mark played</button>
              )}
              <button
                type="button"
                disabled={busy}
                onClick={() => confirm('Cancel this session? Its unsent Discord messages are cancelled too.') && patch({ status: 'cancelled' })}
                className="text-mist hover:text-red-300"
              >
                Cancel session
              </button>
            </>
          )}
        </div>
      </div>
      {err && <p className="mt-2 text-red-300">{err}</p>}
      <ul className="mt-2 divide-y divide-plum-line">
        {KIND_ORDER.map((k) => {
          const m = byKind.get(k)
          return m ? <MessageRow key={m.id} m={m} fallback={k === 'post_session' ? undefined : c.discord_templates[k as 'confirm_3d' | 'final_24h']} /> : null
        })}
      </ul>
    </li>
  )
}

function NewSession({ nextNumber, defaultHours }: { nextNumber: number; defaultHours: number }) {
  const { api } = useHub()
  const router = useRouter()
  const [start, setStart] = useState('')
  const [hours, setHours] = useState(String(defaultHours))
  const [num, setNum] = useState(String(nextNumber))
  const [title, setTitle] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  async function add(e: React.FormEvent) {
    e.preventDefault()
    const s = new Date(start)
    const h = Number(hours)
    if (isNaN(s.getTime()) || !(h > 0)) return setMsg({ ok: false, text: 'Pick a start time and a length.' })
    setBusy(true)
    setMsg(null)
    const res = await fetch(`${api}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ starts_at: s.toISOString(), ends_at: new Date(s.getTime() + h * 3600 * 1000).toISOString(), session_number: num, title }),
    })
    const j = await res.json()
    setBusy(false)
    if (!res.ok) return setMsg({ ok: false, text: j.error ?? 'That didn’t save.' })
    setStart('')
    setTitle('')
    setMsg({ ok: true, text: 'Scheduled. Its three Discord messages are below.' })
    router.refresh()
  }

  return (
    <form onSubmit={add} className="grid gap-3 rounded-xl border border-dashed border-plum-line px-5 py-4 sm:grid-cols-[1fr_6rem_6rem]">
      <div>
        <label htmlFor="n-start" className="section-label block">Starts (your time)</label>
        <input id="n-start" type="datetime-local" required min={toLocalInput(new Date())} value={start} onChange={(e) => setStart(e.target.value)} className={input} />
      </div>
      <div>
        <label htmlFor="n-hours" className="section-label block">Hours</label>
        <input id="n-hours" type="number" min={0.5} max={12} step={0.5} value={hours} onChange={(e) => setHours(e.target.value)} className={input} />
      </div>
      <div>
        <label htmlFor="n-num" className="section-label block">Session</label>
        <input id="n-num" type="number" min={1} value={num} onChange={(e) => setNum(e.target.value)} className={input} />
      </div>
      <div className="sm:col-span-3">
        <label htmlFor="n-title" className="section-label block">Title (optional, only you see it)</label>
        <input id="n-title" maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Cragmaw Castle" className={input} />
      </div>
      <div className="flex items-center gap-4 sm:col-span-3">
        <button type="submit" disabled={busy} className="btn-primary">{busy ? 'Scheduling…' : 'Schedule session'}</button>
        {msg && <Status {...msg} />}
      </div>
    </form>
  )
}

export function DiscordSessions({ c, sessions, messages }: { c: HubCampaign; sessions: ManageSession[]; messages: ManageMessage[] }) {
  const nextNumber = Math.max(c.sessions_played ?? 0, ...sessions.map((s) => s.session_number ?? 0)) + 1
  const hours = parseFloat(c.session_length ?? '') || 3
  const waiting = messages.filter((m) => m.kind === 'post_session' && m.status === 'draft' && new Date(m.send_at) <= new Date())
  return (
    <Block
      id="sessions"
      title="Sessions"
      intro="Schedule each session and Vôr reminds the table 3 days and 24 hours before, then posts your after-session message once you approve it."
    >
      {!c.discord_channel_id && <p className="mb-4 text-red-300">Set the Discord channel above first, or nothing will go out.</p>}
      {waiting.length > 0 && (
        <p className="mb-4 rounded-lg border border-leaf/50 bg-leaf/10 px-4 py-2.5 text-leaf-soft">
          {waiting.length === 1 ? 'An after-session message is' : `${waiting.length} after-session messages are`} waiting for your approval.
        </p>
      )}
      <NewSession nextNumber={nextNumber} defaultHours={hours} />
      {sessions.length > 0 ? (
        <ul className="mt-6 space-y-4">
          {sessions.map((s) => (
            <SessionCard key={s.id} s={s} c={c} messages={messages.filter((m) => m.session_id === s.id)} />
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-mist">No sessions scheduled.</p>
      )}
    </Block>
  )
}
