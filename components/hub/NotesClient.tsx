'use client'

import { useEffect, useRef, useState } from 'react'
import { useHub } from './HubContext'

/** Private journal for this campaign. Saves itself a moment after you stop typing. */
export default function NotesClient({ initialContent, updatedAt }: { initialContent: string; updatedAt: string | null }) {
  const { api } = useHub()
  const [content, setContent] = useState(initialContent)
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [savedAt, setSavedAt] = useState<Date | null>(updatedAt ? new Date(updatedAt) : null)
  const last = useRef(initialContent)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (content === last.current) return
    const t = setTimeout(async () => {
      setStatus('saving')
      const res = await fetch(`${api}/notes`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content }) })
      if (res.ok) {
        last.current = content
        setSavedAt(new Date())
        setStatus('saved')
      } else setStatus('error')
    }, 900)
    return () => clearTimeout(t)
  }, [content, api])

  // Don't lose words when closing the tab mid-save
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (content !== last.current) e.preventDefault()
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [content])

  const label =
    status === 'saving' ? 'Saving…' : status === 'error' ? 'Couldn’t save. Check your connection; we’ll retry when you type.' : savedAt && mounted ? `Saved ${savedAt.toLocaleString([], { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}` : savedAt ? 'Saved' : 'Not saved yet'

  return (
    <div className="max-w-[48rem]">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h1 className="font-cinzel text-[2rem] font-bold text-vellum">Your journal</h1>
        <p role="status" className={`text-[0.85rem] ${status === 'error' ? 'text-red-300' : 'text-mist'}`}>{label}</p>
      </div>
      <p className="mt-1 text-mist">Private to you. Other players and the game master don’t see it on the site.</p>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={22}
        aria-label="Journal"
        placeholder="Names you heard, debts you owe, who you don’t trust…"
        className="mt-6 w-full resize-y rounded-2xl border border-umber-line bg-umber/60 px-6 py-5 text-[1.05rem] leading-[1.75] text-prose placeholder:text-mist/40 focus:border-leaf/60 focus:outline-none"
      />
    </div>
  )
}
