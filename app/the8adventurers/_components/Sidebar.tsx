'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

type Props = { isAdmin: boolean }

const LORE_LINKS = [
  { href: '/the8adventurers/lore/enemy-boss', label: 'Enemies (Bosses)' },
  { href: '/the8adventurers/lore/enemy-monster', label: 'Enemies (Monsters)' },
  { href: '/the8adventurers/lore/friend', label: 'Friends' },
  { href: '/the8adventurers/lore/location', label: 'Locations' },
  { href: '/the8adventurers/lore/faction', label: 'Factions' },
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
        active
          ? 'text-brand-gold-300'
          : 'text-brand-muted hover:text-brand-parchment'
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
        active
          ? 'text-brand-gold-300'
          : 'text-brand-muted hover:text-brand-parchment'
      }`}
    >
      {label}
    </Link>
  )
}

export default function Sidebar({ isAdmin }: Props) {
  const pathname = usePathname()
  const isOnLore = pathname.startsWith('/the8adventurers/lore')
  const isOnSessions = pathname.startsWith('/the8adventurers/sessions')

  const [loreOpen, setLoreOpen] = useState(isOnLore)
  const [sessionsOpen, setSessionsOpen] = useState(isOnSessions)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (isOnLore) setLoreOpen(true)
    if (isOnSessions) setSessionsOpen(true)
  }, [isOnLore, isOnSessions])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen((v) => !v)}
        className="fixed top-4 left-4 z-50 md:hidden flex items-center justify-center w-9 h-9 bg-brand-card border border-brand-border rounded-sm text-brand-gold-400"
        aria-label="Toggle menu"
      >
        {mobileOpen ? '✕' : '☰'}
      </button>

      {/* Overlay on mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-40
          w-56 flex-shrink-0 flex flex-col
          bg-brand-card border-r border-brand-border
          transition-transform duration-200 ease-in-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Header */}
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

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3">

          {/* Lore (expandable) */}
          <div>
            <button
              onClick={() => setLoreOpen((v) => !v)}
              className="flex items-center gap-2 w-full px-4 py-2 text-xs font-cinzel tracking-widest uppercase text-brand-muted hover:text-brand-parchment transition-colors"
            >
              <span
                className={`transition-transform duration-150 text-[10px] ${loreOpen ? 'rotate-90' : 'rotate-0'}`}
              >
                ▶
              </span>
              Lore
            </button>
            {loreOpen && (
              <div className="pb-1">
                {LORE_LINKS.map((l) => (
                  <NavLink key={l.href} href={l.href} label={l.label} active={pathname === l.href} />
                ))}
              </div>
            )}
          </div>

          {/* Top-level links */}
          <TopLink
            href="/the8adventurers/quests"
            label="Quests"
            active={pathname.startsWith('/the8adventurers/quests')}
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

          {/* Sessions (expandable) */}
          <div>
            <button
              onClick={() => setSessionsOpen((v) => !v)}
              className="flex items-center gap-2 w-full px-4 py-2 text-xs font-cinzel tracking-widest uppercase text-brand-muted hover:text-brand-parchment transition-colors"
            >
              <span
                className={`transition-transform duration-150 text-[10px] ${sessionsOpen ? 'rotate-90' : 'rotate-0'}`}
              >
                ▶
              </span>
              Sessions
            </button>
            {sessionsOpen && (
              <div className="pb-1">
                {SESSION_LINKS.map((l) => (
                  <NavLink key={l.href} href={l.href} label={l.label} active={pathname === l.href} />
                ))}
              </div>
            )}
          </div>
        </nav>
      </aside>
    </>
  )
}
