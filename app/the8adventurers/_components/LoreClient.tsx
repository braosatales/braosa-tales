'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { LoreEntry, LoreCategory } from '@/lib/the8adventurers/types'

type Props = {
  initialEntries: LoreEntry[]
  category: LoreCategory
  categorySlug: string
  label: string
  isAdmin: boolean
}

const CATEGORY_OPTIONS: { value: LoreCategory; label: string }[] = [
  { value: 'enemy_boss', label: 'Enemies (Bosses)' },
  { value: 'enemy_monster', label: 'Enemies (Monsters)' },
  { value: 'friend', label: 'Friends' },
  { value: 'location', label: 'Locations' },
  { value: 'faction', label: 'Factions' },
]

type FormState = {
  title: string
  content: string
  category: LoreCategory
  image_url: string
  is_secret: boolean
}

function emptyForm(category: LoreCategory): FormState {
  return { title: '', content: '', category, image_url: '', is_secret: true }
}

function SecretBadge() {
  return (
    <span className="inline-block text-[10px] font-cinzel tracking-widest uppercase text-brand-gold-400 bg-brand-gold-400/10 border border-brand-gold-400/30 px-1.5 py-0.5 rounded-sm">
      GM Only
    </span>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 transition-colors duration-200 cursor-pointer ${
        checked ? 'bg-brand-gold-400 border-brand-gold-400' : 'bg-brand-border border-brand-border'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-brand-parchment shadow transition-transform duration-200 ${
          checked ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

export default function LoreClient({ initialEntries, category, label, isAdmin }: Props) {
  const router = useRouter()
  const [entries, setEntries] = useState<LoreEntry[]>(initialEntries)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<LoreEntry | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm(category))
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  function openCreate() {
    setEditing(null)
    setForm(emptyForm(category))
    setErr('')
    setShowModal(true)
  }

  function openEdit(entry: LoreEntry) {
    setEditing(entry)
    setForm({
      title: entry.title,
      content: entry.content ?? '',
      category: entry.category,
      image_url: entry.image_url ?? '',
      is_secret: entry.is_secret,
    })
    setErr('')
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
  }

  async function handleSave() {
    if (!form.title.trim()) { setErr('Title is required'); return }
    setSaving(true)
    setErr('')

    const payload = {
      ...form,
      title: form.title.trim(),
      content: form.content.trim() || null,
      image_url: form.image_url.trim() || null,
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

  async function handleDelete() {
    if (!editing) return
    if (!confirm(`Delete "${editing.title}"?`)) return
    setSaving(true)

    const res = await fetch(`/api/the8adventurers/lore/${editing.id}`, { method: 'DELETE' })
    setSaving(false)

    if (!res.ok) { setErr('Error deleting'); return }
    setEntries((prev) => prev.filter((e) => e.id !== editing.id))
    setShowModal(false)
    router.refresh()
  }

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="section-label">{label}</p>
          <h1 className="font-cinzel text-brand-parchment text-2xl md:text-3xl font-bold">{label}</h1>
        </div>
        {isAdmin && (
          <button onClick={openCreate} className="btn-primary text-xs">
            + Add Entry
          </button>
        )}
      </div>

      {entries.length === 0 && (
        <p className="font-fell text-brand-muted italic">No entries yet.</p>
      )}

      <div className="grid gap-4">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className={`dark-card ${isAdmin ? 'cursor-pointer' : ''}`}
            onClick={isAdmin ? () => openEdit(entry) : undefined}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="font-cinzel text-brand-parchment font-semibold text-base leading-tight">
                {entry.title}
              </h3>
              {isAdmin && entry.is_secret && <SecretBadge />}
            </div>
            {entry.image_url && (
              <img
                src={entry.image_url}
                alt={entry.title}
                className="w-full max-h-48 object-cover rounded-sm mb-3 border border-brand-border"
              />
            )}
            {entry.content && (
              <p className="font-fell text-[#F0E8FF] text-sm leading-relaxed whitespace-pre-wrap">
                {entry.content}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center pt-16 px-4">
          <div
            className="bg-brand-card border border-brand-border rounded-sm p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-cinzel text-brand-parchment font-bold text-lg">
                {editing ? 'Edit Entry' : 'New Entry'}
              </h2>
              <button
                onClick={closeModal}
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
                  className="w-full bg-brand-bg border border-brand-border rounded-sm px-3 py-2 text-brand-parchment font-fell text-sm focus:outline-none focus:border-brand-purple-600"
                  placeholder="Entry title"
                />
              </div>

              <div>
                <label className="section-label block mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as LoreCategory }))}
                  className="w-full bg-brand-bg border border-brand-border rounded-sm px-3 py-2 text-brand-parchment font-fell text-sm focus:outline-none focus:border-brand-purple-600"
                >
                  {CATEGORY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="section-label block mb-1">Content</label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  rows={6}
                  className="w-full bg-brand-bg border border-brand-border rounded-sm px-3 py-2 text-brand-parchment font-fell text-sm focus:outline-none focus:border-brand-purple-600 resize-y"
                  placeholder="Description, lore, notes…"
                />
              </div>

              <div>
                <label className="section-label block mb-1">Image URL</label>
                <input
                  type="text"
                  value={form.image_url}
                  onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
                  className="w-full bg-brand-bg border border-brand-border rounded-sm px-3 py-2 text-brand-parchment font-fell text-sm focus:outline-none focus:border-brand-purple-600"
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

              {err && <p className="text-red-400 text-sm font-fell">{err}</p>}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-primary flex-1 text-xs"
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
                {editing && (
                  <button
                    onClick={handleDelete}
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
    </div>
  )
}
