'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { LoreEntry, LoreCategory, LinkedLoreEntry } from '@/lib/the8adventurers/types'
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
  preferred_habitat: string
  faction_ids: string[]
  location_ids: string[]
}

function emptyForm(): FormState {
  return {
    title: '', description: '', portrait_url: '', is_secret: true, gm_notes: '',
    preferred_habitat: '', faction_ids: [], location_ids: [],
  }
}

function entryToForm(e: LoreEntry): FormState {
  return {
    title: e.title,
    description: e.description ?? '',
    portrait_url: e.portrait_url ?? '',
    is_secret: e.is_secret,
    gm_notes: e.gm_notes ?? '',
    preferred_habitat: e.preferred_habitat ?? '',
    faction_ids: (e.linked_factions ?? []).map((f) => f.id),
    location_ids: (e.linked_locations ?? []).map((l) => l.id),
  }
}

function getStoredView(): ViewMode {
  if (typeof window === 'undefined') return 'grid'
  return (localStorage.getItem('the8_view_lore') as ViewMode) ?? 'grid'
}

// Multi-select field for factions or locations
function MultiSelectField({
  label,
  all,
  selectedIds,
  onAdd,
  onRemove,
  inputCls,
}: {
  label: string
  all: LoreEntry[]
  selectedIds: string[]
  onAdd: (id: string) => void
  onRemove: (id: string) => void
  inputCls: string
}) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const selected = all.filter((e) => selectedIds.includes(e.id))
  const filtered = query
    ? all.filter((e) => !selectedIds.includes(e.id) && e.title.toLowerCase().includes(query.toLowerCase()))
    : []

  return (
    <div>
      <label className="section-label block mb-1">{label}</label>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selected.map((e) => (
            <span
              key={e.id}
              className="inline-flex items-center gap-1 font-fell text-xs text-brand-purple-200 bg-brand-purple-900/30 border border-brand-purple-600/30 px-2 py-0.5 rounded-sm"
            >
              {e.title}
              <button
                type="button"
                onClick={() => onRemove(e.id)}
                className="text-brand-muted hover:text-red-400 transition-colors leading-none ml-0.5"
                aria-label={`Remove ${e.title}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${label.toLowerCase()}…`}
          className={inputCls}
          autoComplete="off"
        />
        {filtered.length > 0 && (
          <div className="absolute z-20 left-0 right-0 top-full mt-0.5 bg-brand-bg border border-brand-border rounded-sm max-h-40 overflow-y-auto shadow-lg">
            {filtered.map((e) => (
              <button
                key={e.id}
                type="button"
                onClick={() => { onAdd(e.id); setQuery(''); inputRef.current?.focus() }}
                className="w-full text-left px-3 py-2 font-fell text-sm text-brand-parchment hover:bg-brand-purple-600/20 transition-colors"
              >
                {e.title}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
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
  const [availableFactions, setAvailableFactions] = useState<LoreEntry[]>([])
  const [availableLocations, setAvailableLocations] = useState<LoreEntry[]>([])

  const isFriendsOrFoes = category === 'friends' || category === 'foes'
  const isMonsters = category === 'monsters'

  useEffect(() => {
    setView(getStoredView())
  }, [])

  useEffect(() => {
    if (isFriendsOrFoes) {
      Promise.all([
        fetch('/api/the8adventurers/lore?category=factions').then((r) => r.json()),
        fetch('/api/the8adventurers/lore?category=locations').then((r) => r.json()),
      ]).then(([facs, locs]) => {
        setAvailableFactions(Array.isArray(facs) ? facs : [])
        setAvailableLocations(Array.isArray(locs) ? locs : [])
      })
    }
  }, [isFriendsOrFoes])

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

    const payload: Record<string, unknown> = {
      category,
      title: form.title.trim(),
      description: form.description.trim() || null,
      portrait_url: form.portrait_url.trim() || null,
      is_secret: form.is_secret,
      gm_notes: form.gm_notes.trim() || null,
    }

    if (isMonsters) {
      payload.preferred_habitat = form.preferred_habitat.trim() || null
    }
    if (isFriendsOrFoes) {
      payload.faction_ids = form.faction_ids
      payload.location_ids = form.location_ids
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

    // Rebuild linked arrays locally for immediate UI update
    const updatedEntry: LoreEntry = {
      ...json,
      ...(isFriendsOrFoes ? {
        linked_factions: availableFactions
          .filter((f) => form.faction_ids.includes(f.id))
          .map((f): LinkedLoreEntry => ({ id: f.id, title: f.title, category: f.category })),
        linked_locations: availableLocations
          .filter((l) => form.location_ids.includes(l.id))
          .map((l): LinkedLoreEntry => ({ id: l.id, title: l.title, category: l.category })),
      } : {}),
    }

    if (editing) {
      setEntries((prev) => prev.map((e) => e.id === json.id ? updatedEntry : e))
    } else {
      setEntries((prev) => [updatedEntry, ...prev])
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

  const viewingEntry = viewingArticle?.type === 'lore' ? viewingArticle.data : null

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

      <div className="flex items-center mb-6 gap-3">
        <div className="md:hidden">
          <ViewToggle value={view} onChange={handleViewChange} />
        </div>
        <div className="flex-1">
          <p className="section-label">Lore</p>
          <h1 className="font-cinzel text-brand-parchment text-2xl md:text-3xl font-bold">{label}</h1>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <ViewToggle value={view} onChange={handleViewChange} />
          {isAdmin && (
            <button onClick={openCreate} className="btn-primary text-xs">+ Add Entry</button>
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

      {/* Edit / Create modal — near-fullscreen */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 z-50">
          <div
            className="absolute inset-6 bg-brand-card border border-brand-border rounded-sm p-6 overflow-y-auto"
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

            <div className="space-y-4 max-w-2xl">
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

              {/* Preferred Habitat — monsters only */}
              {isMonsters && (
                <div>
                  <label className="section-label block mb-1">Preferred Habitat</label>
                  <input
                    type="text"
                    value={form.preferred_habitat}
                    onChange={(e) => setForm((f) => ({ ...f, preferred_habitat: e.target.value }))}
                    className={inputCls}
                    placeholder="e.g. Deep forests, ancient ruins"
                  />
                </div>
              )}

              {/* Factions + Locations — friends/foes only */}
              {isFriendsOrFoes && (
                <>
                  <MultiSelectField
                    label="Factions"
                    all={availableFactions}
                    selectedIds={form.faction_ids}
                    onAdd={(id) => setForm((f) => ({ ...f, faction_ids: [...f.faction_ids, id] }))}
                    onRemove={(id) => setForm((f) => ({ ...f, faction_ids: f.faction_ids.filter((x) => x !== id) }))}
                    inputCls={inputCls}
                  />
                  <MultiSelectField
                    label="Locations"
                    all={availableLocations}
                    selectedIds={form.location_ids}
                    onAdd={(id) => setForm((f) => ({ ...f, location_ids: [...f.location_ids, id] }))}
                    onRemove={(id) => setForm((f) => ({ ...f, location_ids: f.location_ids.filter((x) => x !== id) }))}
                    inputCls={inputCls}
                  />
                </>
              )}

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
          onEdit={isAdmin && viewingEntry ? () => {
            const freshEntry = entries.find((e) => e.id === viewingEntry.id) ?? viewingEntry
            setViewingArticle(null)
            openEdit(freshEntry)
          } : undefined}
          onToggleSecret={isAdmin && viewingEntry ? () => {
            const freshEntry = entries.find((e) => e.id === viewingEntry.id) ?? viewingEntry
            handleToggleSecret(freshEntry)
          } : undefined}
          onDelete={isAdmin && viewingEntry ? () => {
            const freshEntry = entries.find((e) => e.id === viewingEntry.id) ?? viewingEntry
            setViewingArticle(null)
            handleDeleteEntry(freshEntry)
          } : undefined}
        />
      )}
    </div>
  )
}
