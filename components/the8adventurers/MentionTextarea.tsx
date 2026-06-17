'use client'

import { useRef, useState } from 'react'

// Inline link token syntax: @[Article Title](lore_entry_id)
// Autocomplete fetches all lore entries lazily on first @ keystroke.

type MentionEntry = { id: string; title: string }

type Props = {
  value: string
  onChange: (val: string) => void
  rows?: number
  placeholder?: string
  className?: string
}

export default function MentionTextarea({ value, onChange, rows = 6, placeholder, className }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [entries, setEntries] = useState<MentionEntry[]>([])
  const [entriesLoaded, setEntriesLoaded] = useState(false)
  const [mentionQuery, setMentionQuery] = useState<string | null>(null)
  const [mentionStart, setMentionStart] = useState(0)

  async function loadEntries() {
    if (entriesLoaded) return
    try {
      const res = await fetch('/api/the8adventurers/lore')
      if (res.ok) {
        const data: MentionEntry[] = await res.json()
        setEntries(data.map((e) => ({ id: e.id, title: e.title })))
      }
    } catch {
      // silently fail — autocomplete is best-effort
    }
    setEntriesLoaded(true)
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value
    onChange(val)

    const cursor = e.target.selectionStart
    const textBefore = val.slice(0, cursor)
    const atIndex = textBefore.lastIndexOf('@')

    if (atIndex >= 0) {
      const textAfterAt = textBefore.slice(atIndex + 1)
      // Show dropdown only while typing a continuous word after @, not if already a complete token
      if (
        !textAfterAt.includes('\n') &&
        !textAfterAt.startsWith('[') &&
        textAfterAt.length <= 60
      ) {
        if (!entriesLoaded) loadEntries()
        setMentionQuery(textAfterAt)
        setMentionStart(atIndex)
        return
      }
    }

    setMentionQuery(null)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (mentionQuery !== null && e.key === 'Escape') {
      e.preventDefault()
      setMentionQuery(null)
    }
  }

  function selectMention(entry: MentionEntry) {
    const before = value.slice(0, mentionStart)
    const after = value.slice(mentionStart + 1 + (mentionQuery?.length ?? 0))
    onChange(`${before}@[${entry.title}](${entry.id})${after}`)
    setMentionQuery(null)
    setTimeout(() => textareaRef.current?.focus(), 0)
  }

  const filtered =
    mentionQuery !== null
      ? entries
          .filter((e) => e.title.toLowerCase().includes(mentionQuery.toLowerCase()))
          .slice(0, 8)
      : []

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={() => setTimeout(() => setMentionQuery(null), 150)}
        rows={rows}
        placeholder={placeholder}
        className={className}
      />
      {mentionQuery !== null && filtered.length > 0 && (
        <div className="absolute z-20 left-0 right-0 bg-brand-card border border-brand-border rounded-sm shadow-lg max-h-48 overflow-y-auto" style={{ top: '100%' }}>
          {filtered.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); selectMention(entry) }}
              className="w-full text-left px-3 py-2 text-sm font-fell text-brand-parchment hover:bg-brand-purple-600/20 transition-colors border-b border-brand-border/40 last:border-b-0"
            >
              {entry.title}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
