'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Achievement, Player } from '@/lib/the8adventurers/types'
import RichCard from '@/components/the8adventurers/RichCard'
import Toggle from '@/components/the8adventurers/Toggle'
import SecretBadge from '@/components/the8adventurers/SecretBadge'
import MentionTextarea from '@/components/the8adventurers/MentionTextarea'

type Props = {
  initialAchievements: Achievement[]
  players: Player[]
  isAdmin: boolean
}

type FormState = {
  title: string
  description: string
  portrait_url: string
  unlock_text: string
  is_secret: boolean
  player_ids: string[]
}

function emptyForm(): FormState {
  return { title: '', description: '', portrait_url: '', unlock_text: '', is_secret: true, player_ids: [] }
}

function achievementToForm(a: Achievement): FormState {
  return {
    title: a.title,
    description: a.description ?? '',
    portrait_url: a.portrait_url ?? '',
    unlock_text: a.unlock_text ?? '',
    is_secret: a.is_secret,
    player_ids: (a.the8_achievement_players ?? []).map((p) => p.player_id),
  }
}

function AchievementRewardHero({ unlock_text }: { unlock_text: string | null }) {
  if (!unlock_text) return null
  return (
    <div className="mt-3 border-t border-brand-border pt-3">
      <p className="section-label mb-1">How to Unlock</p>
      <p className="font-fell text-[#F0E8FF] text-sm">{unlock_text}</p>
    </div>
  )
}

function PlayerRow({
  player,
  checked,
  onToggle,
}: {
  player: Player
  checked: boolean
  onToggle: () => void
}) {
  return (
    <div className="flex items-center gap-3 py-1">
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="accent-brand-gold-400 w-4 h-4 flex-shrink-0 cursor-pointer"
      />
      <span className="font-fell text-sm text-brand-parchment">{player.name}</span>
    </div>
  )
}

