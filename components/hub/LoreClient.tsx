'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { LoreEntry, LoreCategory } from '@/lib/hub/types'
import Toggle from '@/components/hub/Toggle'
import SecretBadge from '@/components/hub/SecretBadge'
import BlockEditor, { type EditBlock, toEditBlocks, toBlockPayload } from '@/components/hub/BlockEditor'
import { IconEye } from '@/components/hub/RevealIcons'
import { stripMentions } from '@/lib/hub/mentions'
import ViewToggle, { type ViewMode } from '@/components/hub/ViewToggle'
import CardMenu from '@/components/hub/CardMenu'
import ArticleModal, { type ArticleModalData } from '@/components/hub/ArticleModal'
import { useHub } from '@/components/hub/HubContext'

type Props = {
  initialEntries: LoreEntry[]
  category: LoreCategory
  label: string
  isAdmin: boolean
}

type LinkSel = { id: string; is_revealed: boolean }

type FormState = {
  title: string
  blocks: EditBlock[]
  portrait_url: string
  is_secret: boolean
  gm_notes: string
  preferred_habitat: string
  faction_links: LinkSel[]
  location_links: LinkSel[]
}

function emptyForm(): FormState {
  return {
    title: '', blocks: [{ key: 'new-first', body: '', is_revealed: false }], portrait_url: '', is_secret: true, gm_notes: '',
    preferred_habitat: '', faction_links: [], location_links: [],
  }
}

function entryToForm(e: LoreEntry): FormState {
  const blocks = toEditBlocks(e.blocks)
  return {
    title: e.title,
    blocks: blocks.length ? blocks : [{ key: 'new-first', body: '', is_revealed: false }],
    portrait_url: e.portrait_url ?? '',
    is_secret: e.is_secret,
    gm_notes: e.gm_notes ?? '',
    preferred_habitat: e.preferred_habitat ?? '',
    faction_links: (e.linked_factions ?? []).map((f) => ({ id: f.id, is_revealed: !!f.is_revealed })),
    location_links: (e.linked_locations ?? []).map((l) => ({ id: l.id, is_revealed: !!l.is_revealed })),
  }
}

/** Card preview: the first block the viewer can see, without mention markup. */
const preview = (e: LoreEntry) => (e.blocks?.[0]?.body ? stripMentions(e.blocks[0].body) : null)

function getStoredView(): ViewMode {
  if (typeof window === 'undefined') return 'grid'
  return (localStorage.getItem('the8_view_lore') as ViewMode) ?? 'grid'
}

