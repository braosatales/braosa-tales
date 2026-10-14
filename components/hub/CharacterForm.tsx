'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useHub } from './HubContext'
import Toggle from './Toggle'
import type { Player, PlayerFieldSecrecy } from '@/lib/hub/types'

export const VISIBILITY_FIELDS = [
  ['portrait', 'Portrait'],
  ['level', 'Level'],
  ['class', 'Class'],
  ['race', 'Species'],
  ['background', 'Background'],
  ['hp', 'Hit points'],
  ['stats', 'Ability scores'],
] as const

const STATS = [
  ['stat_strength', 'STR'],
  ['stat_dexterity', 'DEX'],
  ['stat_constitution', 'CON'],
  ['stat_intelligence', 'INT'],
  ['stat_wisdom', 'WIS'],
  ['stat_charisma', 'CHA'],
] as const

type Form = Record<string, string>

const input =
  'w-full rounded-lg border border-plum-line bg-night px-3.5 py-2.5 text-prose placeholder:text-mist/40 focus:border-leaf focus:outline-none'

function toForm(p?: Partial<Player>): Form {
  const s = (v: unknown) => (v === null || v === undefined ? '' : String(v))
  return {
    ddb: p?.ddb_character_id ? `https://www.dndbeyond.com/characters/${p.ddb_character_id}` : '',
    user_id: s(p?.user_id),
    name: s(p?.name),
    portrait_url: s(p?.portrait_url),
    level: s(p?.level),
    class: s(p?.class),
    race: s(p?.race),
    background: s(p?.background),
    hp_current: s(p?.hp_current),
    hp_max: s(p?.hp_max),
    ...Object.fromEntries(STATS.map(([k]) => [k, s(p?.[k])])),
    public_notes: s(p?.public_notes),
    secret_notes: s(p?.secret_notes),
  }
}

const num = (v: string) => (v.trim() === '' || isNaN(Number(v)) ? null : Math.round(Number(v)))

/**
 * Add or edit a character. With a D&D Beyond link the sheet fills itself in;
 * without one, everything can be typed by hand.
 */