export default function AchievementsClient({ initialAchievements, players, isAdmin }: Props) {
  const router = useRouter()
  const [achievements, setAchievements] = useState<Achievement[]>(initialAchievements)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Achievement | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm())
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  function openCreate() {
    setEditing(null)
    setForm(emptyForm())
    setErr('')
    setShowModal(true)
  }

  function openEdit(a: Achievement) {
    setEditing(a)
    setForm(achievementToForm(a))
    setErr('')
    setShowModal(true)
  }

  function togglePlayer(pid: string) {
    setForm((f) => ({
      ...f,
      player_ids: f.player_ids.includes(pid)
        ? f.player_ids.filter((x) => x !== pid)
        : [...f.player_ids, pid],
    }))
  }

  async function handleSave() {
    if (!form.title.trim()) { setErr('Title is required'); return }
    setSaving(true); setErr('')

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      portrait_url: form.portrait_url.trim() || null,
      unlock_text: form.unlock_text.trim() || null,
      is_secret: form.is_secret,
      player_ids: form.player_ids,
    }

    const res = editing
      ? await fetch(`/api/the8adventurers/achievements/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      : await fetch('/api/the8adventurers/achievements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

    const json = await res.json()
    setSaving(false)
    if (!res.ok) { setErr(json.error ?? 'Error saving'); return }

    if (editing) {
      setAchievements((prev) => prev.map((a) => a.id === json.id ? json : a))
    } else {
      setAchievements((prev) => [json, ...prev])
    }
    setShowModal(false)
    router.refresh()
  }

  async function handleDelete() {
    if (!editing) return
    if (!confirm(`Delete achievement "${editing.title}"?`)) return
    setSaving(true)
    const res = await fetch(`/api/the8adventurers/achievements/${editing.id}`, { method: 'DELETE' })
    setSaving(false)
    if (!res.ok) { setErr('Error deleting'); return }
    setAchievements((prev) => prev.filter((a) => a.id !== editing.id))
    setShowModal(false)
    router.refresh()
  }

  const inputCls = 'w-full bg-brand-bg border border-brand-border rounded-sm px-3 py-2 text-brand-parchment font-fell text-sm focus:outline-none focus:border-brand-purple-600'

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      {/* Mobile fixed "+" add button */}
      {isAdmin && (
        <button
          onClick={openCreate}
          className="md:hidden fixed top-4 right-14 z-40 w-9 h-9 bg-brand-purple-600 hover:bg-brand-purple-400 rounded-sm text-brand-parchment flex items-center justify-center transition-colors text-lg font-bold"
          aria-label="Add Achievement"
          title="Add Achievement"
        >
          +
        </button>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="section-label">Campaign</p>
          <h1 className="font-cinzel text-brand-parchment text-2xl md:text-3xl font-bold">Achievements</h1>
        </div>
        {isAdmin && (
          <button onClick={openCreate} className="hidden md:inline-flex btn-primary text-xs">+ Add Achievement</button>
        )}
      </div>

      {achievements.length === 0 && (
        <p className="font-fell text-brand-muted italic">No achievements yet.</p>
      )}

      <div className="grid gap-4">
        {achievements.map((a) => {
          const awardedPlayers = players.filter((p) =>
            (a.the8_achievement_players ?? []).some((ap) => ap.player_id === p.id)
          )

          return (
            <div
              key={a.id}
              className={isAdmin ? 'cursor-pointer' : ''}
              onClick={isAdmin ? () => openEdit(a) : undefined}
            >
              <RichCard portrait_url={a.portrait_url} title={a.title} description={a.description}>
                <AchievementRewardHero unlock_text={a.unlock_text} />

                {awardedPlayers.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {awardedPlayers.map((p) => (
                      <span
                        key={p.id}
                        className="font-fell text-xs text-brand-gold-300 bg-brand-gold-400/10 border border-brand-gold-400/30 px-2 py-0.5 rounded-sm"
                      >
                        {p.name}
                      </span>
                    ))}
                  </div>
                )}

                {isAdmin && a.is_secret && (
                  <div className="mt-3"><SecretBadge /></div>
                )}
              </RichCard>
            </div>
          )
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center pt-16 px-4">
          <div
            className="bg-brand-card border border-brand-border rounded-sm p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-cinzel text-brand-parchment font-bold text-lg">
                {editing ? 'Edit Achievement' : 'New Achievement'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-brand-muted hover:text-brand-parchment text-xl" aria-label="Close">✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="section-label block mb-1">Title *</label>
                <input type="text" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className={inputCls} />
              </div>

              <div>
                <label className="section-label block mb-1">Description</label>
                <MentionTextarea
                  value={form.description}
                  onChange={(v) => setForm((f) => ({ ...f, description: v }))}
                  rows={4}
                  placeholder="Achievement description… type @ to link articles"
                  className={`${inputCls} resize-y`}
                />
              </div>

              <div>
                <label className="section-label block mb-1">Portrait URL</label>
                <input type="text" value={form.portrait_url} onChange={(e) => setForm((f) => ({ ...f, portrait_url: e.target.value }))} className={inputCls} placeholder="https://…" />
              </div>

              <div>
                <label className="section-label block mb-1">How to Unlock</label>
                <input type="text" value={form.unlock_text} onChange={(e) => setForm((f) => ({ ...f, unlock_text: e.target.value }))} className={inputCls} placeholder="e.g. Defeat the Dragon King" />
              </div>

              <div className="flex items-center gap-3">
                <Toggle checked={form.is_secret} onChange={(v) => setForm((f) => ({ ...f, is_secret: v }))} />
                <span className="font-fell text-sm text-brand-muted">{form.is_secret ? 'GM Only' : 'Visible to players'}</span>
              </div>

              {players.length > 0 && (
                <div>
                  <label className="section-label block mb-2">Awarded To</label>
                  <div className="bg-brand-bg border border-brand-border rounded-sm px-3 py-2 space-y-1">
                    {players.map((p) => (
                      <PlayerRow
                        key={p.id}
                        player={p}
                        checked={form.player_ids.includes(p.id)}
                        onToggle={() => togglePlayer(p.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {err && <p className="text-red-400 text-sm font-fell">{err}</p>}

              <div className="flex gap-3 pt-2">
                <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 text-xs">
                  {saving ? 'Saving…' : 'Save'}
                </button>
                {editing && (
                  <button onClick={handleDelete} disabled={saving} className="btn-outline text-xs text-red-400 border-red-400/40 hover:bg-red-400/10">
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
