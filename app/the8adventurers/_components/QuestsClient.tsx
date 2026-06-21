'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Quest, QuestItem, QuestStatus, Player, Achievement } from '@/lib/the8adventurers/types'
import Toggle from '@/components/the8adventurers/Toggle'
import SecretBadge from '@/components/the8adventurers/SecretBadge'
import MentionTextarea from '@/components/the8adventurers/MentionTextarea'
import ViewToggle, { type ViewMode } from '@/components/the8adventurers/ViewToggle'
import CardMenu from '@/components/the8adventurers/CardMenu'
import ArticleModal, { type ArticleModalData } from '@/components/the8adventurers/ArticleModal'

type Props = {
  initialQuests: Quest[]
  players: Player[]
  achievements: Achievement[]
  isAdmin: boolean
}

const STATUS_ORDER: QuestStatus[] = ['in_progress', 'available', 'completed', 'failed']

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

type QuestFormState = {
  title: string
  description: string
  portrait_url: string
  status: QuestStatus
  is_secret: boolean
  sort_order: number
  reward_platinum: number
  reward_gold: number
  reward_electrum: number
  reward_silver: number
  reward_copper: number
  reward_achievement_id: string
  reward_items: string
  reward_other: string
  gm_notes: string
  player_ids: string[]
  exp_map: Record<string, number>
}

function emptyForm(): QuestFormState {
  return {
    title: '', description: '', portrait_url: '',
    status: 'available', is_secret: true, sort_order: 0,
    reward_platinum: 0, reward_gold: 0, reward_electrum: 0, reward_silver: 0, reward_copper: 0,
    reward_achievement_id: '', reward_items: '', reward_other: '', gm_notes: '',
    player_ids: [], exp_map: {},
  }
}

function questToForm(q: Quest): QuestFormState {
  return {
    title: q.title, description: q.description ?? '', portrait_url: q.portrait_url ?? '',
    status: q.status, is_secret: q.is_secret, sort_order: q.sort_order,
    reward_platinum: q.reward_platinum ?? 0, reward_gold: q.reward_gold ?? 0,
    reward_electrum: q.reward_electrum ?? 0, reward_silver: q.reward_silver ?? 0,
    reward_copper: q.reward_copper ?? 0,
    reward_achievement_id: q.reward_achievement_id ?? '',
    reward_items: q.reward_items ?? '', reward_other: q.reward_other ?? '',
    gm_notes: q.gm_notes ?? '',
    player_ids: (q.the8_quest_players ?? []).map((p) => p.player_id),
    exp_map: Object.fromEntries((q.the8_quest_exp ?? []).map((e) => [e.player_id, e.exp_amount])),
  }
}

function QuestStatusIcon({ status }: { status: QuestStatus }) {
  if (status === 'available') return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" fill="none">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
  if (status === 'in_progress') return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M 8 2 A 6 6 0 0 0 8 14 Z" fill="currentColor" />
    </svg>
  )
  if (status === 'completed') return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="7" fill="currentColor" />
      <path d="M 4.5 8.5 L 6.5 10.5 L 11 5.5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="7" fill="currentColor" />
      <path d="M 5.5 5.5 L 10.5 10.5 M 10.5 5.5 L 5.5 10.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function SortIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3.5h10M4 7h6M6 10.5h2" />
    </svg>
  )
}

function StatusPill({
  status,
  isAdmin,
  onChange,
}: {
  status: QuestStatus
  isAdmin: boolean
  onChange?: (s: QuestStatus) => void
}) {
  const pill = (
    <span
      className={`inline-flex items-center justify-center w-7 h-7 rounded-full border ${STATUS_COLORS[status]}`}
      title={`Status: ${STATUS_LABELS[status]}`}
      aria-label={`Status: ${STATUS_LABELS[status]}`}
    >
      <QuestStatusIcon status={status} />
    </span>
  )

  if (!isAdmin || !onChange) return pill

  return (
    <span className="relative inline-flex cursor-pointer" title={`Change status: ${STATUS_LABELS[status]}`}>
      {pill}
      <select
        value={status}
        onChange={(e) => onChange(e.target.value as QuestStatus)}
        onClick={(e) => e.stopPropagation()}
        aria-label="Change quest status"
        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
      >
        {(Object.keys(STATUS_LABELS) as QuestStatus[]).map((s) => (
          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
        ))}
      </select>
    </span>
  )
}

