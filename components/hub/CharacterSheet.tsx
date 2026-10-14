'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useHub } from './HubContext'
import CharacterForm from './CharacterForm'
import { hpTone } from './CharacterCard'
import type { Player, PlayerFieldSecrecy } from '@/lib/hub/types'
import type { VisiblePlayerData } from '@/lib/hub/getVisiblePlayerFields'

const STATS = [
  ['stat_strength', 'Strength'],
  ['stat_dexterity', 'Dexterity'],
  ['stat_constitution', 'Constitution'],
  ['stat_intelligence', 'Intelligence'],
  ['stat_wisdom', 'Wisdom'],
  ['stat_charisma', 'Charisma'],
] as const

const mod = (n: number) => {
  const m = Math.floor((n - 10) / 2)
  return m >= 0 ? `+${m}` : `${m}`
}

export default function CharacterSheet({
  p,
  full,
  secrecy,
  playedBy,
}: {
  p: VisiblePlayerData
  /** Full row, when the viewer may edit (GM or the character's player) */
  full?: Player
  secrecy: PlayerFieldSecrecy[]
  playedBy: string | null
}) {
  const { api, base, gm, userId } = useHub()
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [note, setNote] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const canEdit = !!full && (gm || p.user_id === userId)
  const hasHp = typeof p.hp_current === 'number' && typeof p.hp_max === 'number' && p.hp_max > 0
  const pct = hasHp ? Math.max(0, Math.min(1, (p.hp_current as number) / (p.hp_max as number))) : 0
  const stats = STATS.filter(([k]) => typeof p[k] === 'number')

  async function sync() {
    setSyncing(true)
    setNote(null)
    const res = await fetch(`${api}/players/${p.id}/sync`, { method: 'POST' })
    const j = await res.json()
    setSyncing(false)
    setNote(res.ok ? 'Updated from D&D Beyond.' : j.error)
    router.refresh()
  }

  async function remove() {
    const res = await fetch(`${api}/players/${p.id}`, { method: 'DELETE' })
    if (res.ok) {
      router.push(`${base}/party`)
      router.refresh()
    }
  }

  if (editing && full) {
    return (
      <div>
        <Link href={`${base}/party`} className="text-[0.92rem] text-mist hover:text-vellum">← The party</Link>
        <h1 className="mt-3 font-cinzel text-[2rem] font-bold text-vellum">Edit {p.name}</h1>
        <div className="mt-8">
          <CharacterForm mode="edit" player={full} secrecy={secrecy} onDone={() => setEditing(false)} />
        </div>
      </div>
    )
  }

  return (
    <div>
      <Link href={`${base}/party`} className="text-[0.92rem] text-mist hover:text-vellum">← The party</Link>

      <div className="mt-6 grid gap-8 md:grid-cols-[minmax(0,18rem)_1fr] md:gap-12">
        <div className="relative aspect-square overflow-hidden rounded-2xl border border-umber-line bg-gradient-to-br from-umber-line via-umber to-plum">
          {p.portrait_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.portrait_url} alt={`Portrait of ${p.name}`} className="h-full w-full object-cover" />
          ) : (
            <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center font-cinzel text-[5rem] font-bold text-vellum/15">
              {p.name.charAt(0)}
            </span>
          )}
        </div>

        <div className="min-w-0">
          <p className="text-[0.9rem] text-ember">{playedBy ? `Played by ${playedBy}` : 'Character'}</p>
          <h1 className="mt-1 font-cinzel text-[2.4rem] font-bold leading-[1.1] text-vellum">{p.name}</h1>
          <p className="mt-2 text-[1.1rem] text-prose">
            {[p.level ? `Level ${p.level}` : null, p.race, p.class].filter(Boolean).join(' · ')}
          </p>
          {p.background && <p className="text-mist">{p.background}</p>}

          {hasHp && (
            <div className="mt-6 max-w-sm">
              <div className="flex items-baseline justify-between text-[0.9rem] text-mist">
                <span>Hit points</span>
                <span className="tabular-nums text-vellum">
                  {p.hp_current} / {p.hp_max}
                </span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-plum">
                <div className={`h-full rounded-full ${hpTone(pct)}`} style={{ width: `${pct * 100}%` }} />
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {canEdit && (
              <button type="button" onClick={() => setEditing(true)} className="btn-primary">Edit</button>
            )}
            {p.ddb_character_id && (
              <a href={`https://www.dndbeyond.com/characters/${p.ddb_character_id}`} target="_blank" rel="noopener noreferrer" className="btn-outline">
                Open in D&amp;D Beyond
              </a>
            )}
            {canEdit && p.ddb_character_id && (
              <button type="button" onClick={sync} disabled={syncing} className="text-[0.92rem] text-mist underline decoration-mist/40 underline-offset-[0.3em] hover:text-vellum disabled:opacity-60">
                {syncing ? 'Syncing…' : 'Sync now'}
              </button>
            )}
          </div>
          {(note || p.ddb_error) && (
            <p role="status" className={`mt-3 text-[0.92rem] ${note === 'Updated from D&D Beyond.' ? 'text-leaf-soft' : 'text-red-300'}`}>
              {note ?? p.ddb_error}
            </p>
          )}
        </div>
      </div>

      {stats.length > 0 && (
        <ul className="mt-12 grid grid-cols-3 gap-3 sm:grid-cols-6">
          {stats.map(([k, label]) => (
            <li key={k} className="rounded-xl border border-plum-line bg-plum px-2 py-4 text-center">
              <p className="text-[0.78rem] text-mist">{label}</p>
              <p className="mt-1 font-cinzel text-[1.6rem] font-bold leading-none text-vellum">{mod(p[k] as number)}</p>
              <p className="mt-1 text-[0.85rem] tabular-nums text-mist">{p[k]}</p>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        {p.public_notes && (
          <section>
            <h2 className="font-cinzel text-[1.25rem] font-bold text-vellum">Notes</h2>
            <p className="mt-3 whitespace-pre-line leading-relaxed text-prose">{p.public_notes}</p>
          </section>
        )}
        {gm && p.secret_notes && (
          <section className="rounded-2xl border border-ember/30 bg-umber/60 p-5">
            <h2 className="font-cinzel text-[1.1rem] font-bold text-ember">GM notes</h2>
            <p className="mt-2 whitespace-pre-line leading-relaxed text-prose">{p.secret_notes}</p>
          </section>
        )}
      </div>

      {gm && (
        <div className="mt-16 border-t border-plum-line pt-6">
          {confirmDelete ? (
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-prose">Remove {p.name} from the party? Quest and achievement links to them go too.</span>
              <button type="button" onClick={remove} className="rounded-full bg-red-800 px-4 py-2 text-[0.78rem] font-bold text-vellum hover:bg-red-700">Remove</button>
              <button type="button" onClick={() => setConfirmDelete(false)} className="text-mist hover:text-vellum">Keep</button>
            </div>
          ) : (
            <button type="button" onClick={() => setConfirmDelete(true)} className="text-[0.9rem] text-mist hover:text-red-300">Remove this character</button>
          )}
        </div>
      )}
    </div>
  )
}
