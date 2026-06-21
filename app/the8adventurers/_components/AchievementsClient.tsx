'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Achievement, Player } from '@/lib/the8adventurers/types'
import Toggle from '@/components/the8adventurers/Toggle'
import SecretBadge from '@/components/the8adventurers/SecretBadge'
import MentionTextarea from '@/components/the8adventurers/MentionTextarea'
import ViewToggle, { type ViewMode } from '@/components/the8adventurers/ViewToggle'
import CardMenu from '@/components/the8adventurers/CardMenu'
import ArticleModal, { type ArticleModalData } from '@/components/the8adventurers/ArticleModal'

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
  gm_notes: string
  player_ids: string[]
}

function emptyForm(): FormState {
  return { title: '', description: '', portrait_url: '', unlock_text: '', is_secret: true, gm_notes: '', player_ids: [] }
}

function achievementToForm(a: Achievement): FormState {
  return {
    title: a.title,
    description: a.description ?? '',
    portrait_url: a.portrait_url ?? '',
    unlock_text: a.unlock_text ?? '',
    is_secret: a.is_secret,
    gm_notes: a.gm_notes ?? '',
    player_ids: (a.the8_achievement_players ?? []).map((p) => p.player_id),
  }
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

function getStoredView(): ViewMode {
  if (typeof window === 'undefined') return 'grid'
  return (localStorage.getItem('the8_view_achievements') as ViewMode) ?? 'grid'
}

export default function AchievementsClient({ initialAchievements, players, isAdmin }: Props) {
  const router = useRouter()
  const [achievements, setAchievements] = useState<Achievement[]>(initialAchievements)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Achievement | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm())
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')
  const [view, setView] = useState<ViewMode>('grid')
  const [viewingArticle, setViewingArticle] = useState<ArticleModalData | null>(null)
  const [viewingAchievement, setViewingAchievement] = useState<Achievement | null>(null)

  useEffect(() => {
    setView(getStoredView())
  }, [])

  function handleViewChange(v: ViewMode) {
    setView(v)
    if (typeof window !== 'undefined') localStorage.setItem('the8_view_achievements', v)
  }

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

  function openView(a: Achievement) {
    setViewingAchievement(a)
    setViewingArticle({ type: 'achievement', data: a, players })
  }

  function togglePlayer(pid: string) {
    setForm((f) => ({
      ...f,
      player_ids: f.player_ids.includes(pid)
        ? f.player_ids.filter((x) => x !== pid)
        : [...f.player_ids, pid],
    }))
  }

  async function handleToggleSecret(a: Achievement) {
    const newSecret = !a.is_secret
    setAchievements((prev) => prev.map((x) => x.id === a.id ? { ...x, is_secret: newSecret } : x))
    await fetch(`/api/the8adventurers/achievements/${a.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_secret: newSecret }),
    })
    router.refresh()
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
      gm_notes: form.gm_notes.trim() || null,
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

  async function handleDeleteAchievement(achievement: Achievement) {
    setSaving(true)
    const res = await fetch(`/api/the8adventurers/achievements/${achievement.id}`, { method: 'DELETE' })
    setSaving(false)
    if (!res.ok) { setErr('Error deleting'); return }
    setAchievements((prev) => prev.filter((a) => a.id !== achievement.id))
    if (editing?.id === achievement.id) setShowModal(false)
    router.refresh()
  }

  const inputCls = 'w-full bg-brand-bg border border-brand-border rounded-sm px-3 py-2 text-brand-parchment font-fell text-sm focus:outline-none focus:border-brand-purple-600'

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
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

      <div className="flex items-center mb-3 md:mb-6 gap-3">
        <div className="flex-1">
          <p className="section-label">Campaign</p>
          <h1 className="font-cinzel text-brand-parchment text-2xl md:text-3xl font-bold">Achievements</h1>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <ViewToggle value={view} onChange={handleViewChange} />
          {isAdmin && (
            <button onClick={openCreate} className="btn-primary text-xs">+ Add Achievement</button>
          )}
        </div>
      </div>
      <div className="md:hidden flex justify-end mt-2 mb-6">
        <ViewToggle value={view} onChange={handleViewChange} />
      </div>

      {achievements.length === 0 && (
        <p className="font-fell text-brand-muted italic">No achievements yet.</p>
      )}

      {view === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {achievements.map((a) => {
            const awardedPlayers = players.filter((p) =>
              (a.the8_achievement_players ?? []).some((ap) => ap.player_id === p.id)
            )
            return (
              <div
                key={a.id}
                className="relative dark-card flex flex-col overflow-hidden cursor-pointer"
                onClick={() => openView(a)}
              >
                <div className="absolute top-2 right-2 z-10">
                  <CardMenu
                    isAdmin={isAdmin}
                    onEdit={isAdmin ? () => openEdit(a) : undefined}
                    onToggleSecret={isAdmin ? () => handleToggleSecret(a) : undefined}
                    onDelete={isAdmin ? () => handleDeleteAchievement(a) : undefined}
                  />
                </div>
                {a.portrait_url && (
                  <img src={a.portrait_url} alt={a.title} className="w-full h-32 object-cover rounded-sm mb-3 border border-brand-border" />
                )}
                <h3 className="font-cinzel text-brand-parchment font-semibold text-base leading-tight mb-1 pr-8">
                  {a.title}
                </h3>
                {isAdmin && a.is_secret && <div className="mb-1"><SecretBadge /></div>}
                {a.description && (
                  <p className="font-fell text-brand-muted text-sm leading-relaxed line-clamp-2">{a.description}</p>
                )}
                {awardedPlayers.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {awardedPlayers.map((p) => (
                      <span key={p.id} className="font-fell text-xs text-brand-gold-300 bg-brand-gold-400/10 border border-brand-gold-400/30 px-1.5 py-0.5 rounded-sm">
                        {p.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="space-y-1.5">
          {achievements.map((a) => {
            const awardedPlayers = players.filter((p) =>
              (a.the8_achievement_players ?? []).some((ap) => ap.player_id === p.id)
            )
            return (
              <div
                key={a.id}
                className="group relative flex items-center gap-2 bg-brand-card border border-brand-border rounded-sm px-3 py-2 hover:border-brand-purple-600/50 transition-colors duration-200 cursor-pointer"
                onClick={() => openView(a)}
              >
                {a.portrait_url ? (
                  <img src={a.portrait_url} alt={a.title} className="w-8 h-8 object-cover rounded-sm border border-brand-border flex-shrink-0" />
                ) : (
                  <div className="w-8 h-8 bg-brand-border/20 rounded-sm flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
                  <h3 className="font-cinzel text-brand-parchment font-semibold text-sm leading-tight truncate">
                    {a.title}
                  </h3>
                  {isAdmin && a.is_secret && <SecretBadge />}
                  {awardedPlayers.length > 0 && (
                    <span className="font-fell text-brand-muted text-xs truncate">
                      {awardedPlayers.map((p) => p.name).join(', ')}
                    </span>
                  )}
                </div>
                <CardMenu
                  variant="list"
                  isSecret={a.is_secret}
                  isAdmin={isAdmin}
                  onEdit={isAdmin ? () => openEdit(a) : undefined}
                  onToggleSecret={isAdmin ? () => handleToggleSecret(a) : undefined}
                  onDelete={isAdmin ? () => handleDeleteAchievement(a) : undefined}
                />
              </div>
            )
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/70 z-50">
          <div
            className="absolute inset-6 bg-brand-card border border-brand-border rounded-sm p-6 overflow-y-auto"
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

              <div>
                <label className="section-label block mb-1 text-red-400/80">GM Notes (private)</label>
                <textarea
                  value={form.gm_notes}
                  onChange={(e) => setForm((f) => ({ ...f, gm_notes: e.target.value }))}
                  rows={3}
                  placeholder="Private notes, only visible to GM…"
                  className={`${inputCls} resize-y border-red-800/40 focus:border-red-700/60`}
                />
              </div>

              {err && <p className="text-red-400 text-sm font-fell">{err}</p>}

              <div className="flex gap-3 pt-2">
                <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 text-xs">
                  {saving ? 'Saving…' : 'Save'}
                </button>
                {editing && (
                  <button onClick={() => handleDeleteAchievement(editing)} disabled={saving} className="btn-outline text-xs text-red-400 border-red-400/40 hover:bg-red-400/10">
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {viewingArticle && (
        <ArticleModal
          article={viewingArticle}
          isAdmin={isAdmin}
          onClose={() => { setViewingArticle(null); setViewingAchievement(null) }}
          onEdit={isAdmin && viewingAchievement ? () => {
            const fresh = achievements.find((a) => a.id === viewingAchievement.id) ?? viewingAchievement
            setViewingArticle(null)
            setViewingAchievement(null)
            openEdit(fresh)
          } : undefined}
          onToggleSecret={isAdmin && viewingAchievement ? () => {
            const fresh = achievements.find((a) => a.id === viewingAchievement.id) ?? viewingAchievement
            handleToggleSecret(fresh)
          } : undefined}
          onDelete={isAdmin && viewingAchievement ? () => {
            const fresh = achievements.find((a) => a.id === viewingAchievement.id) ?? viewingAchievement
            setViewingArticle(null)
            setViewingAchievement(null)
            handleDeleteAchievement(fresh)
          } : undefined}
        />
      )}
    </div>
  )
}