function QuestItemRow({
  item,
  questId,
  isAdmin,
  onToggle,
  onDelete,
}: {
  item: QuestItem
  questId: string
  isAdmin: boolean
  onToggle: () => void
  onDelete: () => void
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={item.is_done}
        onChange={isAdmin ? onToggle : undefined}
        disabled={!isAdmin}
        onClick={(e) => e.stopPropagation()}
        className="accent-brand-gold-400 w-4 h-4 flex-shrink-0 cursor-pointer disabled:cursor-default"
      />
      <span className={`font-fell text-sm ${item.is_done ? 'line-through text-brand-muted' : 'text-[#F0E8FF]'}`}>
        {item.label}
      </span>
      {isAdmin && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          className="text-brand-muted hover:text-red-400 transition-colors text-xs ml-auto"
          aria-label="Delete item"
        >
          ✕
        </button>
      )}
    </div>
  )
}

function PlayerCheckRow({
  player,
  checked,
  expAmount,
  onToggle,
  onExpChange,
}: {
  player: Player
  checked: boolean
  expAmount: number
  onToggle: () => void
  onExpChange: (v: number) => void
}) {
  return (
    <div className="flex items-center gap-3 py-1">
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="accent-brand-gold-400 w-4 h-4 flex-shrink-0 cursor-pointer"
      />
      <span className="font-fell text-sm text-brand-parchment flex-1">{player.name}</span>
      {checked && (
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={expAmount}
            onChange={(e) => onExpChange(parseInt(e.target.value) || 0)}
            min={0}
            className="w-20 bg-brand-bg border border-brand-border rounded-sm px-2 py-0.5 text-brand-parchment font-fell text-xs focus:outline-none focus:border-brand-purple-600 text-right"
            placeholder="0"
          />
          <span className="font-fell text-xs text-brand-muted">XP</span>
        </div>
      )}
    </div>
  )
}

