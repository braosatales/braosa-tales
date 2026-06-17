'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Quest, QuestItem, QuestStatus, Player, Achievement } from '@/lib/the8adventurers/types'
import RichCard from '@/components/the8adventurers/RichCard'
import Toggle from '@/components/the8adventurers/Toggle'
import SecretBadge from '@/components/the8adventurers/SecretBadge'
import MentionTextarea from '@/components/the8adventurers/MentionTextarea'

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
  player_ids: string[]
  exp_map: Record<string, number>
}

function emptyForm(): QuestFormState {
  return {
    title: '', description: '', portrait_url: '',
    status: 'available', is_secret: true, sort_order: 0,
    reward_platinum: 0, reward_gold: 0, reward_electrum: 0, reward_silver: 0, reward_copper: 0,
    reward_achievement_id: '', reward_items: '', reward_other: '',
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
    player_ids: (q.the8_quest_players ?? []).map((p) => p.player_id),
    exp_map: Object.fromEntries((q.the8_quest_exp ?? []).map((e) => [e.player_id, e.exp_amount])),
  }
}

function StatusBadge({ status }: { status: QuestStatus }) {
  return (
    <span className={`inline-block text-[10px] font-cinzel tracking-widest uppercase px-1.5 py-0.5 rounded-sm border ${STATUS_COLORS[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  )
}

function CurrencyChip({ amount, label, color }: { amount: number; label: string; color: string }) {
  return (
    <span className={`inline-flex items-center gap-1 font-cinzel text-xs ${color}`}>
      <span className="font-bold">{amount}</span>
      <span className="opacity-70">{label}</span>
    </span>
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
              <CurrencyChip key={key} amount={amount} label={label} color={color} />
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

  // Filter/sort state
  const [activeStatuses, setActiveStatuses] = useState<Set<QuestStatus>>(
    new Set<QuestStatus>(['in_progress', 'available', 'completed', 'failed'])
  )
  const [sortMode, setSortMode] = useState<'status' | 'title' | 'recent'>('status')

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
    // status sort: in_progress → available → completed → failed, within status by sort_order
    return [...filtered].sort((a, b) => {
      const si = STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status)
      return si !== 0 ? si : a.sort_order - b.sort_order
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

  async function handleDelete() {
    if (!editingQuest) return
    if (!confirm(`Delete quest "${editingQuest.title}"?`)) return
    setSaving(true)
    const res = await fetch(`/api/the8adventurers/quests/${editingQuest.id}`, { method: 'DELETE' })
    setSaving(false)
    if (!res.ok) { setErr('Error deleting'); return }
    setQuests((prev) => prev.filter((q) => q.id !== editingQuest.id))
    setShowModal(false)
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
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="section-label">Campaign</p>
          <h1 className="font-cinzel text-brand-parchment text-2xl md:text-3xl font-bold">Quests</h1>
        </div>
        {isAdmin && (
          <button onClick={openCreate} className="btn-primary text-xs">+ Add Quest</button>
        )}
      </div>

      {/* Filter + sort controls */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex flex-wrap gap-2">
          {STATUS_ORDER.map((s) => (
            <button
              key={s}
              onClick={() => toggleStatus(s)}
              className={`px-3 py-1 text-[10px] font-cinzel tracking-widest uppercase rounded-sm border transition-colors ${
                activeStatuses.has(s)
                  ? STATUS_COLORS[s]
                  : 'text-brand-muted border-brand-border/40 bg-transparent'
              }`}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
        <select
          value={sortMode}
          onChange={(e) => setSortMode(e.target.value as typeof sortMode)}
          onClick={(e) => e.stopPropagation()}
          className="ml-auto bg-brand-bg border border-brand-border rounded-sm px-2 py-1 text-brand-muted font-fell text-xs focus:outline-none focus:border-brand-purple-600"
        >
          <option value="status">Status (default)</option>
          <option value="title">Title A-Z</option>
          <option value="recent">Most recent</option>
        </select>
      </div>

      {displayedQuests.length === 0 && (
        <p className="font-fell text-brand-muted italic">No quests match the current filters.</p>
      )}

      <div className="space-y-4">
        {displayedQuests.map((q) => {
          const isExp = expanded.has(q.id)
          const items = [...(q.the8_quest_items ?? [])].sort((a, b) => a.sort_order - b.sort_order)
          const linkedPlayers = players.filter((p) =>
            (q.the8_quest_players ?? []).some((qp) => qp.player_id === p.id)
          )
          const rewardAchievement = achievements.find((a) => a.id === q.reward_achievement_id)

          return (
            <div key={q.id} className="dark-card">
              {/* Header row */}
              <div className="flex items-start gap-3 mb-2">
                {q.portrait_url && (
                  <img
                    src={q.portrait_url}
                    alt={q.title}
                    className="w-14 h-14 object-cover rounded-sm border border-brand-border flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <button
                      onClick={() => toggleExpand(q.id)}
                      className="flex items-center gap-2 text-left"
                    >
                      <span className={`text-[10px] text-brand-muted transition-transform duration-150 ${isExp ? 'rotate-90' : ''}`}>▶</span>
                      <h3 className="font-cinzel font-semibold text-base leading-tight text-brand-parchment">
                        {q.title}
                      </h3>
                    </button>
                    <StatusBadge status={q.status} />
                    {isAdmin && q.is_secret && <SecretBadge />}
                  </div>

                  {/* Admin status select */}
                  {isAdmin && (
                    <select
                      value={q.status}
                      onChange={(e) => { e.stopPropagation(); changeStatus(q, e.target.value as QuestStatus) }}
                      onClick={(e) => e.stopPropagation()}
                      className="bg-brand-bg border border-brand-border rounded-sm px-2 py-0.5 text-brand-muted font-fell text-xs focus:outline-none focus:border-brand-purple-600 mt-1"
                    >
                      {(Object.keys(STATUS_LABELS) as QuestStatus[]).map((s) => (
                        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                  )}
                </div>

                {isAdmin && (
                  <button
                    onClick={(e) => { e.stopPropagation(); openEdit(q) }}
                    className="flex-shrink-0 text-brand-muted hover:text-brand-gold-300 transition-colors text-xs font-cinzel tracking-wide"
                  >
                    Edit
                  </button>
                )}
              </div>

              {q.description && (
                <p className="font-fell text-brand-muted text-sm mb-2 leading-relaxed">
                  {q.description}
                </p>
              )}

              {/* Linked players */}
              {linkedPlayers.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {linkedPlayers.map((p) => (
                    <span key={p.id} className="font-fell text-xs text-brand-purple-200 bg-brand-purple-900/30 border border-brand-purple-600/30 px-2 py-0.5 rounded-sm">
                      {p.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Expanded: items + rewards */}
              {isExp && (
                <div className="mt-3 pl-2">
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

      {/* Quest modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center pt-8 px-4 overflow-y-auto">
          <div
            className="bg-brand-card border border-brand-border rounded-sm p-6 w-full max-w-xl my-8"
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

              {/* Players */}
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

              {/* Currency rewards */}
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

              {/* Achievement reward */}
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

              {err && <p className="text-red-400 text-sm font-fell">{err}</p>}

              <div className="flex gap-3 pt-2">
                <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 text-xs">
                  {saving ? 'Saving…' : 'Save'}
                </button>
                {editingQuest && (
                  <button onClick={handleDelete} disabled={saving} className="btn-outline text-xs text-red-400 border-red-400/40 hover:bg-red-400/10">
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
