'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import ArticleModal, { type ArticleModalData } from './ArticleModal'
import { useHub } from './HubContext'

type Result = { id: string; type: 'lore' | 'quest' | 'achievement' | 'player'; title: string; category?: string; is_secret?: boolean }

const TYPE_LABEL: Record<Result['type'], string> = { lore: 'Lore', quest: 'Quest', achievement: 'Achievement', player: 'Character' }

export default function HubSearch() {
  const { api, gm } = useHub()
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [index, setIndex] = useState<Result[] | null>(null)
  const [active, setActive] = useState(0)
  const [article, setArticle] = useState<ArticleModalData | null>(null)
  const [loading, setLoading] = useState(false)
  const box = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    input.current?.focus()
    if (!index) fetch(`${api}/search`).then((r) => (r.ok ? r.json() : { results: [] })).then((j) => setIndex(j.results ?? [])).catch(() => setIndex([]))
    function onDown(e: MouseEvent) {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open, index, api])

  // "/" opens search
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(t.tagName) && !t.isContentEditable) {
        e.preventDefault()
        setOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const results = q.trim().length >= 2 && index ? index.filter((r) => r.title.toLowerCase().includes(q.trim().toLowerCase())).slice(0, 8) : []

  const openResult = useCallback(
    async (r: Result) => {
      setOpen(false)
      setQ('')
      setLoading(true)
      try {
        if (r.type === 'lore') {
          const res = await fetch(`${api}/lore/${r.id}`)
          if (res.ok) setArticle({ type: 'lore', data: await res.json() })
        } else if (r.type === 'quest') {
          const [qr, pr, ar] = await Promise.all([fetch(`${api}/quests/${r.id}`), fetch(`${api}/players`), fetch(`${api}/achievements`)])
          if (qr.ok) setArticle({ type: 'quest', data: await qr.json(), players: pr.ok ? await pr.json() : [], achievements: ar.ok ? await ar.json() : [] })
        } else if (r.type === 'achievement') {
          const [ar, pr] = await Promise.all([fetch(`${api}/achievements/${r.id}`), fetch(`${api}/players`)])
          if (ar.ok) setArticle({ type: 'achievement', data: await ar.json(), players: pr.ok ? await pr.json() : [] })
        } else {
          const pr = await fetch(`${api}/players/${r.id}`)
          if (pr.ok) setArticle({ type: 'player', data: await pr.json() })
        }
      } finally {
        setLoading(false)
      }
    },
    [api]
  )

  return (
    <div ref={box} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Search this campaign"
        aria-expanded={open}
        title="Search (press /)"
        className="flex h-9 w-9 items-center justify-center rounded-full text-mist transition-colors hover:bg-plum hover:text-leaf-soft"
      >
        {loading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-mist/30 border-t-leaf" aria-hidden="true" />
        ) : (
          <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" strokeLinecap="round" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[min(26rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-plum-line bg-plum shadow-2xl shadow-black/50">
          <div className="border-b border-plum-line p-2">
            <input
              ref={input}
              value={q}
              onChange={(e) => {
                setQ(e.target.value)
                setActive(0)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setOpen(false)
                if (e.key === 'ArrowDown') setActive((a) => Math.min(a + 1, results.length - 1))
                if (e.key === 'ArrowUp') setActive((a) => Math.max(a - 1, 0))
                if (e.key === 'Enter' && results[active]) openResult(results[active])
              }}
              placeholder="Search lore, quests, characters…"
              aria-label="Search this campaign"
              className="w-full rounded-xl bg-night px-4 py-2.5 text-prose placeholder:text-mist/50 focus:outline-none focus:ring-1 focus:ring-leaf/60"
            />
          </div>
          {q.trim().length >= 2 && (
            <ul className="max-h-80 overflow-y-auto py-1">
              {index === null && <li className="px-4 py-3 text-[0.9rem] text-mist">Loading…</li>}
              {index && results.length === 0 && <li className="px-4 py-3 text-[0.9rem] text-mist">Nothing by that name.</li>}
              {results.map((r, i) => (
                <li key={`${r.type}-${r.id}`}>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault()
                      openResult(r)
                    }}
                    onMouseEnter={() => setActive(i)}
                    className={`flex w-full items-baseline gap-3 px-4 py-2.5 text-left ${i === active ? 'bg-night/70' : ''}`}
                  >
                    <span className="w-24 shrink-0 text-[0.78rem] text-ember">{TYPE_LABEL[r.type]}</span>
                    <span className="min-w-0 flex-1 truncate text-vellum">{r.title}</span>
                    {gm && r.is_secret && <span className="shrink-0 text-[0.75rem] text-leaf-soft">Secret</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {article && <ArticleModal article={article} isAdmin={gm} onClose={() => setArticle(null)} />}
    </div>
  )
}
