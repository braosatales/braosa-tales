'use client'

import { useState } from 'react'
import type { RevealBlock } from '@/lib/hub/types'
import { renderMentions } from '@/lib/hub/mentions'
import { useHub } from '@/components/hub/HubContext'
import { IconEye } from '@/components/hub/RevealIcons'

const WEEK = 7 * 24 * 60 * 60 * 1000

/** Revealed in the last week: worth flagging so players see what's new since last session. */
export function isNew(b: RevealBlock) {
  return b.is_revealed && !!b.revealed_at && Date.now() - new Date(b.revealed_at).getTime() < WEEK
}

type Props = {
  blocks: RevealBlock[]
  /** GM view: every block, with one-click reveal. Players only ever receive revealed blocks. */
  isAdmin: boolean
  onChange?: (blocks: RevealBlock[]) => void
  emptyText?: string
}

/**
 * The body of a lore entry or quest. For players: the blocks revealed so far, newest flagged.
 * For the GM: every block, hidden ones dashed, each with a reveal switch for use mid-session.
 */
export default function RevealBlocks({ blocks, isAdmin, onChange, emptyText }: Props) {
  const { api, base } = useHub()
  const [list, setList] = useState(blocks)
  const [busy, setBusy] = useState<string | null>(null)
  const shown = isAdmin ? list : list.filter((b) => b.is_revealed)

  async function toggle(b: RevealBlock) {
    const next = !b.is_revealed
    const optimistic = list.map((x) => (x.id === b.id ? { ...x, is_revealed: next, revealed_at: next ? new Date().toISOString() : null } : x))
    setList(optimistic)
    setBusy(b.id)
    const res = await fetch(`${api}/blocks/${b.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_revealed: next }) })
    setBusy(null)
    if (!res.ok) {
      setList(list)
      return
    }
    const saved: RevealBlock = await res.json()
    const final = optimistic.map((x) => (x.id === saved.id ? { ...x, ...saved } : x))
    setList(final)
    onChange?.(final)
  }

  if (!shown.length) {
    const text = isAdmin ? 'No blocks yet. Edit this entry to add some.' : emptyText
    return text ? <p className="mb-3 font-fell text-sm italic text-mist">{text}</p> : null
  }

  const hiddenCount = list.filter((b) => !b.is_revealed).length

  return (
    <div className="mb-3 space-y-2">
      {isAdmin && (
        <p className="text-[0.78rem] text-mist">
          {hiddenCount ? `${list.length - hiddenCount} of ${list.length} revealed. Click the eye to reveal a block to players.` : 'Everything here is revealed.'}
        </p>
      )}
      {shown.map((b) =>
        isAdmin ? (
          <div
            key={b.id}
            className={`group flex items-start gap-2 rounded-lg px-3 py-2 ${b.is_revealed ? 'border border-plum-line/60 bg-night/20' : 'border border-dashed border-plum-line bg-night/50'}`}
          >
            <div className={`min-w-0 flex-1 whitespace-pre-wrap font-fell text-sm leading-relaxed ${b.is_revealed ? 'text-prose' : 'text-mist'}`}>
              {renderMentions(b.body, base)}
            </div>
            <button
              type="button"
              onClick={() => toggle(b)}
              disabled={busy === b.id}
              className={`mt-0.5 flex shrink-0 items-center gap-1 rounded-md border px-1.5 py-0.5 text-[0.72rem] transition-colors disabled:opacity-50 ${
                b.is_revealed ? 'border-leaf/30 bg-leaf/10 text-leaf-soft hover:bg-leaf/20' : 'border-plum-line text-mist hover:border-leaf/40 hover:text-vellum'
              }`}
              aria-pressed={b.is_revealed}
              title={b.is_revealed ? 'Players can see this. Click to hide it again.' : 'Hidden from players. Click to reveal.'}
            >
              <IconEye off={!b.is_revealed} size={12} />
              {b.is_revealed ? 'Shown' : 'Hidden'}
            </button>
          </div>
        ) : (
          <div key={b.id} className="whitespace-pre-wrap font-fell text-sm leading-relaxed text-prose">
            {isNew(b) && <span className="mr-1.5 rounded border border-leaf/40 bg-leaf/10 px-1 py-px align-[1px] text-[0.68rem] font-semibold uppercase tracking-wide text-leaf-soft">New</span>}
            {renderMentions(b.body, base)}
          </div>
        ),
      )}
    </div>
  )
}