export default function CharacterForm({
  mode,
  player,
  secrecy = [],
  onDone,
}: {
  mode: 'new' | 'edit'
  player?: Player
  secrecy?: PlayerFieldSecrecy[]
  onDone?: () => void
}) {
  const { api, base, gm, members, userId } = useHub()
  const router = useRouter()
  const [f, setF] = useState<Form>(() => toForm(mode === 'new' ? { user_id: gm ? null : userId } : player))
  const [manual, setManual] = useState(mode === 'edit' && !player?.ddb_character_id)
  const [hidden, setHidden] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(VISIBILITY_FIELDS.map(([k]) => [k, secrecy.find((r) => r.field_name === k)?.is_secret ?? false]))
  )
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF((x) => ({ ...x, [k]: e.target.value }))
  const linked = !!f.ddb.trim()

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('path', 'portraits/players')
    const res = await fetch(`${api}/upload-image`, { method: 'POST', body: fd })
    const j = await res.json()
    setUploading(false)
    if (!res.ok) return setErr(j.error ?? 'Upload failed')
    setF((x) => ({ ...x, portrait_url: j.url }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    if (!linked && !f.name.trim()) return setErr('Give the character a name, or paste a D&D Beyond link.')
    setBusy(true)
    const body: Record<string, unknown> = { ddb: f.ddb.trim() || null }
    if (gm) body.user_id = f.user_id || null
    if (manual || !linked) {
      Object.assign(body, {
        name: f.name,
        portrait_url: f.portrait_url,
        level: num(f.level),
        class: f.class,
        race: f.race,
        background: f.background,
        hp_current: num(f.hp_current),
        hp_max: num(f.hp_max),
        ...Object.fromEntries(STATS.map(([k]) => [k, num(f[k])])),
      })
    } else if (f.portrait_url !== (player?.portrait_url ?? '')) {
      body.portrait_url = f.portrait_url
    }
    body.public_notes = f.public_notes
    if (gm) body.secret_notes = f.secret_notes

    const res = await fetch(mode === 'new' ? `${api}/players` : `${api}/players/${player!.id}`, {
      method: mode === 'new' ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const j = await res.json()
    if (!res.ok) {
      setBusy(false)
      return setErr(j.error ?? 'That didn’t save. Try again.')
    }
    if (gm) {
      await fetch(`${api}/players/${j.id}/secrecy`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ secrecy: hidden }) })
    }
    setBusy(false)
    if (mode === 'new') router.push(`${base}/party/${j.id}`)
    else onDone?.()
    router.refresh()
  }

  return (
    <form onSubmit={submit} className="space-y-8">
      <fieldset className="space-y-3">
        <legend className="font-cinzel text-[1.15rem] font-bold text-vellum">D&amp;D Beyond</legend>
        <p className="max-w-measure text-[0.95rem] leading-relaxed text-mist">
          Paste the character’s link and we’ll keep name, species, class, level, hit points and ability scores up to date. In D&amp;D Beyond, set the
          character’s privacy to <span className="text-prose">Public</span> first.
        </p>
        <input value={f.ddb} onChange={set('ddb')} placeholder="https://www.dndbeyond.com/characters/123456789" className={input} inputMode="url" aria-label="D&D Beyond character link" />
      </fieldset>

      {gm && (
        <div className="max-w-md">
          <label htmlFor="played-by" className="section-label block">Played by</label>
          <select id="played-by" value={f.user_id} onChange={set('user_id')} className={input}>
            <option value="">Nobody yet (or a GM character)</option>
            {members.map((m) => (
              <option key={m.user_id} value={m.user_id}>
                {m.name || m.email || 'Unnamed'}
                {m.role === 'gm' ? ' (GM)' : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      {linked && !manual ? (
        <button type="button" onClick={() => setManual(true)} className="text-[0.92rem] text-mist underline decoration-mist/40 underline-offset-[0.3em] hover:text-vellum">
          Edit the details by hand instead
        </button>
      ) : (
        <fieldset className="space-y-5">
          <legend className="font-cinzel text-[1.15rem] font-bold text-vellum">{linked ? 'Details' : 'Or fill it in by hand'}</legend>
          {linked && <p className="text-[0.9rem] text-ember">These are replaced by D&amp;D Beyond on the next sync, about every 30 minutes.</p>}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="section-label block" htmlFor="c-name">Name</label>
              <input id="c-name" value={f.name} onChange={set('name')} className={input} />
            </div>
            <div className="grid grid-cols-[5rem_1fr] gap-3">
              <div>
                <label className="section-label block" htmlFor="c-level">Level</label>
                <input id="c-level" type="number" min={1} max={30} value={f.level} onChange={set('level')} className={input} />
              </div>
              <div>
                <label className="section-label block" htmlFor="c-race">Species</label>
                <input id="c-race" value={f.race} onChange={set('race')} placeholder="Wood Elf" className={input} />
              </div>
            </div>
            <div>
              <label className="section-label block" htmlFor="c-class">Class</label>
              <input id="c-class" value={f.class} onChange={set('class')} placeholder="Ranger (Gloom Stalker)" className={input} />
            </div>
            <div>
              <label className="section-label block" htmlFor="c-bg">Background</label>
              <input id="c-bg" value={f.background} onChange={set('background')} placeholder="Outlander" className={input} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="section-label block" htmlFor="c-hp">HP now</label>
                <input id="c-hp" type="number" value={f.hp_current} onChange={set('hp_current')} className={input} />
              </div>
              <div>
                <label className="section-label block" htmlFor="c-hpmax">HP max</label>
                <input id="c-hpmax" type="number" value={f.hp_max} onChange={set('hp_max')} className={input} />
              </div>
            </div>
          </div>
          <div>
            <p className="section-label">Ability scores</p>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
              {STATS.map(([k, label]) => (
                <label key={k} className="block text-center">
                  <span className="mb-1 block text-[0.78rem] text-mist">{label}</span>
                  <input type="number" min={1} max={30} value={f[k]} onChange={set(k)} className={`${input} text-center tabular-nums`} aria-label={label} />
                </label>
              ))}
            </div>
          </div>
        </fieldset>
      )}

      <div>
        <p className="section-label">Portrait</p>
        <div className="flex flex-wrap items-center gap-4">
          {f.portrait_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={f.portrait_url} alt="" className="h-20 w-20 rounded-xl border border-plum-line object-cover" />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-dashed border-plum-line text-[0.75rem] text-mist">
              {linked ? 'From D&D Beyond' : 'None'}
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={upload} aria-label="Upload a portrait" />
          <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="btn-outline">
            {uploading ? 'Uploading…' : 'Upload a portrait'}
          </button>
          {f.portrait_url && (
            <button type="button" onClick={() => setF((x) => ({ ...x, portrait_url: '' }))} className="text-[0.9rem] text-mist hover:text-vellum">
              Remove
            </button>
          )}
        </div>
        <p className="mt-2 text-[0.85rem] text-mist">An uploaded portrait wins over the D&amp;D Beyond one.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <label htmlFor="c-notes" className="section-label block">Notes everyone can read</label>
          <textarea id="c-notes" rows={4} value={f.public_notes} onChange={set('public_notes')} placeholder="Appearance, a quote, what the party knows about them." className={`${input} resize-y`} />
        </div>
        {gm && (
          <div>
            <label htmlFor="c-gm" className="section-label block text-ember">GM notes (only you)</label>
            <textarea id="c-gm" rows={4} value={f.secret_notes} onChange={set('secret_notes')} className={`${input} resize-y`} />
          </div>
        )}
      </div>

      {gm && (
        <fieldset>
          <legend className="section-label">Hide from the other players</legend>
          <ul className="max-w-md divide-y divide-plum-line rounded-xl border border-plum-line bg-night/60 px-4">
            {VISIBILITY_FIELDS.map(([k, label]) => (
              <li key={k} className="flex items-center justify-between py-2.5">
                <span className="text-[0.95rem] text-prose">{label}</span>
                <span className="flex items-center gap-3">
                  <span className="text-[0.8rem] text-mist">{hidden[k] ? 'Hidden' : 'Shown'}</span>
                  <Toggle checked={hidden[k]} onChange={(v) => setHidden((h) => ({ ...h, [k]: v }))} label={`Hide ${label}`} />
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[0.85rem] text-mist">The character’s own player always sees their whole sheet.</p>
        </fieldset>
      )}

      {err && <p role="alert" className="text-red-300">{err}</p>}
      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={busy} className="btn-primary">
          {busy ? (linked ? 'Reading D&D Beyond…' : 'Saving…') : mode === 'new' ? 'Add to the party' : 'Save'}
        </button>
        {onDone && (
          <button type="button" onClick={onDone} className="btn-outline">Cancel</button>
        )}
      </div>
    </form>
  )
}
