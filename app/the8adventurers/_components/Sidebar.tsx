'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

type PlayerRef = { id: string; name: string }
type Props = { isAdmin: boolean; players: PlayerRef[] }

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

export default function Sidebar({ isAdmin, players }: Props) {
  const pathname = usePathname()
  const isOnLore = pathname.startsWith('/the8adventurers/lore')
  const isOnSessions = pathname.startsWith('/the8adventurers/sessions')
  const isOnPlayers = pathname.startsWith('/the8adventurers/players')

  const [loreOpen, setLoreOpen] = useState(isOnLore)
  const [sessionsOpen, setSessionsOpen] = useState(isOnSessions)
  const [playersOpen, setPlayersOpen] = useState(isOnPlayers)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (isOnLore) setLoreOpen(true)
    if (isOnSessions) setSessionsOpen(true)
    if (isOnPlayers) setPlayersOpen(true)
  }, [isOnLore, isOnSessions, isOnPlayers])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  return (
    <>
      <button
        onClick={() => setMobileOpen((v) => !v)}
        className="fixed top-4 left-4 z-50 md:hidden flex items-center justify-center w-9 h-9 bg-brand-card border border-brand-border rounded-sm text-brand-gold-400"
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

        <nav className="flex-1 overflow-y-auto py-3">
          {/* Lore */}
          <ExpandableSection label="Lore" open={loreOpen} onToggle={() => setLoreOpen((v) => !v)}>
            {LORE_LINKS.map((l) => (
              <NavLink key={l.href} href={l.href} label={l.label} active={pathname === l.href} />
            ))}
          </ExpandableSection>

          {/* Players */}
          <ExpandableSection label="Players" open={playersOpen} onToggle={() => setPlayersOpen((v) => !v)}>
            {isAdmin && (
              <Link
                href="/the8adventurers/players/new"
                className="flex items-center gap-1.5 pl-6 py-1.5 text-sm font-fell text-brand-gold-400 hover:text-brand-gold-300 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="text-base leading-none">+</span> Add Player
              </Link>
            )}
            {players.map((p) => (
              <NavLink
                key={p.id}
                href={`/the8adventurers/players/${p.id}`}
                label={p.name}
                active={pathname === `/the8adventurers/players/${p.id}`}
              />
            ))}
            {players.length === 0 && (
              <p className="pl-6 py-1.5 text-xs font-fell text-brand-muted italic">No players yet</p>
            )}
          </ExpandableSection>

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
    </>
  )
}
