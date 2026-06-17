'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Quest, QuestItem } from '@/lib/the8adventurers/types'

type Props = {
  initialQuests: Quest[]
  isAdmin: boolean
}

type QuestFormState = {
  title: string
  description: string
  is_secret: boolean
  sort_order: number
}

function emptyQuestForm(): QuestFormState {
  return { title: '', description: '', is_secret: true, sort_order: 0 }
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onChange(!checked) }}
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

function SecretBadge() {
  return (
    <span className="inline-block text-[10px] font-cinzel tracking-widest uppercase text-brand-gold-400 bg-brand-gold-400/10 border border-brand-gold-400/30 px-1.5 py-0.5 rounded-sm">
      GM Only
    </span>
  )
}

export default function QuestsClient({ initialQuests, isAdmin }: Props) {
  const router = useRouter()
  const [quests, setQuests] = useState<Quest[]>(initialQuests)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [showModal, setShowModal] = useState(false)
  const [editingQuest, setEditingQuest] = useState<Quest | null>(null)
  const [questForm, setQuestForm] = useState<QuestFormState>(emptyQuestForm())
  const [newItemLabel, setNewItemLabel] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function openCreate() {
    setEditingQuest(null)
    setQuestForm(emptyQuestForm())
    setErr('')
    setShowModal(true)
  }

  function openEdit(q: Quest) {
    setEditingQuest(q)
    setQuestForm({
      title: q.title,
      description: q.description ?? '',
      is_secret: q.is_secret,
      sort_order: q.sort_order,
    })
    setErr('')
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
  }

  async function saveQuest() {
    if (!questForm.title.trim()) { setErr('Title is required'); return }
    setSaving(true); setErr('')

    const payload = { ...questForm, title: questForm.title.trim(), description: questForm.description.trim() || null }

    const res = editingQuest
      ? await fetch(`/api/the8adventurers/quests/${editingQuest.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      : await fetch('/api/the8adventurers/quests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

    const json = await res.json()
    setSaving(false)
    if (!res.ok) { setErr(json.error ?? 'Error'); return }

    if (editingQuest) {
      setQuests((prev) => prev.map((q) => q.id === json.id ? { ...q, ...json } : q))
    } else {
      setQuests((prev) => [...prev, { ...json, the8_quest_items: [] }])
    }
    setShowModal(false)
    router.refresh()
  }

  async function deleteQuest() {
    if (!editingQuest) return
    if (!confirm(`Delete quest "${editingQuest.title}"?`)) return
    setSaving(true)
    const res = await fetch(`/api/the8adventurers/quests/${editingQuest.id}`, { method: 'DELETE' })
    setSaving(false)
    if (!res.ok) { setErr('Error deleting'); return }
    setQuests((prev) => prev.filter((q) => q.id !== editingQuest.id))
    setShowModal(false)
    router.refresh()
  }

  async function toggleQuestDone(q: Quest) {
    const updated = !q.is_done
    setQuests((prev) => prev.map((x) => x.id === q.id ? { ...x, is_done: updated } : x))
    await fetch(`/api/the8adventurers/quests/${q.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_done: updated }),
    })
    router.refresh()
  }

  async function toggleItemDone(questId: string, item: QuestItem) {
    const updated = !item.is_done
    setQuests((prev) => prev.map((q) =>
      q.id !== questId ? q : {
        ...q,
        the8_quest_items: q.the8_quest_items.map((i) =>
          i.id === item.id ? { ...i, is_done: updated } : i
        ),
      }
    ))
    await fetch(`/api/the8adventurers/quests/${questId}/items/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_done: updated }),
    })
    router.refresh()
  }

  async function addItem(questId: string) {
    const label = (newItemLabel[questId] ?? '').trim()
    if (!label) return
    const res = await fetch(`/api/the8adventurers/quests/${questId}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label }),
    })
    const json = await res.json()
    if (!res.ok) return
    setQuests((prev) => prev.map((q) =>
      q.id !== questId ? q : { ...q, the8_quest_items: [...q.the8_quest_items, json] }
    ))
    setNewItemLabel((prev) => ({ ...prev, [questId]: '' }))
    router.refresh()
  }

  async function deleteItem(questId: string, item: QuestItem) {
    await fetch(`/api/the8adventurers/quests/${questId}/items/${item.id}`, { method: 'DELETE' })
    setQuests((prev) => prev.map((q) =>
      q.id !== questId ? q : { ...q, the8_quest_items: q.the8_quest_items.filter((i) => i.id !== item.id) }
    ))
    router.refresh()
  }

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="section-label">Campaign</p>
          <h1 className="font-cinzel text-brand-parchment text-2xl md:text-3xl font-bold">Quests</h1>
        </div>
        {isAdmin && (
          <button onClick={openCreate} className="btn-primary text-xs">+ Add Quest</button>
        )}
      </div>

      {quests.length === 0 && (
        <p className="font-fell text-brand-muted italic">No quests yet.</p>
      )}

      <div className="space-y-4">
        {quests.map((q) => {
          const isExp = expanded.has(q.id)
          const items = [...q.the8_quest_items].sort((a, b) => a.sort_order - b.sort_order)
          return (
            <div key={q.id} className="dark-card">
              <div className="flex items-start gap-3">
                {/* Done checkbox — admin only */}
                {isAdmin && (
                  <input
                    type="checkbox"
                    checked={q.is_done}
                    onChange={() => toggleQuestDone(q)}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-1 flex-shrink-0 accent-brand-gold-400 w-4 h-4 cursor-pointer"
                  />
                )}

                {/* Title row */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => toggleExpand(q.id)}
                      className="flex items-center gap-2 text-left"
                    >
                      <span className={`text-[10px] text-brand-muted transition-transform duration-150 ${isExp ? 'rotate-90' : ''}`}>
                        ▶
                      </span>
                      <h3 className={`font-cinzel font-semibold text-base leading-tight transition-colors ${q.is_done ? 'line-through text-brand-muted' : 'text-brand-parchment'}`}>
                        {q.title}
                      </h3>
                    </button>
                    {isAdmin && q.is_secret && <SecretBadge />}
                  </div>

                  {q.description && (
                    <p className="font-fell text-brand-muted text-sm mt-1 leading-relaxed">
                      {q.description}
                    </p>
                  )}

                  {/* Quest items */}
                  {isExp && (
                    <div className="mt-3 pl-2 space-y-2">
                      {items.map((item) => (
                        <div key={item.id} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={item.is_done}
                            onChange={() => isAdmin ? toggleItemDone(q.id, item) : undefined}
                            disabled={!isAdmin}
                            className="accent-brand-gold-400 w-4 h-4 flex-shrink-0 cursor-pointer disabled:cursor-default"
                          />
                          <span className={`font-fell text-sm ${item.is_done ? 'line-through text-brand-muted' : 'text-[#F0E8FF]'}`}>
                            {item.label}
                          </span>
                          {isAdmin && (
                            <button
                              onClick={() => deleteItem(q.id, item)}
                              className="text-brand-muted hover:text-red-400 transition-colors text-xs ml-auto"
                              aria-label="Delete item"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}

                      {isAdmin && (
                        <div className="flex gap-2 mt-2">
                          <input
                            type="text"
                            value={newItemLabel[q.id] ?? ''}
                            onChange={(e) => setNewItemLabel((prev) => ({ ...prev, [q.id]: e.target.value }))}
                            onKeyDown={(e) => e.key === 'Enter' && addItem(q.id)}
                            placeholder="New checklist item…"
                            className="flex-1 bg-brand-bg border border-brand-border rounded-sm px-2 py-1 text-brand-parchment font-fell text-xs focus:outline-none focus:border-brand-purple-600"
                          />
                          <button
                            onClick={() => addItem(q.id)}
                            className="btn-outline text-[10px] px-2 py-1"
                          >
                            Add
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Admin edit button */}
                {isAdmin && (
                  <button
                    onClick={(e) => { e.stopPropagation(); openEdit(q) }}
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

      {/* Quest modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center pt-16 px-4">
          <div
            className="bg-brand-card border border-brand-border rounded-sm p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-cinzel text-brand-parchment font-bold text-lg">
                {editingQuest ? 'Edit Quest' : 'New Quest'}
              </h2>
              <button onClick={closeModal} className="text-brand-muted hover:text-brand-parchment transition-colors text-xl" aria-label="Close">✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="section-label block mb-1">Title *</label>
                <input
                  type="text"
                  value={questForm.title}
                  onChange={(e) => setQuestForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full bg-brand-bg border border-brand-border rounded-sm px-3 py-2 text-brand-parchment font-fell text-sm focus:outline-none focus:border-brand-purple-600"
                />
              </div>

              <div>
                <label className="section-label block mb-1">Description</label>
                <textarea
                  value={questForm.description}
                  onChange={(e) => setQuestForm((f) => ({ ...f, description: e.target.value }))}
                  rows={4}
                  className="w-full bg-brand-bg border border-brand-border rounded-sm px-3 py-2 text-brand-parchment font-fell text-sm focus:outline-none focus:border-brand-purple-600 resize-y"
                />
              </div>

              <div>
                <label className="section-label block mb-1">Sort Order</label>
                <input
                  type="number"
                  value={questForm.sort_order}
                  onChange={(e) => setQuestForm((f) => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))}
                  className="w-32 bg-brand-bg border border-brand-border rounded-sm px-3 py-2 text-brand-parchment font-fell text-sm focus:outline-none focus:border-brand-purple-600"
                />
              </div>

              <div className="flex items-center gap-3">
                <Toggle
                  checked={questForm.is_secret}
                  onChange={(v) => setQuestForm((f) => ({ ...f, is_secret: v }))}
                />
                <span className="font-fell text-sm text-brand-muted">
                  {questForm.is_secret ? 'GM Only' : 'Visible to players'}
                </span>
              </div>

              {err && <p className="text-red-400 text-sm font-fell">{err}</p>}

              <div className="flex gap-3 pt-2">
                <button onClick={saveQuest} disabled={saving} className="btn-primary flex-1 text-xs">
                  {saving ? 'Saving…' : 'Save'}
                </button>
                {editingQuest && (
                  <button onClick={deleteQuest} disabled={saving} className="btn-outline text-xs text-red-400 border-red-400/40 hover:bg-red-400/10">
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
