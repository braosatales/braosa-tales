'use client'

import { useState } from 'react'
import type { LinkedLoreEntry } from '@/lib/hub/types'
import { useHub } from '@/components/hub/HubContext'
import { IconEye } from '@/components/hub/RevealIcons'

type Props = {
  entryId: string
  kind: 'faction' | 'location'
  links: LinkedLoreEntry[]
  isAdmin: boolean
  onNavigate?: (id: string) => void
  onChange?: (links: LinkedLoreEntry[]) => void
}

/** Faction or location links on an entry. The GM sees all of them and can reveal each one; players only get revealed ones. */
export default function LinkChips({ entryId, kind, links, isAdmin, onNavigate, onChange }: Props) {
  const { api } = useHub()
  const [list, setList] = useState(links)
  if (!list.length) return null

  async function toggle(l: LinkedLoreEntry) {
    const next = list.map((x) => (x.id === l.id ? { ...x, is_revealed: !l.is_revealed } : x))
    setList(next)
    const res = await fetch(`${api}/lore/${entryId}/links`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind, target_id: l.id, is_revealed: !l.is_revealed }),
    })
    if (!res.ok) return setList(list)
    onChange?.(next)
  }

  const tone = kind === 'faction' ? 'text-amethyst bg-amethyst-deep/20 border-amethyst-deep/30' : 'text-leaf-soft bg-leaf/10 border-leaf/30'

  return (
    <div className="mb-2 flex flex-wrap items-center gap-1.5">
      <span className="font-fell text-xs text-mist">{kind === 'faction' ? 'Faction:' : 'Location:'}</span>
      {list.map((l) => {
        // Players can see a link only when it's revealed AND the linked entry is visible.
        const playersSee = !!l.is_revealed && !l.target_secret
        return (
          <span key={l.id} className={`inline-flex items-center overflow-hidden rounded-lg border ${isAdmin && !playersSee ? 'border-dashed border-plum-line text-mist' : tone}`}>
            <button
              type="button"
              onClick={onNavigate ? () => onNavigate(l.id) : undefined}
              disabled={!onNavigate}
              className={`px-2 py-0.5 font-fell text-xs ${onNavigate ? 'cursor-pointer hover:underline' : 'cursor-default'}`}
            >
              {l.title}
            </button>
            {isAdmin && (
              <button
                type="button"
                onClick={() => toggle(l)}
                className="border-l border-current/20 px-1.5 py-1 opacity-80 hover:opacity-100"
                aria-pressed={!!l.is_revealed}
                aria-label={l.is_revealed ? `Hide link to ${l.title}` : `Reveal link to ${l.title}`}
                title={
                  l.target_secret
                    ? `${l.title} is itself hidden, so players can't see this link until you make it visible.`
                    : l.is_revealed
                      ? 'Players can see this link. Click to hide it.'
                      : 'Hidden from players. Click to reveal.'
                }
              >
                <IconEye off={!l.is_revealed} size={11} />
              </button>
            )}
          </span>
        )
      })}
    </div>
  )
}
