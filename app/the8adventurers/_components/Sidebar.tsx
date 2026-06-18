'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef, useCallback } from 'react'
import ArticleModal, { type ArticleModalData } from '@/components/the8adventurers/ArticleModal'
import type { VisiblePlayerData } from '@/lib/the8adventurers/getVisiblePlayerFields'

type Props = { isAdmin: boolean }

type SearchResult = {
  id: string
  type: 'lore' | 'quest' | 'achievement' | 'player'
  title: string
  category?: string
  status?: string
  is_secret?: boolean
}

const TYPE_COLORS: Record<SearchResult['type'], string> = {
  lore: 'text-brand-purple-200 bg-brand-purple-600/20 border-brand-purple-600/40',
  quest: 'text-brand-gold-300 bg-brand-gold-400/10 border-brand-gold-400/30',
  achievement: 'text-green-400 bg-green-400/10 border-green-400/30',
  player: 'text-brand-parchment/70 bg-brand-border/20 border-brand-border',
}

const LORE_LINKS = [
  { href: '/the8adventurers/lore/history', label: 'History' },
  { href: '/the8adventurers/lore/locations', label: 'Locations' },
  { href: '/the8adventurers/lore/friends', label: 'Friends' },
  { href: '/the8adventurers/lore/foes', label: 'Foes' },
  { href: '/the8adventurers/lore/factions', label: 'Factions' },
  { href: '/the8adventurers/lore/monsters', label: 'Monsters' },
]

const SESSION_LINKS = [
  { href: '/the8adventurers/sessions/recaps', label: 'Recaps' },
  { href: '/the8adventurers/sessions/notes', label: 'My Notes' },
]

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`block pl-6 py-1.5 text-sm font-fell transition-colors ${
        active ? 'text-brand-gold-300' : 'text-brand-muted hover:text-brand-parchment'
      }`}
    >
      {label}
    </Link>
  )
}

function TopLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`block px-4 py-2 text-xs font-cinzel tracking-widest uppercase transition-colors ${
        active ? 'text-brand-gold-300' : 'text-brand-muted hover:text-brand-parchment'
      }`}
    >
      {label}
    </Link>
  )
}

function ExpandableSection({
  label,
  open,
  onToggle,
  children,
}: {
  label: string
  open: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="flex items-center gap-2 w-full px-4 py-2 text-xs font-cinzel tracking-widest uppercase text-brand-muted hover:text-brand-parchment transition-colors"
      >
        <span className={`transition-transform duration-150 text-[10px] ${open ? 'rotate-90' : 'rotate-0'}`}>
          ▶
        </span>
        {label}
      </button>
      {open && <div className="pb-1">{children}</div>}
    </div>
  )
}

