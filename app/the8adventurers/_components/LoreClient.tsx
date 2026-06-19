'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { LoreEntry, LoreCategory } from '@/lib/the8adventurers/types'
import Toggle from '@/components/the8adventurers/Toggle'
import SecretBadge from '@/components/the8adventurers/SecretBadge'
import MentionTextarea from '@/components/the8adventurers/MentionTextarea'
import ViewToggle, { type ViewMode } from '@/components/the8adventurers/ViewToggle'
import CardMenu from '@/components/the8adventurers/CardMenu'
import ArticleModal, { type ArticleModalData } from '@/components/the8adventurers/ArticleModal'

type Props = {
  initialEntries: LoreEntry[]
  category: LoreCategory
  label: string
  isAdmin: boolean
}

type FormState = {
  title: string
  description: string
  portrait_url: string
  is_secret: boolean
  gm_notes: string
}

function emptyForm(): FormState {
  return { title: '', description: '', portrait_url: '', is_secret: true, gm_notes: '' }
}

function entryToForm(e: LoreEntry): FormState {
  return {
    title: e.title,
    description: e.description ?? '',
    portrait_url: e.portrait_url ?? '',
    is_secret: e.is_secret,
    gm_notes: e.gm_notes ?? '',
  }
}

function getStoredView(): ViewMode {
  if (typeof window === 'undefined') return 'grid'
  return (localStorage.getItem('the8_view_lore') as ViewMode) ?? 'grid'
}

