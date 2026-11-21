'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useHub } from './HubContext'
import type { HubCampaign } from '@/lib/hub/server'

const input =
  'w-full rounded-lg border border-plum-line bg-night px-3.5 py-2.5 text-prose placeholder:text-mist/40 focus:border-leaf focus:outline-none'

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
        intro="Where Vôr posts this table’s reminders, and the fixed texts that go out when you haven’t approved a draft in time. Sessions come from StartPlaying; drafts are approved in Clot."
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