export default function Sidebar({ isAdmin }: Props) {
  const pathname = usePathname()
  const isOnLore = pathname.startsWith('/the8adventurers/lore')
  const isOnSessions = pathname.startsWith('/the8adventurers/sessions')

  const [loreOpen, setLoreOpen] = useState(isOnLore)
  const [sessionsOpen, setSessionsOpen] = useState(isOnSessions)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [allResults, setAllResults] = useState<SearchResult[]>([])
  const [searchFetched, setSearchFetched] = useState(false)
  const [loadingModal, setLoadingModal] = useState(false)
  const [viewingArticle, setViewingArticle] = useState<ArticleModalData | null>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOnLore) setLoreOpen(true)
    if (isOnSessions) setSessionsOpen(true)
  }, [isOnLore, isOnSessions])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  // Outside-click to close search dropdown — must use mousedown, not onBlur
  useEffect(() => {
    if (!searchQuery) return
    function handler(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchQuery('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [searchQuery])

  async function fetchSearchIndex() {
    if (searchFetched) return
    try {
      const res = await fetch('/api/the8adventurers/search')
      if (res.ok) {
        const json = await res.json()
        setAllResults(json.results ?? [])
      }
    } catch {
      // best-effort
    }
    setSearchFetched(true)
  }

  const filteredResults = searchQuery.length >= 2
    ? allResults
        .filter((r) => r.title.toLowerCase().includes(searchQuery.toLowerCase()))
        .slice(0, 8)
    : []

  const handleResultClick = useCallback(async (result: SearchResult) => {
    setSearchQuery('')
    setLoadingModal(true)

    try {
      if (result.type === 'lore') {
        const res = await fetch(`/api/the8adventurers/lore/${result.id}`)
        if (res.ok) {
          const data = await res.json()
          setViewingArticle({ type: 'lore', data })
        }
      } else if (result.type === 'quest') {
        const [questRes, playersRes, achRes] = await Promise.all([
          fetch(`/api/the8adventurers/quests/${result.id}`),
          fetch('/api/the8adventurers/players'),
          fetch('/api/the8adventurers/achievements'),
        ])
        if (questRes.ok) {
          const [data, playersData, achData] = await Promise.all([
            questRes.json(),
            playersRes.ok ? playersRes.json() : [],
            achRes.ok ? achRes.json() : [],
          ])
          setViewingArticle({ type: 'quest', data, players: playersData, achievements: achData })
        }
      } else if (result.type === 'achievement') {
        const [achRes, playersRes] = await Promise.all([
          fetch(`/api/the8adventurers/achievements/${result.id}`),
          fetch('/api/the8adventurers/players'),
        ])
        if (achRes.ok) {
          const [data, playersData] = await Promise.all([
            achRes.json(),
            playersRes.ok ? playersRes.json() : [],
          ])
          setViewingArticle({ type: 'achievement', data, players: playersData })
        }
      } else if (result.type === 'player') {
        const playerRes = await fetch(`/api/the8adventurers/players/${result.id}`)
        if (playerRes.ok) {
          const visibleData: VisiblePlayerData = await playerRes.json()
          setViewingArticle({ type: 'player', data: visibleData })
        }
      }
    } catch {
      // silently fail
    }

    setLoadingModal(false)
  }, [isAdmin])

  return (
    <>
      <button
        onClick={() => setMobileOpen((v) => !v)}
        className="fixed top-4 right-4 z-50 md:hidden flex items-center justify-center w-9 h-9 bg-brand-card border border-brand-border rounded-sm text-brand-gold-400"
        aria-label="Toggle menu"
      >
        {mobileOpen ? '✕' : '☰'}
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-40
          w-56 flex-shrink-0 flex flex-col
          bg-brand-card border-r border-brand-border
          transition-transform duration-200 ease-in-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="px-4 py-5 border-b border-brand-border">
          <p className="section-label mb-0.5">Campaign Hub</p>
          <h2 className="font-cinzel text-brand-parchment text-sm font-bold leading-tight">
            The Eight<br />Adventurers
          </h2>
          {isAdmin && (
            <span className="mt-1 inline-block text-[10px] font-cinzel tracking-widest uppercase text-brand-gold-400 bg-brand-gold-400/10 px-1.5 py-0.5 rounded-sm">
              GM
            </span>
          )}
        </div>

        {/* Search input */}
        <div className="px-3 py-2 border-b border-brand-border relative" ref={searchRef}>
          <div className="relative">
            <svg
              className="absolute left-2 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none"
              width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"
              aria-hidden="true"
            >
              <circle cx="7" cy="7" r="5" />
              <path d="M11 11L14 14" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={fetchSearchIndex}
              placeholder="Search articles…"
              className="w-full bg-brand-bg border border-brand-border rounded-sm pl-7 pr-7 py-1.5 text-brand-parchment font-fell text-xs focus:outline-none focus:border-brand-purple-600 placeholder:text-brand-muted"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-parchment transition-colors text-xs"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Dropdown */}
          {searchQuery.length >= 2 && (
            <div className="absolute left-3 right-3 top-full mt-1 bg-brand-card border border-brand-border rounded-sm shadow-lg max-h-64 overflow-y-auto z-50">
              {loadingModal ? (
                <p className="px-3 py-2 text-xs font-fell text-brand-muted italic">Loading…</p>
              ) : filteredResults.length === 0 ? (
                <p className="px-3 py-2 text-xs font-fell text-brand-muted italic">No articles found.</p>
              ) : (
                filteredResults.map((r) => (
                  <button
                    key={`${r.type}-${r.id}`}
                    onMouseDown={(e) => { e.preventDefault(); handleResultClick(r) }}
                    className="w-full text-left px-3 py-2 hover:bg-brand-purple-600/20 transition-colors border-b border-brand-border/30 last:border-b-0 flex items-start gap-2"
                  >
                    <span className={`text-[9px] font-cinzel tracking-widest uppercase px-1.5 py-0.5 rounded-sm border flex-shrink-0 mt-0.5 ${TYPE_COLORS[r.type]}`}>
                      {r.type}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="font-fell text-brand-parchment text-xs block truncate">{r.title}</span>
                      {r.category && (
                        <span className="font-fell text-brand-muted text-[10px] block">{r.category}</span>
                      )}
                    </span>
                    {isAdmin && r.is_secret && (
                      <span className="text-[9px] font-cinzel text-brand-gold-400 bg-brand-gold-400/10 px-1 py-0.5 rounded-sm border border-brand-gold-400/30 flex-shrink-0">
                        GM
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-3">
          {/* Lore */}
          <ExpandableSection label="Lore" open={loreOpen} onToggle={() => setLoreOpen((v) => !v)}>
            {LORE_LINKS.map((l) => (
              <NavLink key={l.href} href={l.href} label={l.label} active={pathname === l.href} />
            ))}
          </ExpandableSection>

          <TopLink
            href="/the8adventurers/players"
            label="Players"
            active={pathname.startsWith('/the8adventurers/players')}
          />
          <TopLink
            href="/the8adventurers/quests"
            label="Quests"
            active={pathname.startsWith('/the8adventurers/quests')}
          />
          <TopLink
            href="/the8adventurers/achievements"
            label="Achievements"
            active={pathname.startsWith('/the8adventurers/achievements')}
          />
          <TopLink
            href="/the8adventurers/timeline"
            label="Timeline"
            active={pathname.startsWith('/the8adventurers/timeline')}
          />
          <TopLink
            href="/the8adventurers/world-map"
            label="World Map"
            active={pathname.startsWith('/the8adventurers/world-map')}
          />

          <ExpandableSection label="Sessions" open={sessionsOpen} onToggle={() => setSessionsOpen((v) => !v)}>
            {SESSION_LINKS.map((l) => (
              <NavLink key={l.href} href={l.href} label={l.label} active={pathname === l.href} />
            ))}
          </ExpandableSection>
        </nav>
      </aside>

      {viewingArticle && (
        <ArticleModal
          article={viewingArticle}
          isAdmin={isAdmin}
          onClose={() => setViewingArticle(null)}
        />
      )}
    </>
  )
}
