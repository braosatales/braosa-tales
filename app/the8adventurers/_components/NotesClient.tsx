'use client'

import { useState } from 'react'

type Props = {
  initialContent: string
}

export default function NotesClient({ initialContent }: Props) {
  const [content, setContent] = useState(initialContent)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const [err, setErr] = useState('')

  async function handleSave() {
    setSaving(true)
    setErr('')

    const res = await fetch('/api/the8adventurers/notes', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    })

    const json = await res.json()
    setSaving(false)

    if (!res.ok) { setErr(json.error ?? 'Error saving'); return }
    setSavedAt(new Date())
  }

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      <div className="mb-6">
        <p className="section-label">Sessions</p>
        <h1 className="font-cinzel text-brand-parchment text-2xl md:text-3xl font-bold">My Notes</h1>
        <p className="font-fell text-brand-muted text-sm mt-1">Personal scratch pad — only you can see this.</p>
      </div>

      <div className="dark-card space-y-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={20}
          className="w-full bg-brand-bg border border-brand-border rounded-sm px-4 py-3 text-brand-parchment font-fell text-sm leading-relaxed focus:outline-none focus:border-brand-purple-600 resize-y"
          placeholder="Your private notes for this campaign…"
        />

        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary text-xs"
          >
            {saving ? 'Saving…' : 'Save Notes'}
          </button>

          {savedAt && !saving && (
            <span className="font-fell text-brand-muted text-xs">
              Saved at {savedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}

          {err && <span className="text-red-400 text-xs font-fell">{err}</span>}
        </div>
      </div>
    </div>
  )
}
