'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { TimelineEvent } from '@/lib/the8adventurers/types'

type Props = {
  initialEvents: TimelineEvent[]
  isAdmin: boolean
}

type EventForm = {
  title: string
  description: string
  event_date: string
  sort_order: number
  is_secret: boolean
}

function emptyForm(): EventForm {
  return { title: '', description: '', event_date: '', sort_order: 0, is_secret: true }
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
      <span className={`inline-block h-4 w-4 transform rounded-full bg-brand-parchment shadow transition-transform duration-200 ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
    </button>
  )
}

export default function TimelineClient({ initialEvents, isAdmin }: Props) {
  const router = useRouter()
  const [events, setEvents] = useState<TimelineEvent[]>(initialEvents)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<TimelineEvent | null>(null)
  const [form, setForm] = useState<EventForm>(emptyForm())
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  function openCreate() {
    setEditing(null)
    setForm(emptyForm())
    setErr('')
    setShowModal(true)
  }

  function openEdit(ev: TimelineEvent) {
    setEditing(ev)
    setForm({
      title: ev.title,
      description: ev.description ?? '',
      event_date: ev.event_date ?? '',
      sort_order: ev.sort_order,
      is_secret: ev.is_secret,
    })
    setErr('')
    setShowModal(true)
  }

  function closeModal() { setShowModal(false) }

  async function handleSave() {
    if (!form.title.trim()) { setErr('Title is required'); return }
    setSaving(true); setErr('')

    const payload = {
      ...form,
      title: form.title.trim(),
      description: form.description.trim() || null,
      event_date: form.event_date.trim() || null,
    }

    const res = editing
      ? await fetch(`/api/the8adventurers/timeline/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      : await fetch('/api/the8adventurers/timeline', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

    const json = await res.json()
    setSaving(false)
    if (!res.ok) { setErr(json.error ?? 'Error'); return }

    if (editing) {
      setEvents((prev) => prev.map((e) => e.id === json.id ? json : e))
    } else {
      setEvents((prev) => [...prev, json].sort((a, b) => a.sort_order - b.sort_order))
    }
    setShowModal(false)
    router.refresh()
  }

  async function handleDelete() {
    if (!editing) return
    if (!confirm(`Delete "${editing.title}"?`)) return
    setSaving(true)
    const res = await fetch(`/api/the8adventurers/timeline/${editing.id}`, { method: 'DELETE' })
    setSaving(false)
    if (!res.ok) { setErr('Error deleting'); return }
    setEvents((prev) => prev.filter((e) => e.id !== editing.id))
    setShowModal(false)
    router.refresh()
  }

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="section-label">Campaign</p>
          <h1 className="font-cinzel text-brand-parchment text-2xl md:text-3xl font-bold">Timeline</h1>
        </div>
        {isAdmin && (
          <button onClick={openCreate} className="btn-primary text-xs">+ Add Event</button>
        )}
      </div>

      {events.length === 0 && (
        <p className="font-fell text-brand-muted italic">No events yet.</p>
      )}

      {/* Vertical timeline */}
      <div className="relative pl-6">
        <div className="absolute left-0 top-0 bottom-0 w-px bg-brand-border" />

        <div className="space-y-6">
          {events.map((ev) => (
            <div key={ev.id} className="relative">
              {/* Timeline dot */}
              <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full border-2 border-brand-gold-400 bg-brand-bg" />

              <div className={`dark-card ${isAdmin ? 'cursor-pointer' : ''}`} onClick={isAdmin ? () => openEdit(ev) : undefined}>
                <div className="flex items-start justify-between gap-3 mb-1">
                  <div>
                    {ev.event_date && (
                      <p className="section-label mb-0.5">{ev.event_date}</p>
                    )}
                    <h3 className="font-cinzel text-brand-parchment font-semibold text-base">{ev.title}</h3>
                  </div>
                  {isAdmin && ev.is_secret && (
                    <span className="flex-shrink-0 inline-block text-[10px] font-cinzel tracking-widest uppercase text-brand-gold-400 bg-brand-gold-400/10 border border-brand-gold-400/30 px-1.5 py-0.5 rounded-sm">
                      GM Only
                    </span>
                  )}
                </div>
                {ev.description && (
                  <p className="font-fell text-[#F0E8FF] text-sm leading-relaxed whitespace-pre-wrap">
                    {ev.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
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
                {editing ? 'Edit Event' : 'New Event'}
              </h2>
              <button onClick={closeModal} className="text-brand-muted hover:text-brand-parchment text-xl" aria-label="Close">✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="section-label block mb-1">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full bg-brand-bg border border-brand-border rounded-sm px-3 py-2 text-brand-parchment font-fell text-sm focus:outline-none focus:border-brand-purple-600"
                />
              </div>

              <div>
                <label className="section-label block mb-1">In-World Date</label>
                <input
                  type="text"
                  value={form.event_date}
                  onChange={(e) => setForm((f) => ({ ...f, event_date: e.target.value }))}
                  placeholder="e.g. Year 1, Harvestmoon"
                  className="w-full bg-brand-bg border border-brand-border rounded-sm px-3 py-2 text-brand-parchment font-fell text-sm focus:outline-none focus:border-brand-purple-600"
                />
              </div>

              <div>
                <label className="section-label block mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={5}
                  className="w-full bg-brand-bg border border-brand-border rounded-sm px-3 py-2 text-brand-parchment font-fell text-sm focus:outline-none focus:border-brand-purple-600 resize-y"
                />
              </div>

              <div>
                <label className="section-label block mb-1">Sort Order</label>
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm((f) => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))}
                  className="w-32 bg-brand-bg border border-brand-border rounded-sm px-3 py-2 text-brand-parchment font-fell text-sm focus:outline-none focus:border-brand-purple-600"
                />
              </div>

              <div className="flex items-center gap-3">
                <Toggle checked={form.is_secret} onChange={(v) => setForm((f) => ({ ...f, is_secret: v }))} />
                <span className="font-fell text-sm text-brand-muted">
                  {form.is_secret ? 'GM Only' : 'Visible to players'}
                </span>
              </div>

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