function QuestRewardHero({
  quest,
  players,
  achievement,
}: {
  quest: Quest
  players: Player[]
  achievement: Achievement | undefined
}) {
  const hasCurrency = (quest.reward_platinum ?? 0) > 0 || (quest.reward_gold ?? 0) > 0 ||
    (quest.reward_electrum ?? 0) > 0 || (quest.reward_silver ?? 0) > 0 || (quest.reward_copper ?? 0) > 0
  const hasReward = hasCurrency || (quest.the8_quest_exp ?? []).length > 0 ||
    achievement || quest.reward_items || quest.reward_other

  if (!hasReward) return null

  return (
    <div className="mt-3 border-t border-brand-border pt-3 space-y-2">
      <p className="section-label">Rewards</p>
      {hasCurrency && (
        <div className="flex flex-wrap gap-4">
          {CURRENCY_LABELS.map(({ key, label, color }) => {
            const amount = (quest as Record<string, unknown>)[key] as number
            return amount > 0 ? (
              <span key={key} className={`inline-flex items-center gap-1 font-cinzel text-xs ${color}`}>
                <span className="font-bold">{amount}</span>
                <span className="opacity-70">{label}</span>
              </span>
            ) : null
          })}
        </div>
      )}
      {(quest.the8_quest_exp ?? []).length > 0 && (
        <div className="flex flex-wrap gap-3">
          {(quest.the8_quest_exp ?? []).map((exp) => {
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
      {achievement && (
        <div className="font-fell text-xs text-brand-gold-300">
          🏅 Unlocks: {achievement.title}
        </div>
      )}
      {quest.reward_items && (
        <div className="font-fell text-xs text-brand-muted">
          Items: <span className="text-[#F0E8FF]">{quest.reward_items}</span>
        </div>
      )}
      {quest.reward_other && (
        <div className="font-fell text-xs text-brand-muted">
          Other: <span className="text-[#F0E8FF]">{quest.reward_other}</span>
        </div>
      )}
    </div>
  )
}

function getStoredView(): ViewMode {
  if (typeof window === 'undefined') return 'grid'
  return (localStorage.getItem('the8_view_quests') as ViewMode) ?? 'grid'
}

export default function QuestsClient({ initialQuests, players, achievements, isAdmin }: Props) {
  const router = useRouter()
  const [quests, setQuests] = useState<Quest[]>(initialQuests)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [showModal, setShowModal] = useState(false)
  const [editingQuest, setEditingQuest] = useState<Quest | null>(null)
  const [form, setForm] = useState<QuestFormState>(emptyForm())
  const [newItemLabel, setNewItemLabel] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')
  const [view, setView] = useState<ViewMode>('grid')
  const [viewingArticle, setViewingArticle] = useState<ArticleModalData | null>(null)
  const [viewingQuest, setViewingQuest] = useState<Quest | null>(null)

  const [activeStatuses, setActiveStatuses] = useState<Set<QuestStatus>>(
    new Set<QuestStatus>(['in_progress', 'available', 'completed', 'failed'])
  )
  const [sortMode, setSortMode] = useState<'status' | 'title' | 'recent'>('status')

  useEffect(() => {
    setView(getStoredView())
  }, [])

  function handleViewChange(v: ViewMode) {
    setView(v)
    if (typeof window !== 'undefined') localStorage.setItem('the8_view_quests', v)
  }

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleStatus(s: QuestStatus) {
    setActiveStatuses((prev) => {
      const next = new Set(prev)
      next.has(s) ? next.delete(s) : next.add(s)
      return next
    })
  }

  const displayedQuests = (() => {
    const filtered = quests.filter((q) => activeStatuses.has(q.status))
    if (sortMode === 'title') return [...filtered].sort((a, b) => a.title.localeCompare(b.title))
    if (sortMode === 'recent') return [...filtered].sort((a, b) => b.created_at.localeCompare(a.created_at))
    return [...filtered].sort((a, b) => {
      const si = STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status)
      return si !== 0 ? si : a.title.localeCompare(b.title)
    })
  })()

  function openCreate() {
    setEditingQuest(null)
    setForm(emptyForm())
    setErr('')
    setShowModal(true)
  }

  function openEdit(q: Quest) {
    setEditingQuest(q)
    setForm(questToForm(q))
    setErr('')
    setShowModal(true)
  }

  function openView(q: Quest) {
    setViewingQuest(q)
    setViewingArticle({
      type: 'quest',
      data: q,
      players,
      achievements,
      onItemToggle: (questId, updatedItem) => {
        setQuests((prev) => prev.map((quest) =>
          quest.id !== questId ? quest : {
            ...quest,
            the8_quest_items: quest.the8_quest_items.map((i) =>
              i.id === updatedItem.id ? updatedItem : i
            ),
          }
        ))
        if (viewingArticle?.type === 'quest' && viewingArticle.data.id === questId) {
          setViewingArticle((prev) => {
            if (!prev || prev.type !== 'quest') return prev
            return {
              ...prev,
              data: {
                ...prev.data,
                the8_quest_items: prev.data.the8_quest_items.map((i) =>
                  i.id === updatedItem.id ? updatedItem : i
                ),
              },
            }
          })
        }
      },
    })
  }

  async function handleToggleSecret(q: Quest) {
    const newSecret = !q.is_secret
    setQuests((prev) => prev.map((x) => x.id === q.id ? { ...x, is_secret: newSecret } : x))
    await fetch(`/api/the8adventurers/quests/${q.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_secret: newSecret }),
    })
    router.refresh()
  }

  async function handleSave() {
    if (!form.title.trim()) { setErr('Title is required'); return }
    setSaving(true); setErr('')

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      portrait_url: form.portrait_url.trim() || null,
      status: form.status,
      is_secret: form.is_secret,
      sort_order: form.sort_order,
      reward_platinum: form.reward_platinum,
      reward_gold: form.reward_gold,
      reward_electrum: form.reward_electrum,
      reward_silver: form.reward_silver,
      reward_copper: form.reward_copper,
      reward_achievement_id: form.reward_achievement_id || null,
      reward_items: form.reward_items.trim() || null,
      reward_other: form.reward_other.trim() || null,
      gm_notes: form.gm_notes.trim() || null,
      player_ids: form.player_ids,
      exp_map: form.exp_map,
    }

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
      setQuests((prev) => prev.map((q) => q.id === json.id ? json : q))
    } else {
      setQuests((prev) => [...prev, json])
    }
    setShowModal(false)
    router.refresh()
  }

  async function handleDeleteQuest(quest: Quest) {
    setSaving(true)
    const res = await fetch(`/api/the8adventurers/quests/${quest.id}`, { method: 'DELETE' })
    setSaving(false)
    if (!res.ok) { setErr('Error deleting'); return }
    setQuests((prev) => prev.filter((q) => q.id !== quest.id))
    if (editingQuest?.id === quest.id) setShowModal(false)
    router.refresh()
  }

  async function changeStatus(q: Quest, status: QuestStatus) {
    setQuests((prev) => prev.map((x) => x.id === q.id ? { ...x, status } : x))
    await fetch(`/api/the8adventurers/quests/${q.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
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
  }

  async function deleteItem(questId: string, item: QuestItem) {
    await fetch(`/api/the8adventurers/quests/${questId}/items/${item.id}`, { method: 'DELETE' })
    setQuests((prev) => prev.map((q) =>
      q.id !== questId ? q : { ...q, the8_quest_items: q.the8_quest_items.filter((i) => i.id !== item.id) }
    ))
  }

  function togglePlayer(pid: string) {
    setForm((f) => {
      const ids = f.player_ids.includes(pid)
        ? f.player_ids.filter((x) => x !== pid)
        : [...f.player_ids, pid]
      return { ...f, player_ids: ids }
    })
  }

  function setPlayerExp(pid: string, amount: number) {
    setForm((f) => ({ ...f, exp_map: { ...f.exp_map, [pid]: amount } }))
  }

  const inputCls = 'w-full bg-brand-bg border border-brand-border rounded-sm px-3 py-2 text-brand-parchment font-fell text-sm focus:outline-none focus:border-brand-purple-600'

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      {/* Mobile fixed "+" add button */}
      {isAdmin && (
        <button
          onClick={openCreate}
          className="md:hidden fixed top-4 right-14 z-40 w-9 h-9 bg-brand-purple-600 hover:bg-brand-purple-400 rounded-sm text-brand-parchment flex items-center justify-center transition-colors text-lg font-bold"
          aria-label="Add Quest"
          title="Add Quest"
        >
          +
        </button>
      )}

      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div>
          <p className="section-label">Campaign</p>
          <h1 className="font-cinzel text-brand-parchment text-2xl md:text-3xl font-bold">Quests</h1>
        </div>
        <div className="flex items-center gap-2">
          <ViewToggle value={view} onChange={handleViewChange} />
          {isAdmin && (
            <button onClick={openCreate} className="hidden md:inline-flex btn-primary text-xs">+ Add Quest</button>
          )}
        </div>
      </div>

      {/* Filter + sort controls */}
      <div className="flex items-center gap-2 mb-6">
        <div className="flex gap-2 items-center">
          {STATUS_ORDER.map((s) => {
            const active = activeStatuses.has(s)
            return (
              <button
                key={s}
                onClick={() => toggleStatus(s)}
                aria-label={`Filter: ${STATUS_LABELS[s]}`}
                title={STATUS_LABELS[s]}
                className={`flex items-center justify-center transition-all border w-8 h-8 rounded-full md:w-auto md:h-auto md:rounded-sm md:px-3 md:py-1 ${
                  active ? STATUS_COLORS[s] : 'text-brand-muted border-brand-border/40 bg-transparent'
                }`}
              >
                <span className={`md:hidden ${!active ? 'opacity-40' : ''}`}>
                  <QuestStatusIcon status={s} />
                </span>
                <span className="hidden md:inline text-[10px] font-cinzel tracking-widest uppercase">
                  {STATUS_LABELS[s]}
                </span>
              </button>
            )
          })}
        </div>

        <div className="ml-auto relative flex items-center">
          <div className="relative md:hidden">
            <span className="pointer-events-none flex items-center justify-center w-8 h-8 rounded-sm border border-brand-border text-brand-muted">
              <SortIcon />
            </span>
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as typeof sortMode)}
              aria-label="Sort quests"
              className="absolute inset-0 opacity-0 cursor-pointer"
            >
              <option value="status">Status (default)</option>
              <option value="title">Title A-Z</option>
              <option value="recent">Most recent</option>
            </select>
          </div>
          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as typeof sortMode)}
            onClick={(e) => e.stopPropagation()}
            className="hidden md:block bg-brand-bg border border-brand-border rounded-sm px-2 py-1 text-brand-muted font-fell text-xs focus:outline-none focus:border-brand-purple-600"
          >
            <option value="status">Status (default)</option>
            <option value="title">Title A-Z</option>
            <option value="recent">Most recent</option>
          </select>
        </div>
      </div>

      {displayedQuests.length === 0 && (
        <p className="font-fell text-brand-muted italic">No quests match the current filters.</p>
      )}

      {/* Grid view */}
      {view === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {displayedQuests.map((q) => {
            const linkedPlayers = players.filter((p) =>
              (q.the8_quest_players ?? []).some((qp) => qp.player_id === p.id)
            )
            return (
              <div
                key={q.id}
                className="relative dark-card flex flex-col overflow-hidden cursor-pointer"
                onClick={() => openView(q)}
              >
                <div className="absolute top-2 right-2 z-10">
                  <CardMenu
                    isAdmin={isAdmin}
                    onEdit={isAdmin ? () => openEdit(q) : undefined}
                    onToggleSecret={isAdmin ? () => handleToggleSecret(q) : undefined}
                    onDelete={isAdmin ? () => handleDeleteQuest(q) : undefined}
                  />
                </div>
                {q.portrait_url && (
                  <img src={q.portrait_url} alt={q.title} className="w-full h-32 object-cover rounded-sm mb-3 border border-brand-border" />
                )}
                <div className="flex items-center gap-2 mb-1 flex-wrap pr-8">
                  <h3 className="font-cinzel text-brand-parchment font-semibold text-base leading-tight">{q.title}</h3>
                  <StatusPill status={q.status} isAdmin={isAdmin} onChange={(s) => changeStatus(q, s)} />
                  {isAdmin && q.is_secret && <SecretBadge />}
                </div>
                {linkedPlayers.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-1">
                    {linkedPlayers.map((p) => (
                      <span key={p.id} className="font-fell text-xs text-brand-purple-200 bg-brand-purple-900/30 border border-brand-purple-600/30 px-1.5 py-0.5 rounded-sm">
                        {p.name}
                      </span>
                    ))}
                  </div>
                )}
                {q.description && (
                  <p className="font-fell text-brand-muted text-sm leading-relaxed line-clamp-2 mt-auto pt-1">
                    {q.description}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        /* List view — compact rows, ▶ expands checklist inline, card click = view modal */
        <div className="space-y-1.5">
          {displayedQuests.map((q) => {
            const isExp = expanded.has(q.id)
            const items = [...(q.the8_quest_items ?? [])].sort((a, b) => a.sort_order - b.sort_order)
            const rewardAchievement = achievements.find((a) => a.id === q.reward_achievement_id)

            return (
              <div
                key={q.id}
                className="group relative bg-brand-card border border-brand-border rounded-sm px-3 py-2 hover:border-brand-purple-600/50 transition-colors duration-200 cursor-pointer"
                onClick={() => openView(q)}
              >
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleExpand(q.id) }}
                    className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-brand-muted hover:text-brand-parchment transition-colors"
                    aria-label={isExp ? 'Collapse' : 'Expand'}
                  >
                    <span className={`text-[10px] transition-transform duration-150 ${isExp ? 'rotate-90' : 'rotate-0'}`}>▶</span>
                  </button>
                  {q.portrait_url && (
                    <img
                      src={q.portrait_url}
                      alt={q.title}
                      className="w-8 h-8 object-cover rounded-sm border border-brand-border flex-shrink-0"
                    />
                  )}
                  <h3 className="font-cinzel font-semibold text-sm leading-tight text-brand-parchment truncate flex-1 min-w-0">
                    {q.title}
                  </h3>
                  <StatusPill status={q.status} isAdmin={isAdmin} onChange={(s) => changeStatus(q, s)} />
                  {isAdmin && q.is_secret && <SecretBadge />}
                  <CardMenu
                    variant="list"
                    isSecret={q.is_secret}
                    isAdmin={isAdmin}
                    onEdit={isAdmin ? () => openEdit(q) : undefined}
                    onToggleSecret={isAdmin ? () => handleToggleSecret(q) : undefined}
                    onDelete={isAdmin ? () => handleDeleteQuest(q) : undefined}
                  />
                </div>

                {isExp && (
                  <div className="mt-2 pl-5" onClick={(e) => e.stopPropagation()}>
                    {items.length > 0 && (
                      <div className="space-y-2 mb-3">
                        {items.map((item) => (
                          <QuestItemRow
                            key={item.id}
                            item={item}
                            questId={q.id}
                            isAdmin={isAdmin}
                            onToggle={() => toggleItemDone(q.id, item)}
                            onDelete={() => deleteItem(q.id, item)}
                          />
                        ))}
                      </div>
                    )}

                    {isAdmin && (
                      <div className="flex gap-2 mb-3">
                        <input
                          type="text"
                          value={newItemLabel[q.id] ?? ''}
                          onChange={(e) => setNewItemLabel((prev) => ({ ...prev, [q.id]: e.target.value }))}
                          onKeyDown={(e) => e.key === 'Enter' && addItem(q.id)}
                          onClick={(e) => e.stopPropagation()}
                          placeholder="New checklist item…"
                          className="flex-1 bg-brand-bg border border-brand-border rounded-sm px-2 py-1 text-brand-parchment font-fell text-xs focus:outline-none focus:border-brand-purple-600"
                        />
                        <button
                          onClick={(e) => { e.stopPropagation(); addItem(q.id) }}
                          className="btn-outline text-[10px] px-2 py-1"
                        >
                          Add
                        </button>
                      </div>
                    )}

                    <QuestRewardHero quest={q} players={players} achievement={rewardAchievement} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Edit / Create modal — near-fullscreen */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 z-50">
          <div
            className="absolute inset-6 bg-brand-card border border-brand-border rounded-sm p-6 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-cinzel text-brand-parchment font-bold text-lg">
                {editingQuest ? 'Edit Quest' : 'New Quest'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-brand-muted hover:text-brand-parchment text-xl" aria-label="Close">✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="section-label block mb-1">Title *</label>
                <input type="text" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className={inputCls} />
              </div>

              <div>
                <label className="section-label block mb-1">Description</label>
                <MentionTextarea
                  value={form.description}
                  onChange={(v) => setForm((f) => ({ ...f, description: v }))}
                  rows={4}
                  placeholder="Quest description… type @ to link articles"
                  className={`${inputCls} resize-y`}
                />
              </div>

              <div>
                <label className="section-label block mb-1">Portrait URL</label>
                <input type="text" value={form.portrait_url} onChange={(e) => setForm((f) => ({ ...f, portrait_url: e.target.value }))} className={inputCls} placeholder="https://…" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="section-label block mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as QuestStatus }))}
                    className={inputCls}
                  >
                    {(Object.keys(STATUS_LABELS) as QuestStatus[]).map((s) => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="section-label block mb-1">Sort Order</label>
                  <input type="number" value={form.sort_order} onChange={(e) => setForm((f) => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))} className={inputCls} />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Toggle checked={form.is_secret} onChange={(v) => setForm((f) => ({ ...f, is_secret: v }))} />
                <span className="font-fell text-sm text-brand-muted">{form.is_secret ? 'GM Only' : 'Visible to players'}</span>
              </div>

              {players.length > 0 && (
                <div>
                  <label className="section-label block mb-2">Linked Players & XP</label>
                  <div className="bg-brand-bg border border-brand-border rounded-sm px-3 py-2 space-y-1">
                    {players.map((p) => (
                      <PlayerCheckRow
                        key={p.id}
                        player={p}
                        checked={form.player_ids.includes(p.id)}
                        expAmount={form.exp_map[p.id] ?? 0}
                        onToggle={() => togglePlayer(p.id)}
                        onExpChange={(v) => setPlayerExp(p.id, v)}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="section-label block mb-2">Currency Rewards</label>
                <div className="grid grid-cols-5 gap-2">
                  {CURRENCY_LABELS.map(({ key, label, color }) => (
                    <div key={key}>
                      <label className={`section-label block mb-1 ${color}`}>{label}</label>
                      <input
                        type="number"
                        min={0}
                        value={(form as Record<string, unknown>)[key] as number}
                        onChange={(e) => setForm((f) => ({ ...f, [key]: parseInt(e.target.value) || 0 }))}
                        className="w-full bg-brand-bg border border-brand-border rounded-sm px-2 py-1.5 text-brand-parchment font-fell text-sm text-right focus:outline-none focus:border-brand-purple-600"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {achievements.length > 0 && (
                <div>
                  <label className="section-label block mb-1">Achievement Unlock (optional)</label>
                  <select
                    value={form.reward_achievement_id}
                    onChange={(e) => setForm((f) => ({ ...f, reward_achievement_id: e.target.value }))}
                    className={inputCls}
                  >
                    <option value="">None</option>
                    {achievements.map((a) => (
                      <option key={a.id} value={a.id}>{a.title}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="section-label block mb-1">Reward Items</label>
                <input type="text" value={form.reward_items} onChange={(e) => setForm((f) => ({ ...f, reward_items: e.target.value }))} className={inputCls} placeholder="e.g. +1 Longsword, Bag of Holding" />
              </div>

              <div>
                <label className="section-label block mb-1">Other Rewards</label>
                <input type="text" value={form.reward_other} onChange={(e) => setForm((f) => ({ ...f, reward_other: e.target.value }))} className={inputCls} placeholder="e.g. Noble title, secret passage key" />
              </div>

              <div>
                <label className="section-label block mb-1 text-red-400/80">GM Notes (private)</label>
                <textarea
                  value={form.gm_notes}
                  onChange={(e) => setForm((f) => ({ ...f, gm_notes: e.target.value }))}
                  rows={3}
                  placeholder="Private notes, only visible to GM…"
                  className={`${inputCls} resize-y border-red-800/40 focus:border-red-700/60`}
                />
              </div>

              {err && <p className="text-red-400 text-sm font-fell">{err}</p>}

              <div className="flex gap-3 pt-2">
                <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 text-xs">
                  {saving ? 'Saving…' : 'Save'}
                </button>
                {editingQuest && (
                  <button onClick={() => handleDeleteQuest(editingQuest)} disabled={saving} className="btn-outline text-xs text-red-400 border-red-400/40 hover:bg-red-400/10">
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {viewingArticle && (
        <ArticleModal
          article={viewingArticle}
          isAdmin={isAdmin}
          onClose={() => { setViewingArticle(null); setViewingQuest(null) }}
          onEdit={isAdmin && viewingQuest ? () => {
            const freshQuest = quests.find((q) => q.id === viewingQuest.id) ?? viewingQuest
            setViewingArticle(null)
            setViewingQuest(null)
            openEdit(freshQuest)
          } : undefined}
          onToggleSecret={isAdmin && viewingQuest ? () => {
            const freshQuest = quests.find((q) => q.id === viewingQuest.id) ?? viewingQuest
            handleToggleSecret(freshQuest)
          } : undefined}
          onDelete={isAdmin && viewingQuest ? () => {
            const freshQuest = quests.find((q) => q.id === viewingQuest.id) ?? viewingQuest
            setViewingArticle(null)
            setViewingQuest(null)
            handleDeleteQuest(freshQuest)
          } : undefined}
        />
      )}
    </div>
  )
}
