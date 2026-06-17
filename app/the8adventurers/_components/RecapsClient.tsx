'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { SessionRecap } from '@/lib/the8adventurers/types'

type Props = {
  initialRecaps: SessionRecap[]
  isAdmin: boolean
}

type RecapForm = {
  session_number: string
  title: string
  content: string
  session_date: string
}

function emptyForm(): RecapForm {
  return { session_number: '', title: '', content: '', session_date: '' }
}

export default function RecapsClient({ initialRecaps, isAdmin }: Props) {
  const router = useRouter()
  const [recaps, setRecaps] = useState<SessionRecap[]>(initialRecaps)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<SessionRecap | null>(null)
  const [form, setForm] = useState<RecapForm>(emptyForm())
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function openCreate() {
    setEditing(null)
    setForm(emptyForm())
    setErr('')
    setShowModal(true)
  }

  function openEdit(r: SessionRecap) {
    setEditing(r)
    setForm({
      session_number: r.session_number?.toString() ?? '',
      title: r.title ?? '',
      content: r.content ?? '',
      session_date: r.session_date ?? '',
    })
    setErr('')
    setShowModal(true)
  }

  function closeModal() { setShowModal(false) }

  async function handleSave() {
    setSaving(true); setErr('')

    const payload = {
      session_number: form.session_number ? parseInt(form.session_number) : null,
      title: form.title.trim() || null,
      content: form.content.trim() || null,
      session_date: form.session_date || null,
    }

    const res = editing
      ? await fetch(`/api/the8adventurers/recaps/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      : await fetch('/api/the8adventurers/recaps', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

    const json = await res.json()
    setSaving(false)
    if (!res.ok) { setErr(json.error ?? 'Error'); return }

    if (editing) {
      setRecaps((prev) => prev.map((r) => r.id === json.id ? json : r))
    } else {
      setRecaps((prev) => [json, ...prev])
    }
    setShowModal(false)
    router.refresh()
  }

  async function handleDelete() {
    if (!editing) return
    if (!confirm('Delete this recap?')) return
    setSaving(true)
    const res = await fetch(`/api/the8adventurers/recaps/${editing.id}`, { method: 'DELETE' })
    setSaving(false)
    if (!res.ok) { setErr('Error deleting'); return }
    setRecaps((prev) => prev.filter((r) => r.id !== editing.id))
    setShowModal(false)
    router.refresh()
  }

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="section-label">Sessions</p>
          <h1 className="font-cinzel text-brand-parchment text-2xl md:text-3xl font-bold">Recaps</h1>
        </div>
        {isAdmin && (
          <button onClick={openCreate} className="btn-primary text-xs">+ Add Recap</button>
        )}
      </div>

      {recaps.length === 0 && (
        <p className="font-fell text-brand-muted italic">No session recaps yet.</p>
      )}

      <div className="space-y-4">
        {recaps.map((r) => {
          const isExp = expanded.has(r.id)
          return (
            <div key={r.id} className="dark-card">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => toggleExpand(r.id)}
                    className="flex items-center gap-2 text-left w-full"
                  >
                    <span className={`text-[10px] text-brand-muted transition-transform duration-150 flex-shrink-0 ${isExp ? 'rotate-90' : ''}`}>▶</span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {r.session_number != null && (
                          <span className="section-label mb-0 text-[10px]">Session {r.session_number}</span>
                        )}
                        {r.session_date && (
                          <span className="text-[10px] font-cinzel text-brand-muted tracking-wide">
                            {new Date(r.session_date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        )}
                      </div>
                      {r.title && (
                        <h3 className="font-cinzel text-brand-parchment font-semibold text-base leading-tight">
                          {r.title}
                        </h3>
                      )}
                    </div>
                  </button>

                  {isExp && r.content && (
                    <p className="mt-3 font-fell text-[#F0E8FF] text-sm leading-relaxed whitespace-pre-wrap pl-5">
                      {r.content}
                    </p>
                  )}
                </div>

                {isAdmin && (
                  <button
                    onClick={(e) => { e.stopPropagation(); openEdit(r) }}
                    className="flex-shrink-0 text-brand-muted hover:text-brand-gold-300 transition-colors text-xs font-cinzel tracking-wide"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center pt-16 px-4">
          <div
            className="bg-brand-card border border-brand-border rounded-sm p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-cinzel text-brand-parchment font-bold text-lg">
                {editing ? 'Edit Recap' : 'New Recap'}
              </h2>
              <button onClick={closeModal} className="text-brand-muted hover:text-brand-parchment text-xl" aria-label="Close">✕</button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="section-label block mb-1">Session #</label>
                  <input
                    type="number"
                    value={form.session_number}
                    onChange={(e) => setForm((f) => ({ ...f, session_number: e.target.value }))}
                    className="w-full bg-brand-bg border border-brand-border rounded-sm px-3 py-2 text-brand-parchment font-fell text-sm focus:outline-none focus:border-brand-purple-600"
                  />
                </div>
                <div>
                  <label className="section-label block mb-1">Date</label>
                  <input
                    type="date"
                    value={form.session_date}
                    onChange={(e) => setForm((f) => ({ ...f, session_date: e.target.value }))}
                    className="w-full bg-brand-bg border border-brand-border rounded-sm px-3 py-2 text-brand-parchment font-fell text-sm focus:outline-none focus:border-brand-purple-600"
                  />
                </div>
              </div>

              <div>
                <label className="section-label block mb-1">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full bg-brand-bg border border-brand-border rounded-sm px-3 py-2 text-brand-parchment font-fell text-sm focus:outline-none focus:border-brand-purple-600"
                />
              </div>

              <div>
                <label className="section-label block mb-1">Content</label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  rows={8}
                  className="w-full bg-brand-bg border border-brand-border rounded-sm px-3 py-2 text-brand-parchment font-fell text-sm focus:outline-none focus:border-brand-purple-600 resize-y"
                  placeholder="What happened this session…"
                />
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
