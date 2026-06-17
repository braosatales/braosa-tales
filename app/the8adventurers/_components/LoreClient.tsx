'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { LoreEntry, LoreCategory } from '@/lib/the8adventurers/types'
import RichCard from '@/components/the8adventurers/RichCard'
import Toggle from '@/components/the8adventurers/Toggle'
import SecretBadge from '@/components/the8adventurers/SecretBadge'
import MentionTextarea from '@/components/the8adventurers/MentionTextarea'

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
}

function emptyForm(): FormState {
  return { title: '', description: '', portrait_url: '', is_secret: true }
}

function entryToForm(e: LoreEntry): FormState {
  return {
    title: e.title,
    description: e.description ?? '',
    portrait_url: e.portrait_url ?? '',
    is_secret: e.is_secret,
  }
}

export default function LoreClient({ initialEntries, category, label, isAdmin }: Props) {
  const router = useRouter()
  const [entries, setEntries] = useState<LoreEntry[]>(initialEntries)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<LoreEntry | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm())
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

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

  async function handleSave() {
    if (!form.title.trim()) { setErr('Title is required'); return }
    setSaving(true); setErr('')

    const payload = {
      category,
      title: form.title.trim(),
      description: form.description.trim() || null,
      portrait_url: form.portrait_url.trim() || null,
      is_secret: form.is_secret,
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

  const inputCls = 'w-full bg-brand-bg border border-brand-border rounded-sm px-3 py-2 text-brand-parchment font-fell text-sm focus:outline-none focus:border-brand-purple-600'

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="section-label">Lore</p>
          <h1 className="font-cinzel text-brand-parchment text-2xl md:text-3xl font-bold">{label}</h1>
        </div>
        {isAdmin && (
          <button onClick={openCreate} className="btn-primary text-xs">+ Add Entry</button>
        )}
      </div>

      {entries.length === 0 && (
        <p className="font-fell text-brand-muted italic">No entries yet.</p>
      )}

      <div className="grid gap-4">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className={isAdmin ? 'cursor-pointer' : ''}
            onClick={isAdmin ? () => openEdit(entry) : undefined}
          >
            <RichCard portrait_url={entry.portrait_url} title={entry.title} description={entry.description}>
              {isAdmin && entry.is_secret && (
                <div className="mt-3">
                  <SecretBadge />
                </div>
              )}
            </RichCard>
          </div>
        ))}
      </div>

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

              {err && <p className="text-red-400 text-sm font-fell">{err}</p>}

              <div className="flex gap-3 pt-2">
                <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 text-xs">
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
