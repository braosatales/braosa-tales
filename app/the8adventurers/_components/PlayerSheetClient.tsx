'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Player, PlayerFieldSecrecy } from '@/lib/the8adventurers/types'
import type { VisiblePlayerData } from '@/lib/the8adventurers/getVisiblePlayerFields'
import Toggle from '@/components/the8adventurers/Toggle'

type Props = {
  player: VisiblePlayerData
  secrecyRows: PlayerFieldSecrecy[]
  isAdmin: boolean
  fullPlayer?: Player // only passed when isAdmin
}

const TOGGLABLE_FIELDS = [
  'portrait', 'level', 'class', 'race', 'background', 'hp', 'stats',
] as const
type TogglableField = typeof TOGGLABLE_FIELDS[number]

const FIELD_LABELS: Record<TogglableField, string> = {
  portrait: 'Portrait',
  level: 'Level',
  class: 'Class',
  race: 'Race',
  background: 'Background',
  hp: 'Hit Points',
  stats: 'Ability Scores',
}

const STAT_KEYS: Array<{ key: keyof Player; label: string }> = [
  { key: 'stat_strength', label: 'STR' },
  { key: 'stat_dexterity', label: 'DEX' },
  { key: 'stat_constitution', label: 'CON' },
  { key: 'stat_intelligence', label: 'INT' },
  { key: 'stat_wisdom', label: 'WIS' },
  { key: 'stat_charisma', label: 'CHA' },
]

function modifier(score: number): string {
  const mod = Math.floor((score - 10) / 2)
  return mod >= 0 ? `+${mod}` : `${mod}`
}

function StatBlock({ player }: { player: VisiblePlayerData | Player }) {
  const hasStats = 'stat_strength' in player
  if (!hasStats) return null

  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mt-4">
      {STAT_KEYS.map(({ key, label }) => {
        const val = (player as Record<string, unknown>)[key] as number | null
        if (val === null || val === undefined) return null
        return (
          <div key={key} className="dark-card text-center py-3">
            <p className="section-label text-center mb-1">{label}</p>
            <p className="font-cinzel text-brand-parchment font-bold text-xl">{val}</p>
            <p className="font-fell text-brand-muted text-xs">{modifier(val)}</p>
          </div>
        )
      })}
    </div>
  )
}

