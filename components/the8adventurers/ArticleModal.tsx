'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import type { LoreEntry, Quest, Achievement, Player, QuestItem, QuestStatus } from '@/lib/the8adventurers/types'
import type { VisiblePlayerData } from '@/lib/the8adventurers/getVisiblePlayerFields'
import SecretBadge from './SecretBadge'

function renderMentions(text: string): React.ReactNode[] {
  const MENTION_RE = /@\[([^\]]+)\]\(([a-f0-9-]+)\)/g
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = MENTION_RE.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<React.Fragment key={`t-${lastIndex}`}>{text.slice(lastIndex, match.index)}</React.Fragment>)
    }
    const [, title, id] = match
    parts.push(
      <Link
        key={`l-${id}-${match.index}`}
        href={`/the8adventurers/lore/entry/${id}`}
        className="text-brand-gold-300 underline decoration-brand-gold-400/50 hover:text-brand-gold-400 transition-colors"
      >
        {title}
      </Link>
    )
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < text.length) {
    parts.push(<React.Fragment key="t-end">{text.slice(lastIndex)}</React.Fragment>)
  }
  return parts
}

function HpBar({ current, max }: { current: number; max: number }) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (current / max) * 100)) : 0
  const color = pct > 60 ? 'bg-green-500' : pct > 30 ? 'bg-brand-gold-400' : 'bg-red-500'
  return (
    <div className="space-y-1">
      <div className="flex justify-between font-fell text-sm text-brand-parchment">
        <span>HP</span>
        <span>{current} / {max}</span>
      </div>
      <div className="bg-brand-border rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

const STAT_KEYS = [
  { key: 'stat_strength' as const, label: 'STR' },
  { key: 'stat_dexterity' as const, label: 'DEX' },
  { key: 'stat_constitution' as const, label: 'CON' },
  { key: 'stat_intelligence' as const, label: 'INT' },
  { key: 'stat_wisdom' as const, label: 'WIS' },
  { key: 'stat_charisma' as const, label: 'CHA' },
]

function modifier(score: number) {
  const mod = Math.floor((score - 10) / 2)
  return mod >= 0 ? `+${mod}` : `${mod}`
}

function GmNotes({ notes }: { notes: string | null | undefined }) {
  if (!notes) return null
  return (
    <div className="mt-4 border-l-2 border-red-800/60 pl-3">
      <p className="section-label text-red-400/80 mb-1">GM Notes</p>
      <p className="font-fell text-brand-muted text-sm whitespace-pre-wrap leading-relaxed">{notes}</p>
    </div>
  )
}

const STATUS_LABELS: Record<QuestStatus, string> = {
  in_progress: 'In Progress',
  available: 'Available',
  completed: 'Completed',
  failed: 'Failed',
}
const STATUS_COLORS: Record<QuestStatus, string> = {
  in_progress: 'text-brand-gold-300 bg-brand-gold-400/10 border-brand-gold-400/30',
  available: 'text-brand-muted bg-brand-border/20 border-brand-border',
  completed: 'text-green-400 bg-green-400/10 border-green-400/30',
  failed: 'text-red-400 bg-red-400/10 border-red-400/30',
}
const CURRENCY_LABELS = [
  { key: 'reward_platinum' as const, label: 'Pt', color: 'text-brand-muted' },
  { key: 'reward_gold' as const, label: 'Gp', color: 'text-brand-gold-300' },
  { key: 'reward_electrum' as const, label: 'Ep', color: 'text-brand-purple-400' },
  { key: 'reward_silver' as const, label: 'Sp', color: 'text-brand-parchment/70' },
  { key: 'reward_copper' as const, label: 'Cp', color: 'text-orange-400' },
]

// ─── View: Lore ────────────────────────────────────────────────
function LoreView({
  data,
  isAdmin,
  onNavigate,
}: {
  data: LoreEntry
  isAdmin: boolean
  onNavigate?: (id: string) => void
}) {
  const showFactions = (data.category === 'friends' || data.category === 'foes') && (data.linked_factions ?? []).length > 0
  const showLocations = (data.category === 'friends' || data.category === 'foes') && (data.linked_locations ?? []).length > 0
  const showHabitat = data.category === 'monsters' && data.preferred_habitat

  return (
    <>
      {data.portrait_url && (
        <img src={data.portrait_url} alt={data.title} className="w-full max-h-56 object-cover rounded-sm mb-4 border border-brand-border" />
      )}
      <div className="flex items-center gap-2 flex-wrap mb-3">
        {isAdmin && data.is_secret && <SecretBadge />}
      </div>
      <h2 className="font-cinzel text-brand-parchment font-bold text-xl mb-3">{data.title}</h2>
      {data.description && (
        <div className="font-fell text-[#F0E8FF] text-sm leading-relaxed whitespace-pre-wrap mb-3">
          {renderMentions(data.description)}
        </div>
      )}
      {showHabitat && (
        <div className="font-fell text-sm text-brand-muted mb-2">
          Preferred Habitat: <span className="text-[#F0E8FF]">{data.preferred_habitat}</span>
        </div>
      )}
      {showFactions && (
        <div className="flex flex-wrap items-center gap-1.5 mb-2">
          <span className="font-fell text-xs text-brand-muted">Faction:</span>
          {(data.linked_factions ?? []).map((f) => (
            <button
              key={f.id}
              onClick={onNavigate ? () => onNavigate(f.id) : undefined}
              disabled={!onNavigate}
              className={`font-fell text-xs text-brand-purple-200 bg-brand-purple-900/30 border border-brand-purple-600/30 px-2 py-0.5 rounded-sm transition-colors ${onNavigate ? 'hover:bg-brand-purple-600/30 cursor-pointer' : 'cursor-default'}`}
            >
              {f.title}
            </button>
          ))}
        </div>
      )}
      {showLocations && (
        <div className="flex flex-wrap items-center gap-1.5 mb-2">
          <span className="font-fell text-xs text-brand-muted">Location:</span>
          {(data.linked_locations ?? []).map((l) => (
            <button
              key={l.id}
              onClick={onNavigate ? () => onNavigate(l.id) : undefined}
              disabled={!onNavigate}
              className={`font-fell text-xs text-brand-gold-300 bg-brand-gold-400/10 border border-brand-gold-400/30 px-2 py-0.5 rounded-sm transition-colors ${onNavigate ? 'hover:bg-brand-gold-400/20 cursor-pointer' : 'cursor-default'}`}
            >
              {l.title}
            </button>
          ))}
        </div>
      )}
      {isAdmin && <GmNotes notes={data.gm_notes} />}
    </>
  )
}

// ─── View: Quest ───────────────────────────────────────────────
function QuestView({
  data,
  isAdmin,
  players,
  achievements,
  onItemToggle,
}: {
  data: Quest
  isAdmin: boolean
  players: Player[]
  achievements: Achievement[]
  onItemToggle?: (questId: string, item: QuestItem) => void
}) {
  const [items, setItems] = useState<QuestItem[]>(
    [...(data.the8_quest_items ?? [])].sort((a, b) => a.sort_order - b.sort_order)
  )

  async function toggleItem(item: QuestItem) {
    const updated = !item.is_done
    setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, is_done: updated } : i))
    if (onItemToggle) {
      onItemToggle(data.id, { ...item, is_done: updated })
    } else {
      await fetch(`/api/the8adventurers/quests/${data.id}/items/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_done: updated }),
      })
    }
  }

  const linkedPlayers = players.filter((p) =>
    (data.the8_quest_players ?? []).some((qp) => qp.player_id === p.id)
  )
  const rewardAchievement = achievements.find((a) => a.id === data.reward_achievement_id)

  const hasCurrency = (data.reward_platinum ?? 0) > 0 || (data.reward_gold ?? 0) > 0 ||
    (data.reward_electrum ?? 0) > 0 || (data.reward_silver ?? 0) > 0 || (data.reward_copper ?? 0) > 0
  const hasReward = hasCurrency || (data.the8_quest_exp ?? []).length > 0 ||
    rewardAchievement || data.reward_items || data.reward_other

  return (
    <>
      {data.portrait_url && (
        <img src={data.portrait_url} alt={data.title} className="w-full max-h-56 object-cover rounded-sm mb-4 border border-brand-border" />
      )}
      <div className="flex items-center gap-2 flex-wrap mb-3">
        <span className={`text-[10px] font-cinzel tracking-widest uppercase px-2 py-0.5 rounded-sm border ${STATUS_COLORS[data.status]}`}>
          {STATUS_LABELS[data.status]}
        </span>
        {isAdmin && data.is_secret && <SecretBadge />}
      </div>
      <h2 className="font-cinzel text-brand-parchment font-bold text-xl mb-3">{data.title}</h2>

      {linkedPlayers.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {linkedPlayers.map((p) => (
            <span key={p.id} className="flex items-center gap-1.5 font-fell text-xs text-brand-purple-200 bg-brand-purple-900/30 border border-brand-purple-600/30 px-2 py-0.5 rounded-sm">
              {p.portrait_url && (
                <img src={p.portrait_url} alt={p.name} className="w-4 h-4 rounded-full object-cover" />
              )}
              {p.name}
            </span>
          ))}
        </div>
      )}

      {data.description && (
        <div className="font-fell text-[#F0E8FF] text-sm leading-relaxed whitespace-pre-wrap mb-3">
          {renderMentions(data.description)}
        </div>
      )}

      {items.length > 0 && (
        <div className="space-y-2 mb-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={item.is_done}
                onChange={isAdmin ? () => toggleItem(item) : undefined}
                disabled={!isAdmin}
                className="accent-brand-gold-400 w-4 h-4 flex-shrink-0 cursor-pointer disabled:cursor-default"
              />
              <span className={`font-fell text-sm ${item.is_done ? 'line-through text-brand-muted' : 'text-[#F0E8FF]'}`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {hasReward && (
        <div className="border-t border-brand-border pt-3 space-y-2">
          <p className="section-label">Rewards</p>
          {hasCurrency && (
            <div className="flex flex-wrap gap-4">
              {CURRENCY_LABELS.map(({ key, label, color }) => {
                const amount = (data as Record<string, unknown>)[key] as number
                return amount > 0 ? (
                  <span key={key} className={`inline-flex items-center gap-1 font-cinzel text-xs ${color}`}>
                    <span className="font-bold">{amount}</span>
                    <span className="opacity-70">{label}</span>
                  </span>
                ) : null
              })}
            </div>
          )}
          {(data.the8_quest_exp ?? []).length > 0 && (
            <div className="flex flex-wrap gap-3">
              {(data.the8_quest_exp ?? []).map((exp) => {
                const player = players.find((p) => p.id === exp.player_id)
                if (!player) return null
                return (
                  <span key={exp.player_id} className="font-fell text-xs text-brand-muted">
                    {player.name}: <span className="text-brand-purple-200">+{exp.exp_amount} XP</span>
                  </span>
                )
              })}
            </div>
          )}
          {rewardAchievement && (
            <div className="font-fell text-xs text-brand-gold-300">🏅 Unlocks: {rewardAchievement.title}</div>
          )}
          {data.reward_items && (
            <div className="font-fell text-xs text-brand-muted">
              Items: <span className="text-[#F0E8FF]">{data.reward_items}</span>
            </div>
          )}
          {data.reward_other && (
            <div className="font-fell text-xs text-brand-muted">
              Other: <span className="text-[#F0E8FF]">{data.reward_other}</span>
            </div>
          )}
        </div>
      )}

      {isAdmin && <GmNotes notes={data.gm_notes} />}
    </>
  )
}

// ─── View: Achievement ─────────────────────────────────────────
function AchievementView({ data, isAdmin, players }: { data: Achievement; isAdmin: boolean; players: Player[] }) {
  const awardedPlayers = players.filter((p) =>
    (data.the8_achievement_players ?? []).some((ap) => ap.player_id === p.id)
  )
  return (
    <>
      {data.portrait_url && (
        <img src={data.portrait_url} alt={data.title} className="w-full max-h-56 object-cover rounded-sm mb-4 border border-brand-border" />
      )}
      <div className="flex items-center gap-2 flex-wrap mb-3">
        {isAdmin && data.is_secret && <SecretBadge />}
      </div>
      <h2 className="font-cinzel text-brand-parchment font-bold text-xl mb-3">{data.title}</h2>

      {awardedPlayers.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {awardedPlayers.map((p) => (
            <span key={p.id} className="flex items-center gap-1.5 font-fell text-xs text-brand-gold-300 bg-brand-gold-400/10 border border-brand-gold-400/30 px-2 py-0.5 rounded-sm">
              {p.portrait_url && (
                <img src={p.portrait_url} alt={p.name} className="w-4 h-4 rounded-full object-cover" />
              )}
              {p.name}
            </span>
          ))}
        </div>
      )}

      {data.description && (
        <div className="font-fell text-[#F0E8FF] text-sm leading-relaxed whitespace-pre-wrap mb-3">
          {renderMentions(data.description)}
        </div>
      )}

      {data.unlock_text && (
        <div className="border-t border-brand-border pt-3">
          <p className="section-label mb-1">How to Unlock</p>
          <p className="font-fell text-[#F0E8FF] text-sm">{data.unlock_text}</p>
        </div>
      )}

      {isAdmin && <GmNotes notes={data.gm_notes} />}
    </>
  )
}

// ─── View: Player ──────────────────────────────────────────────
function PlayerView({ data, isAdmin }: { data: VisiblePlayerData; isAdmin: boolean }) {
  const hasHp = 'hp_current' in data && data.hp_current !== null && data.hp_max !== null
  const hasStats = STAT_KEYS.some((s) => s.key in data && (data as Record<string, unknown>)[s.key] !== null)
  const hasIdentity = ('level' in data) || ('class' in data) || ('race' in data) || ('background' in data)

  return (
    <>
      {('portrait_url' in data) && data.portrait_url && (
        <img src={data.portrait_url} alt={data.name} className="w-full max-h-56 object-cover rounded-sm mb-4 border border-brand-border" />
      )}
      <h2 className="font-cinzel text-brand-parchment font-bold text-xl mb-2">{data.name}</h2>

      {hasIdentity && (
        <div className="flex flex-wrap gap-2 mb-3">
          {('level' in data) && data.level !== null && (
            <span className="text-[10px] font-cinzel tracking-widest uppercase text-brand-gold-300 bg-brand-gold-400/10 border border-brand-gold-400/30 px-2 py-0.5 rounded-sm">
              Lvl {data.level}
            </span>
          )}
          {('class' in data) && data.class && (
            <span className="text-[10px] font-cinzel tracking-widest uppercase text-brand-purple-200 bg-brand-purple-600/10 border border-brand-purple-600/30 px-2 py-0.5 rounded-sm">
              {data.class}
            </span>
          )}
          {('race' in data) && data.race && (
            <span className="text-[10px] font-cinzel tracking-widest uppercase text-brand-muted bg-brand-border/20 border border-brand-border px-2 py-0.5 rounded-sm">
              {data.race}
            </span>
          )}
          {('background' in data) && data.background && (
            <span className="text-[10px] font-cinzel tracking-widest uppercase text-brand-muted bg-brand-border/20 border border-brand-border px-2 py-0.5 rounded-sm">
              {data.background}
            </span>
          )}
        </div>
      )}

      {hasHp && (
        <div className="mb-4">
          <HpBar current={data.hp_current!} max={data.hp_max!} />
        </div>
      )}

      {hasStats && (
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-4">
          {STAT_KEYS.map(({ key, label }) => {
            const val = (data as Record<string, unknown>)[key] as number | null | undefined
            if (val === null || val === undefined) return null
            return (
              <div key={key} className="dark-card text-center py-2">
                <p className="section-label text-center mb-0.5 text-[9px]">{label}</p>
                <p className="font-cinzel text-brand-parchment font-bold text-lg">{val}</p>
                <p className="font-fell text-brand-muted text-xs">{modifier(val)}</p>
              </div>
            )
          })}
        </div>
      )}

      {data.public_notes && (
        <div className="mb-3">
          <p className="section-label mb-1">Notes</p>
          <p className="font-fell text-brand-muted text-sm whitespace-pre-wrap leading-relaxed">{data.public_notes}</p>
        </div>
      )}

      {isAdmin && ('secret_notes' in data) && data.secret_notes && (
        <GmNotes notes={data.secret_notes} />
      )}
    </>
  )
}

// ─── Icon components (reused from CardMenu) ────────────────────
function IconEdit() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  )
}

function IconEye({ off }: { off?: boolean }) {
  if (off) {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
      </svg>
    )
  }
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )
}

function IconTrash() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  )
}

function IconChevronLeft() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  )
}

// ─── ArticleModal ──────────────────────────────────────────────
export type ArticleModalData =
  | { type: 'lore'; data: LoreEntry }
  | { type: 'quest'; data: Quest; players: Player[]; achievements: Achievement[]; onItemToggle?: (questId: string, item: QuestItem) => void }
  | { type: 'achievement'; data: Achievement; players: Player[] }
  | { type: 'player'; data: VisiblePlayerData }

type Props = {
  article: ArticleModalData
  isAdmin: boolean
  onClose: () => void
  onEdit?: () => void
  onToggleSecret?: () => void
  onDelete?: () => void
}

export default function ArticleModal({ article, isAdmin, onClose, onEdit, onToggleSecret, onDelete }: Props) {
  const [current, setCurrent] = useState<ArticleModalData>(article)
  const [previous, setPrevious] = useState<ArticleModalData | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [navigating, setNavigating] = useState(false)

  const isAtRoot = previous === null

  async function navigateToEntry(id: string) {
    setNavigating(true)
    try {
      const res = await fetch(`/api/the8adventurers/lore/${id}`)
      if (res.ok) {
        const data: LoreEntry = await res.json()
        setPrevious(current)
        setCurrent({ type: 'lore', data })
      }
    } finally {
      setNavigating(false)
    }
  }

  function goBack() {
    if (previous) {
      setCurrent(previous)
      setPrevious(null)
      setConfirmDelete(false)
    }
  }

  function handleToggleSecretLocal() {
    if (current.type === 'lore') {
      setCurrent((prev) =>
        prev.type === 'lore'
          ? { ...prev, data: { ...prev.data, is_secret: !prev.data.is_secret } }
          : prev
      )
    }
    onToggleSecret?.()
  }

  function handleDeleteConfirmed() {
    onDelete?.()
    onClose()
  }

  const currentIsSecret = current.type === 'lore' ? current.data.is_secret : false
  const showToggleSecret = isAdmin && isAtRoot && onToggleSecret && current.type !== 'player'

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center pt-8 px-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-brand-card border border-brand-border rounded-sm p-6 w-full max-w-lg my-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header actions */}
        <div className="absolute top-3 right-3 flex items-center gap-0.5 z-10">
          {/* Back button when navigated */}
          {!isAtRoot && (
            <button
              onClick={goBack}
              className="w-7 h-7 flex items-center justify-center text-brand-muted hover:text-brand-parchment transition-colors rounded-sm hover:bg-brand-border/30"
              aria-label="Back"
              title="Back"
            >
              <IconChevronLeft />
            </button>
          )}

          {/* Admin actions (root level only) */}
          {isAdmin && isAtRoot && !confirmDelete && (
            <>
              {onEdit && (
                <button
                  onClick={() => { onEdit(); onClose() }}
                  className="w-7 h-7 flex items-center justify-center text-brand-muted hover:text-brand-parchment transition-colors rounded-sm hover:bg-brand-border/30"
                  aria-label="Edit"
                  title="Edit"
                >
                  <IconEdit />
                </button>
              )}
              {showToggleSecret && (
                <button
                  onClick={handleToggleSecretLocal}
                  className="w-7 h-7 flex items-center justify-center text-brand-muted hover:text-brand-parchment transition-colors rounded-sm hover:bg-brand-border/30"
                  aria-label={currentIsSecret ? 'Make public' : 'Make secret'}
                  title={currentIsSecret ? 'Make public' : 'Make secret'}
                >
                  <IconEye off={currentIsSecret} />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="w-7 h-7 flex items-center justify-center text-brand-muted hover:text-red-400 transition-colors rounded-sm hover:bg-red-400/10"
                  aria-label="Delete"
                  title="Delete"
                >
                  <IconTrash />
                </button>
              )}
            </>
          )}

          {/* Inline delete confirmation */}
          {isAdmin && isAtRoot && confirmDelete && (
            <div className="flex items-center gap-1.5 bg-red-900/20 border border-red-800/40 rounded-sm px-2 py-1 mr-1">
              <span className="font-fell text-[10px] text-red-300">Delete?</span>
              <button
                onClick={handleDeleteConfirmed}
                className="font-cinzel text-[10px] text-red-400 hover:text-red-300 transition-colors px-1"
              >
                Yes
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="font-cinzel text-[10px] text-brand-muted hover:text-brand-parchment transition-colors px-1"
              >
                No
              </button>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center text-brand-muted hover:text-brand-parchment transition-colors text-lg leading-none rounded-sm hover:bg-brand-border/30"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="pt-1">
          {navigating && (
            <div className="flex items-center justify-center py-12">
              <span className="font-fell text-brand-muted text-sm">Loading…</span>
            </div>
          )}
          {!navigating && current.type === 'lore' && (
            <LoreView
              data={current.data}
              isAdmin={isAdmin}
              onNavigate={isAtRoot ? navigateToEntry : undefined}
            />
          )}
          {!navigating && current.type === 'quest' && (
            <QuestView
              data={current.data}
              isAdmin={isAdmin}
              players={current.players}
              achievements={current.achievements}
              onItemToggle={current.onItemToggle}
            />
          )}
          {!navigating && current.type === 'achievement' && (
            <AchievementView data={current.data} isAdmin={isAdmin} players={current.players} />
          )}
          {!navigating && current.type === 'player' && (
            <PlayerView data={current.data} isAdmin={isAdmin} />
          )}
        </div>
      </div>
    </div>
  )
}