export default function LoreClient({ initialEntries, category, label, isAdmin }: Props) {
  const router = useRouter()
  const [entries, setEntries] = useState<LoreEntry[]>(initialEntries)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<LoreEntry | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm())
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')
  const [view, setView] = useState<ViewMode>('grid')
  const [viewingArticle, setViewingArticle] = useState<ArticleModalData | null>(null)

  useEffect(() => {
    setView(getStoredView())
  }, [])

  function handleViewChange(v: ViewMode) {
    setView(v)
    if (typeof window !== 'undefined') localStorage.setItem('the8_view_lore', v)
  }

  function openCreate() {
    setEditing(null)
    setForm(emptyForm())
    setErr('')
    setShowModal(true)
  }

  function openEdit(entry: LoreEntry) {
    setEditing(entry)
    setForm(entryToForm(entry))
    setErr('')
    setShowModal(true)
  }

  function openView(entry: LoreEntry) {
    setViewingArticle({ type: 'lore', data: entry })
  }

  async function handleToggleSecret(entry: LoreEntry) {
    const newSecret = !entry.is_secret
    setEntries((prev) => prev.map((e) => e.id === entry.id ? { ...e, is_secret: newSecret } : e))
    await fetch(`/api/the8adventurers/lore/${entry.id}`, {
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
      category,
      title: form.title.trim(),
      description: form.description.trim() || null,
      portrait_url: form.portrait_url.trim() || null,
      is_secret: form.is_secret,
      gm_notes: form.gm_notes.trim() || null,
    }

    const res = editing
      ? await fetch(`/api/the8adventurers/lore/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      : await fetch('/api/the8adventurers/lore', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

    const json = await res.json()
    setSaving(false)
    if (!res.ok) { setErr(json.error ?? 'Error saving'); return }

    if (editing) {
      setEntries((prev) => prev.map((e) => (e.id === json.id ? json : e)))
    } else {
      setEntries((prev) => [json, ...prev])
    }
    setShowModal(false)
    router.refresh()
  }

  async function handleDeleteEntry(entry: LoreEntry) {
    setSaving(true)
    const res = await fetch(`/api/the8adventurers/lore/${entry.id}`, { method: 'DELETE' })
    setSaving(false)
    if (!res.ok) { setErr('Error deleting'); return }
    setEntries((prev) => prev.filter((e) => e.id !== entry.id))
    if (editing?.id === entry.id) setShowModal(false)
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
          aria-label="Add Lore Entry"
          title="Add Lore Entry"
        >
          +
        </button>
      )}

      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div>
          <p className="section-label">Lore</p>
          <h1 className="font-cinzel text-brand-parchment text-2xl md:text-3xl font-bold">{label}</h1>
        </div>
        <div className="flex items-center gap-2">
          <ViewToggle value={view} onChange={handleViewChange} />
          {isAdmin && (
            <button onClick={openCreate} className="hidden md:inline-flex btn-primary text-xs">+ Add Entry</button>
          )}
        </div>
      </div>

      {entries.length === 0 && (
        <p className="font-fell text-brand-muted italic">No entries yet.</p>
      )}

      {view === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="relative dark-card flex flex-col overflow-hidden cursor-pointer"
              onClick={() => openView(entry)}
            >
              <div className="absolute top-2 right-2 z-10">
                <CardMenu
                  isAdmin={isAdmin}
                  onEdit={isAdmin ? () => openEdit(entry) : undefined}
                  onToggleSecret={isAdmin ? () => handleToggleSecret(entry) : undefined}
                  onDelete={isAdmin ? () => handleDeleteEntry(entry) : undefined}
                />
              </div>
              {entry.portrait_url && (
                <img
                  src={entry.portrait_url}
                  alt={entry.title}
                  className="w-full h-32 object-cover rounded-sm mb-3 border border-brand-border"
                />
              )}
              <h3 className="font-cinzel text-brand-parchment font-semibold text-base leading-tight mb-1 pr-8">
                {entry.title}
              </h3>
              {isAdmin && entry.is_secret && <div className="mb-1"><SecretBadge /></div>}
              {entry.description && (
                <p className="font-fell text-brand-muted text-sm leading-relaxed line-clamp-2">
                  {entry.description}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-1.5">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="group relative flex items-center gap-2 bg-brand-card border border-brand-border rounded-sm px-3 py-2 hover:border-brand-purple-600/50 transition-colors duration-200 cursor-pointer"
              onClick={() => openView(entry)}
            >
              {entry.portrait_url ? (
                <img
                  src={entry.portrait_url}
                  alt={entry.title}
                  className="w-8 h-8 object-cover rounded-sm border border-brand-border flex-shrink-0"
                />
              ) : (
                <div className="w-8 h-8 bg-brand-border/20 rounded-sm flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
                <h3 className="font-cinzel text-brand-parchment font-semibold text-sm leading-tight truncate">
                  {entry.title}
                </h3>
                <span className="text-[10px] font-cinzel tracking-widest uppercase text-brand-purple-400 bg-brand-purple-600/10 border border-brand-purple-600/30 px-1.5 py-0.5 rounded-sm flex-shrink-0">
                  {entry.category}
                </span>
                {isAdmin && entry.is_secret && <SecretBadge />}
              </div>
              <CardMenu
                variant="list"
                isSecret={entry.is_secret}
                isAdmin={isAdmin}
                onEdit={isAdmin ? () => openEdit(entry) : undefined}
                onToggleSecret={isAdmin ? () => handleToggleSecret(entry) : undefined}
                onDelete={isAdmin ? () => handleDeleteEntry(entry) : undefined}
              />
            </div>
          ))}
        </div>
      )}

      {/* Edit / Create modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center pt-16 px-4">
          <div
            className="bg-brand-card border border-brand-border rounded-sm p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-cinzel text-brand-parchment font-bold text-lg">
                {editing ? 'Edit Entry' : 'New Entry'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-brand-muted hover:text-brand-parchment transition-colors text-xl leading-none"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="section-label block mb-1">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className={inputCls}
                  placeholder="Entry title"
                />
              </div>

              <div>
                <label className="section-label block mb-1">Description</label>
                <MentionTextarea
                  value={form.description}
                  onChange={(v) => setForm((f) => ({ ...f, description: v }))}
                  rows={6}
                  placeholder="Lore description… type @ to link articles"
                  className={`${inputCls} resize-y`}
                />
              </div>

              <div>
                <label className="section-label block mb-1">Portrait URL</label>
                <input
                  type="text"
                  value={form.portrait_url}
                  onChange={(e) => setForm((f) => ({ ...f, portrait_url: e.target.value }))}
                  className={inputCls}
                  placeholder="https://…"
                />
              </div>

              <div className="flex items-center gap-3">
                <Toggle
                  checked={form.is_secret}
                  onChange={(v) => setForm((f) => ({ ...f, is_secret: v }))}
                />
                <span className="font-fell text-sm text-brand-muted">
                  {form.is_secret ? 'GM Only (hidden from players)' : 'Visible to all players'}
                </span>
              </div>

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
                  <button
                    onClick={() => handleDeleteEntry(editing)}
                    disabled={saving}
                    className="btn-outline text-xs text-red-400 border-red-400/40 hover:bg-red-400/10"
                  >
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
          onClose={() => setViewingArticle(null)}
        />
      )}
    </div>
  )
}