function HpBar({ current, max }: { current: number; max: number }) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (current / max) * 100)) : 0
  const color = pct > 60 ? 'bg-green-500' : pct > 30 ? 'bg-brand-gold-400' : 'bg-red-500'

  return (
    <div className="space-y-1">
      <div className="flex justify-between font-fell text-sm text-brand-parchment">
        <span>HP</span>
        <span>{current} / {max}</span>
      </div>
      <div className="bg-brand-border rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

type EditFormState = {
  name: string
  portrait_url: string
  clerk_user_id: string
  level: string
  class: string
  race: string
  background: string
  hp_current: string
  hp_max: string
  stat_strength: string
  stat_dexterity: string
  stat_constitution: string
  stat_intelligence: string
  stat_wisdom: string
  stat_charisma: string
  public_notes: string
  secret_notes: string
  secrecy: Record<TogglableField, boolean>
}

function playerToEditForm(p: Player, rows: PlayerFieldSecrecy[]): EditFormState {
  const secrecy = Object.fromEntries(
    TOGGLABLE_FIELDS.map((f) => [f, rows.find((r) => r.field_name === f)?.is_secret ?? false])
  ) as Record<TogglableField, boolean>

  return {
    name: p.name,
    portrait_url: p.portrait_url ?? '',
    clerk_user_id: p.clerk_user_id ?? '',
    level: p.level?.toString() ?? '',
    class: p.class ?? '',
    race: p.race ?? '',
    background: p.background ?? '',
    hp_current: p.hp_current?.toString() ?? '',
    hp_max: p.hp_max?.toString() ?? '',
    stat_strength: p.stat_strength?.toString() ?? '',
    stat_dexterity: p.stat_dexterity?.toString() ?? '',
    stat_constitution: p.stat_constitution?.toString() ?? '',
    stat_intelligence: p.stat_intelligence?.toString() ?? '',
    stat_wisdom: p.stat_wisdom?.toString() ?? '',
    stat_charisma: p.stat_charisma?.toString() ?? '',
    public_notes: p.public_notes ?? '',
    secret_notes: p.secret_notes ?? '',
    secrecy,
  }
}

function numOrNull(s: string): number | null {
  const n = parseInt(s)
  return isNaN(n) ? null : n
}

function SecrecyToggleRow({
  field,
  label,
  isSecret,
  onToggle,
}: {
  field: TogglableField
  label: string
  isSecret: boolean
  onToggle: () => void
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="font-fell text-sm text-brand-parchment">{label}</span>
      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        <span className="font-fell text-xs text-brand-muted">
          {isSecret ? 'Hidden from players' : 'Visible'}
        </span>
        <Toggle
          checked={isSecret}
          onChange={onToggle}
        />
      </div>
    </div>
  )
}

export default function PlayerSheetClient({ player, secrecyRows, isAdmin, fullPlayer }: Props) {
  const router = useRouter()
  const [showEdit, setShowEdit] = useState(false)
  const [editForm, setEditForm] = useState<EditFormState>(
    fullPlayer ? playerToEditForm(fullPlayer, secrecyRows) : playerToEditForm(player as Player, secrecyRows)
  )
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  async function handleSave() {
    if (!editForm.name.trim()) { setErr('Name is required'); return }
    setSaving(true); setErr('')

    const body = {
      name: editForm.name.trim(),
      portrait_url: editForm.portrait_url.trim() || null,
      clerk_user_id: editForm.clerk_user_id.trim() || null,
      level: numOrNull(editForm.level),
      class: editForm.class.trim() || null,
      race: editForm.race.trim() || null,
      background: editForm.background.trim() || null,
      hp_current: numOrNull(editForm.hp_current),
      hp_max: numOrNull(editForm.hp_max),
      stat_strength: numOrNull(editForm.stat_strength),
      stat_dexterity: numOrNull(editForm.stat_dexterity),
      stat_constitution: numOrNull(editForm.stat_constitution),
      stat_intelligence: numOrNull(editForm.stat_intelligence),
      stat_wisdom: numOrNull(editForm.stat_wisdom),
      stat_charisma: numOrNull(editForm.stat_charisma),
      public_notes: editForm.public_notes.trim() || null,
      secret_notes: editForm.secret_notes.trim() || null,
    }

    const [playerRes, secrecyRes] = await Promise.all([
      fetch(`/api/the8adventurers/players/${player.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }),
      fetch(`/api/the8adventurers/players/${player.id}/secrecy`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secrecy: editForm.secrecy }),
      }),
    ])

    setSaving(false)
    if (!playerRes.ok) {
      const j = await playerRes.json()
      setErr(j.error ?? 'Error saving')
      return
    }
    if (!secrecyRes.ok) {
      setErr('Error saving field visibility')
      return
    }

    setShowEdit(false)
    router.refresh()
  }

  async function handleDelete() {
    if (!confirm(`Delete player "${player.name}"? This cannot be undone.`)) return
    setSaving(true)
    const res = await fetch(`/api/the8adventurers/players/${player.id}`, { method: 'DELETE' })
    setSaving(false)
    if (!res.ok) { setErr('Error deleting'); return }
    router.push('/the8adventurers/players/new')
    router.refresh()
  }

  const inputCls = 'w-full bg-brand-bg border border-brand-border rounded-sm px-3 py-2 text-brand-parchment font-fell text-sm focus:outline-none focus:border-brand-purple-600'
  const statInputCls = 'w-full bg-brand-bg border border-brand-border rounded-sm px-2 py-1.5 text-brand-parchment font-fell text-sm text-center focus:outline-none focus:border-brand-purple-600'

  const hasHP = 'hp_current' in player
  const hasStats = 'stat_strength' in player
  const hasLevel = 'level' in player

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        {'portrait_url' in player && player.portrait_url && (
          <img
            src={player.portrait_url}
            alt={player.name}
            className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-sm border border-brand-border flex-shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <p className="section-label">Player Character</p>
          <h1 className="font-cinzel text-brand-parchment text-2xl md:text-3xl font-bold mb-1">
            {player.name}
          </h1>
          <div className="flex flex-wrap gap-3 font-fell text-sm text-brand-muted">
            {hasLevel && player.level !== null && player.level !== undefined && (
              <span>Level {player.level}</span>
            )}
            {'class' in player && player.class && <span>{player.class}</span>}
            {'race' in player && player.race && <span>{player.race}</span>}
            {'background' in player && player.background && <span>· {player.background}</span>}
          </div>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowEdit(true)}
            className="btn-outline text-xs flex-shrink-0"
          >
            Edit
          </button>
        )}
      </div>

      {/* HP bar */}
      {hasHP && player.hp_current !== null && player.hp_max !== null &&
        player.hp_current !== undefined && player.hp_max !== undefined && (
        <div className="dark-card mb-4">
          <HpBar current={player.hp_current} max={player.hp_max} />
        </div>
      )}

      {/* Ability scores */}
      {hasStats && <StatBlock player={player} />}

      {/* Public notes */}
      {player.public_notes && (
        <div className="dark-card mt-4">
          <p className="section-label mb-2">Notes</p>
          <p className="font-fell text-[#F0E8FF] text-sm leading-relaxed whitespace-pre-wrap">
            {player.public_notes}
          </p>
        </div>
      )}

      {/* GM-only secret notes */}
      {isAdmin && 'secret_notes' in player && player.secret_notes && (
        <div className="dark-card mt-4 border-brand-gold-400/30">
          <p className="section-label text-brand-gold-400 mb-2">GM Notes (Secret)</p>
          <p className="font-fell text-[#F0E8FF] text-sm leading-relaxed whitespace-pre-wrap">
            {player.secret_notes}
          </p>
        </div>
      )}

      {/* Edit modal */}
      {showEdit && isAdmin && fullPlayer && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center pt-8 px-4 overflow-y-auto">
          <div
            className="bg-brand-card border border-brand-border rounded-sm p-6 w-full max-w-2xl my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-cinzel text-brand-parchment font-bold text-lg">Edit Player</h2>
              <button onClick={() => setShowEdit(false)} className="text-brand-muted hover:text-brand-parchment text-xl" aria-label="Close">✕</button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="section-label block mb-1">Name *</label>
                  <input type="text" value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className="section-label block mb-1">Clerk User ID</label>
                  <input type="text" value={editForm.clerk_user_id} onChange={(e) => setEditForm((f) => ({ ...f, clerk_user_id: e.target.value }))} className={inputCls} placeholder="user_…" />
                </div>
              </div>

              <div>
                <label className="section-label block mb-1">Portrait URL</label>
                <input type="text" value={editForm.portrait_url} onChange={(e) => setEditForm((f) => ({ ...f, portrait_url: e.target.value }))} className={inputCls} placeholder="https://…" />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="section-label block mb-1">Level</label>
                  <input type="number" value={editForm.level} onChange={(e) => setEditForm((f) => ({ ...f, level: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className="section-label block mb-1">Class</label>
                  <input type="text" value={editForm.class} onChange={(e) => setEditForm((f) => ({ ...f, class: e.target.value }))} className={inputCls} placeholder="Fighter…" />
                </div>
                <div>
                  <label className="section-label block mb-1">Race</label>
                  <input type="text" value={editForm.race} onChange={(e) => setEditForm((f) => ({ ...f, race: e.target.value }))} className={inputCls} placeholder="Elf…" />
                </div>
              </div>

              <div>
                <label className="section-label block mb-1">Background</label>
                <input type="text" value={editForm.background} onChange={(e) => setEditForm((f) => ({ ...f, background: e.target.value }))} className={inputCls} placeholder="Soldier…" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="section-label block mb-1">HP Current</label>
                  <input type="number" value={editForm.hp_current} onChange={(e) => setEditForm((f) => ({ ...f, hp_current: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className="section-label block mb-1">HP Max</label>
                  <input type="number" value={editForm.hp_max} onChange={(e) => setEditForm((f) => ({ ...f, hp_max: e.target.value }))} className={inputCls} />
                </div>
              </div>

              <div>
                <label className="section-label block mb-2">Ability Scores</label>
                <div className="grid grid-cols-6 gap-2">
                  {STAT_KEYS.map(({ key, label }) => (
                    <div key={key}>
                      <label className="section-label block mb-1 text-center">{label}</label>
                      <input
                        type="number"
                        value={(editForm as Record<string, unknown>)[key] as string}
                        onChange={(e) => setEditForm((f) => ({ ...f, [key]: e.target.value }))}
                        className={statInputCls}
                        min={1}
                        max={30}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="section-label block mb-1">Public Notes</label>
                <textarea
                  value={editForm.public_notes}
                  onChange={(e) => setEditForm((f) => ({ ...f, public_notes: e.target.value }))}
                  rows={3}
                  className={`${inputCls} resize-y`}
                  placeholder="Visible to all signed-in players"
                />
              </div>

              <div>
                <label className="section-label text-brand-gold-400 block mb-1">GM Notes (always secret)</label>
                <textarea
                  value={editForm.secret_notes}
                  onChange={(e) => setEditForm((f) => ({ ...f, secret_notes: e.target.value }))}
                  rows={3}
                  className={`${inputCls} resize-y`}
                  placeholder="GM-only notes"
                />
              </div>

              {/* Field secrecy toggles */}
              <div>
                <label className="section-label block mb-2">Field Visibility (Hide from Players)</label>
                <div className="bg-brand-bg border border-brand-border rounded-sm px-3 py-2 space-y-1 divide-y divide-brand-border/30">
                  {TOGGLABLE_FIELDS.map((field) => (
                    <SecrecyToggleRow
                      key={field}
                      field={field}
                      label={FIELD_LABELS[field]}
                      isSecret={editForm.secrecy[field]}
                      onToggle={() => setEditForm((f) => ({
                        ...f,
                        secrecy: { ...f.secrecy, [field]: !f.secrecy[field] },
                      }))}
                    />
                  ))}
                </div>
              </div>

              {err && <p className="text-red-400 text-sm font-fell">{err}</p>}

              <div className="flex gap-3 pt-2">
                <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 text-xs">
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button onClick={handleDelete} disabled={saving} className="btn-outline text-xs text-red-400 border-red-400/40 hover:bg-red-400/10">
                  Delete Player
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
