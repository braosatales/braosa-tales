'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useHub } from './HubContext'

/** Pin a lore entry or quest to your campaign overview. */
export default function PinToggle({ kind, itemId, withLabel = false }: { kind: 'lore' | 'quest'; itemId: string; withLabel?: boolean }) {
  const { api, pinned } = useHub()
  const router = useRouter()
  const [on, setOn] = useState(pinned.includes(itemId))
  const [pending, start] = useTransition()

  async function toggle(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    const next = !on
    setOn(next)
    const res = await fetch(`${api}/pins`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind, itemId, pinned: next }) })
    if (!res.ok) setOn(!next)
    start(() => router.refresh())
  }

  const label = on ? 'Unpin from your overview' : 'Pin to your overview'
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      aria-label={label}
      title={label}
      disabled={pending}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full p-2 transition-colors ${
        on ? 'text-leaf hover:text-leaf-soft' : 'text-mist/70 hover:text-vellum'
      } ${withLabel ? 'border border-plum-line px-3 py-1.5 text-[0.85rem]' : ''}`}
    >
      <svg viewBox="0 0 24 24" width="17" height="17" fill={on ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
        <path d="M9 3h6l-1 6 4 4v2h-5v6l-1 1-1-1v-6H6v-2l4-4-1-6Z" strokeLinejoin="round" />
      </svg>
      {withLabel && (on ? 'Pinned' : 'Pin')}
    </button>
  )
}