// Multi-select field for factions or locations. Each chosen link has its own reveal switch.
function MultiSelectField({
  label,
  all,
  selected: chosen,
  onChange,
  inputCls,
}: {
  label: string
  all: LoreEntry[]
  selected: LinkSel[]
  onChange: (links: LinkSel[]) => void
  inputCls: string
}) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const selectedIds = chosen.map((c) => c.id)
  const revealed = (id: string) => chosen.find((c) => c.id === id)?.is_revealed ?? false
  const onAdd = (id: string) => onChange([...chosen, { id, is_revealed: false }])
  const onRemove = (id: string) => onChange(chosen.filter((c) => c.id !== id))
  const onToggle = (id: string) => onChange(chosen.map((c) => (c.id === id ? { ...c, is_revealed: !c.is_revealed } : c)))

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
              className={`inline-flex items-center gap-1 font-fell text-xs px-2 py-0.5 rounded-lg ${revealed(e.id) ? 'text-amethyst bg-amethyst-deep/20 border border-amethyst-deep/30' : 'text-mist border border-dashed border-plum-line'}`}
            >
              <button
                type="button"
                onClick={() => onToggle(e.id)}
                className="mr-0.5 opacity-80 hover:opacity-100"
                aria-pressed={revealed(e.id)}
                title={revealed(e.id) ? 'Players can see this link. Click to hide it.' : 'Hidden from players. Click to reveal.'}
              >
                <IconEye off={!revealed(e.id)} size={11} />
              </button>
              {e.title}
              <button
                type="button"
                onClick={() => onRemove(e.id)}
                className="text-mist hover:text-red-400 transition-colors leading-none ml-0.5"
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
          <div className="absolute z-20 left-0 right-0 top-full mt-0.5 bg-night border border-plum-line rounded-lg max-h-40 overflow-y-auto shadow-lg">
            {filtered.map((e) => (
              <button
                key={e.id}
                type="button"
                onClick={() => { onAdd(e.id); setQuery(''); inputRef.current?.focus() }}
                className="w-full text-left px-3 py-2 font-fell text-sm text-vellum hover:bg-amethyst-deep/20 transition-colors"
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
  const { api } = useHub()
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

  const isMonsters = category === 'monsters'

  useEffect(() => {
    setView(getStoredView())
  }, [])

  // Any entry can belong to factions and sit in locations (a shop in a town, a town in a region).
  useEffect(() => {
    if (!isAdmin) return
    Promise.all([
      fetch(`${api}/lore?category=factions`).then((r) => r.json()),
      fetch(`${api}/lore?category=locations`).then((r) => r.json()),
    ]).then(([facs, locs]) => {
      setAvailableFactions(Array.isArray(facs) ? facs : [])
      setAvailableLocations(Array.isArray(locs) ? locs : [])
    })
  }, [api, isAdmin])

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
    await fetch(`${api}/lore/${entry.id}`, {
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
      blocks: toBlockPayload(form.blocks),
      portrait_url: form.portrait_url.trim() || null,
      is_secret: form.is_secret,
      gm_notes: form.gm_notes.trim() || null,
      faction_links: form.faction_links,
      location_links: form.location_links,
    }

    if (isMonsters) {
      payload.preferred_habitat = form.preferred_habitat.trim() || null
    }

    const res = editing
      ? await fetch(`${api}/lore/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      : await fetch(`${api}/lore`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

    const json = await res.json()
    setSaving(false)
    if (!res.ok) { setErr(json.error ?? 'Error saving'); return }

    // The API returns the entry exactly as the GM sees it: blocks, links and all.
    const updatedEntry: LoreEntry = json

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
    const res = await fetch(`${api}/lore/${entry.id}`, { method: 'DELETE' })
    setSaving(false)
    if (!res.ok) { setErr('Error deleting'); return }
    setEntries((prev) => prev.filter((e) => e.id !== entry.id))
    if (editing?.id === entry.id) setShowModal(false)
    router.refresh()
  }

  const inputCls = 'w-full bg-night border border-plum-line rounded-lg px-3 py-2 text-vellum font-fell text-sm focus:outline-none focus:border-amethyst-deep'

  const viewingEntry = viewingArticle?.type === 'lore' ? viewingArticle.data : null

  return (
    <div>

      <div className="flex items-center mb-3 md:mb-6 gap-3">
        <div className="flex-1">
          <h1 className="font-cinzel text-vellum text-[2rem] font-bold leading-tight">{label}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ViewToggle value={view} onChange={handleViewChange} />
          {isAdmin && (
            <button onClick={openCreate} className="btn-primary">+ Add Entry</button>
          )}
        </div>
      </div>

      {entries.length === 0 && (
        <p className="font-fell text-mist italic">No entries yet.</p>
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
                  className="w-full h-32 object-cover rounded-lg mb-3 border border-plum-line"
                />
              )}
              <h3 className="font-cinzel text-vellum font-semibold text-base leading-tight mb-1 pr-8">
                {entry.title}
              </h3>
              {isAdmin && entry.is_secret && <div className="mb-1"><SecretBadge /></div>}
              {preview(entry) && (
                <p className="font-fell text-mist text-sm leading-relaxed line-clamp-2">
                  {preview(entry)}
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
              className="group relative flex items-center gap-2 bg-plum border border-plum-line rounded-lg px-3 py-2 hover:border-amethyst-deep/50 transition-colors duration-200 cursor-pointer"
              onClick={() => openView(entry)}
            >
              {entry.portrait_url ? (
                <img
                  src={entry.portrait_url}
                  alt={entry.title}
                  className="w-8 h-8 object-cover rounded-lg border border-plum-line flex-shrink-0"
                />
              ) : (
                <div className="w-8 h-8 bg-plum-line/20 rounded-lg flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
                <h3 className="font-cinzel text-vellum font-semibold text-sm leading-tight truncate">
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
        <div className="fixed inset-0 bg-night/80 backdrop-blur-sm z-[60]">
          <div
            className="absolute inset-6 bg-plum border border-plum-line rounded-2xl p-6 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-cinzel text-vellum font-bold text-lg">
                {editing ? 'Edit Entry' : 'New Entry'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-mist hover:text-vellum transition-colors text-xl leading-none"
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

              <div className="flex items-center gap-3">
                <Toggle
                  checked={!form.is_secret}
                  onChange={(v) => setForm((f) => ({ ...f, is_secret: !v }))}
                />
                <span className="font-fell text-sm text-mist">
                  {form.is_secret ? 'Entry hidden: players don’t know it exists yet' : 'Entry visible: players see the title and any revealed blocks'}
                </span>
              </div>

              <BlockEditor
                value={form.blocks}
                onChange={(blocks) => setForm((f) => ({ ...f, blocks }))}
                inputCls={inputCls}
                entryVisible={!form.is_secret}
              />

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

              {/* Factions + Locations: any entry can have them; each link is revealed separately */}
              <div className="space-y-3">
                <p className="text-[0.8rem] text-mist">Links start hidden. Click the eye on a link to let players see it.</p>
                <MultiSelectField
                  label="Factions"
                  all={availableFactions.filter((x) => x.id !== editing?.id)}
                  selected={form.faction_links}
                  onChange={(faction_links) => setForm((f) => ({ ...f, faction_links }))}
                  inputCls={inputCls}
                />
                <MultiSelectField
                  label="Locations"
                  all={availableLocations.filter((x) => x.id !== editing?.id)}
                  selected={form.location_links}
                  onChange={(location_links) => setForm((f) => ({ ...f, location_links }))}
                  inputCls={inputCls}
                />
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
                    className="btn-outline text-red-400 border-red-400/40 hover:bg-red-400/10"
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
          onLoreChange={(changed) => setEntries((prev) => prev.map((e) => (e.id === changed.id ? changed : e)))}
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
