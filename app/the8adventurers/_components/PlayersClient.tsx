'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { VisiblePlayerData } from '@/lib/the8adventurers/getVisiblePlayerFields'
import ViewToggle, { type ViewMode } from '@/components/the8adventurers/ViewToggle'
import CardMenu from '@/components/the8adventurers/CardMenu'
import ArticleModal, { type ArticleModalData } from '@/components/the8adventurers/ArticleModal'

type Props = {
  initialPlayers: VisiblePlayerData[]
  isAdmin: boolean
}

function getStoredView(): ViewMode {
  if (typeof window === 'undefined') return 'grid'
  return (localStorage.getItem('the8_view_players') as ViewMode) ?? 'grid'
}

export default function PlayersClient({ initialPlayers, isAdmin }: Props) {
  const router = useRouter()
  const [players, setPlayers] = useState<VisiblePlayerData[]>(initialPlayers)
  const [view, setView] = useState<ViewMode>('grid')
  const [viewingArticle, setViewingArticle] = useState<ArticleModalData | null>(null)
  const [viewingPlayer, setViewingPlayer] = useState<VisiblePlayerData | null>(null)
  const [err, setErr] = useState('')

  useEffect(() => {
    setView(getStoredView())
  }, [])

  function handleViewChange(v: ViewMode) {
    setView(v)
    if (typeof window !== 'undefined') localStorage.setItem('the8_view_players', v)
  }

  function openView(player: VisiblePlayerData) {
    setViewingPlayer(player)
    setViewingArticle({ type: 'player', data: player })
  }

  async function handleDelete(player: VisiblePlayerData) {
    const res = await fetch(`/api/the8adventurers/players/${player.id}`, { method: 'DELETE' })
    if (!res.ok) { setErr('Error deleting player'); return }
    setPlayers((prev) => prev.filter((p) => p.id !== player.id))
    router.refresh()
  }

  const portrait = (p: VisiblePlayerData) => ('portrait_url' in p ? p.portrait_url : null) ?? null

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      {/* Mobile fixed "+" add button — matches Lore/Quests/Achievements pattern */}
      {isAdmin && (
        <a
          href="/the8adventurers/players/new"
          className="md:hidden fixed top-4 right-14 z-40 w-9 h-9 bg-brand-purple-600 hover:bg-brand-purple-400 rounded-sm text-brand-parchment flex items-center justify-center transition-colors text-lg font-bold"
          aria-label="Add Player"
          title="Add Player"
        >
          +
        </a>
      )}

      <div className="flex items-center mb-3 md:mb-6 gap-3">
        <div className="flex-1">
          <p className="section-label">Campaign</p>
          <h1 className="font-cinzel text-brand-parchment text-2xl md:text-3xl font-bold">Players</h1>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <ViewToggle value={view} onChange={handleViewChange} />
          {isAdmin && (
            <a
              href="/the8adventurers/players/new"
              className="btn-primary text-xs"
            >
              + Add Player
            </a>
          )}
        </div>
      </div>
      <div className="md:hidden mb-6 flex">
        <div className="ml-auto w-[76px]">
          <ViewToggle value={view} onChange={handleViewChange} fullWidth />
        </div>
      </div>

      {err && <p className="text-red-400 text-sm font-fell mb-4">{err}</p>}

      {players.length === 0 && (
        <p className="font-fell text-brand-muted italic">No players yet.</p>
      )}

      {view === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {players.map((player) => {
            const url = portrait(player)
            return (
              <div
                key={player.id}
                className="relative dark-card flex flex-col overflow-hidden cursor-pointer"
                onClick={() => openView(player)}
              >
                <div className="absolute top-2 right-2 z-10">
                  <CardMenu
                    isAdmin={isAdmin}
                    onEdit={isAdmin ? () => router.push(`/the8adventurers/players/${player.id}`) : undefined}
                    onDelete={isAdmin ? () => handleDelete(player) : undefined}
                  />
                </div>
                {url ? (
                  <img src={url} alt={player.name} className="w-full h-32 object-cover rounded-sm mb-3 border border-brand-border" />
                ) : (
                  <div className="w-full h-32 bg-brand-border/20 rounded-sm mb-3 flex items-center justify-center">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-brand-border">
                      <circle cx="16" cy="12" r="6" /><path d="M4 28c0-6.627 5.373-12 12-12s12 5.373 12 12" />
                    </svg>
                  </div>
                )}
                <h3 className="font-cinzel text-brand-parchment font-semibold text-base leading-tight mb-1 pr-8">
                  {player.name}
                </h3>
                <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
                  {('level' in player) && player.level !== null && (
                    <span className="text-[10px] font-cinzel tracking-widest uppercase text-brand-gold-300 bg-brand-gold-400/10 border border-brand-gold-400/30 px-1.5 py-0.5 rounded-sm">
                      Lvl {player.level}
                    </span>
                  )}
                  {('class' in player) && player.class && (
                    <span className="text-[10px] font-cinzel tracking-widest uppercase text-brand-purple-200 bg-brand-purple-600/10 border border-brand-purple-600/30 px-1.5 py-0.5 rounded-sm">
                      {player.class}
                    </span>
                  )}
                  {('race' in player) && player.race && (
                    <span className="text-[10px] font-cinzel tracking-widest uppercase text-brand-muted bg-brand-border/20 border border-brand-border px-1.5 py-0.5 rounded-sm">
                      {player.race}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="space-y-1.5">
          {players.map((player) => {
            const url = portrait(player)
            return (
              <div
                key={player.id}
                className="group relative flex items-center gap-2 bg-brand-card border border-brand-border rounded-sm px-3 py-2 hover:border-brand-purple-600/50 transition-colors duration-200 cursor-pointer"
                onClick={() => openView(player)}
              >
                {url ? (
                  <img src={url} alt={player.name} className="w-8 h-8 object-cover rounded-sm border border-brand-border flex-shrink-0" />
                ) : (
                  <div className="w-8 h-8 bg-brand-border/20 rounded-sm flex-shrink-0 flex items-center justify-center">
                    <svg width="14" height="14" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-brand-border">
                      <circle cx="16" cy="12" r="6" /><path d="M4 28c0-6.627 5.373-12 12-12s12 5.373 12 12" />
                    </svg>
                  </div>
                )}
                <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
                  <h3 className="font-cinzel text-brand-parchment font-semibold text-sm leading-tight truncate">
                    {player.name}
                  </h3>
                  {('level' in player) && player.level !== null && (
                    <span className="text-[10px] font-cinzel tracking-widest uppercase text-brand-gold-300 bg-brand-gold-400/10 border border-brand-gold-400/30 px-1.5 py-0.5 rounded-sm flex-shrink-0">
                      Lvl {player.level}
                    </span>
                  )}
                  {('class' in player) && player.class && (
                    <span className="text-[10px] font-cinzel tracking-widest uppercase text-brand-purple-200 bg-brand-purple-600/10 border border-brand-purple-600/30 px-1.5 py-0.5 rounded-sm flex-shrink-0 hidden sm:inline">
                      {player.class}
                    </span>
                  )}
                </div>
                <CardMenu
                  variant="list"
                  isAdmin={isAdmin}
                  onEdit={isAdmin ? () => router.push(`/the8adventurers/players/${player.id}`) : undefined}
                  onDelete={isAdmin ? () => handleDelete(player) : undefined}
                />
              </div>
            )
          })}
        </div>
      )}

      {viewingArticle && (
        <ArticleModal
          article={viewingArticle}
          isAdmin={isAdmin}
          onClose={() => { setViewingArticle(null); setViewingPlayer(null) }}
          onEdit={isAdmin && viewingPlayer ? () => {
            setViewingArticle(null)
            setViewingPlayer(null)
            router.push(`/the8adventurers/players/${viewingPlayer.id}`)
          } : undefined}
          onDelete={isAdmin && viewingPlayer ? () => {
            const p = viewingPlayer
            setViewingArticle(null)
            setViewingPlayer(null)
            handleDelete(p)
          } : undefined}
        />
      )}
    </div>
  )
}
