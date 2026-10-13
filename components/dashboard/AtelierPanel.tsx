'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { TOOLS, isLive, type AtelierTool } from '@/lib/atelier'

function StarButton({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      aria-label={label}
      className={`rounded-full p-1.5 text-[1.1rem] leading-none transition-colors ${on ? 'text-leaf' : 'text-mist/40 hover:text-leaf-soft'}`}
    >
      {on ? '★' : '☆'}
    </button>
  )
}

function ToolTile({ t, pinned, onToggle }: { t: AtelierTool; pinned: boolean; onToggle: () => void }) {
  const live = isLive(t)
  const inner = (
    <>
      <Image src={`/icons/atelier/48/${t.icon}`} width={40} height={40} alt="" unoptimized className={live ? '' : 'opacity-60'} />
      <div className="min-w-0 flex-1">
        <p className="font-cinzel text-[0.9rem] font-bold leading-tight text-vellum">{t.name}</p>
        <p className="text-[0.85rem] leading-snug text-mist">{live ? 'Open' : 'Coming soon'}</p>
      </div>
    </>
  )
  return (
    <li className="flex items-center gap-2 rounded-xl border border-plum-line bg-night/40 py-3 pl-4 pr-2">
      {live ? (
        <Link href={t.href!} className="flex min-w-0 flex-1 items-center gap-3 hover:[&_p:first-child]:text-amethyst">
          {inner}
        </Link>
      ) : (
        <div className="flex min-w-0 flex-1 items-center gap-3">{inner}</div>
      )}
      <StarButton on={pinned} onClick={onToggle} label={pinned ? `Unpin ${t.name}` : `Pin ${t.name}`} />
    </li>
  )
}

export default function AtelierPanel({ initialPins }: { initialPins: string[] }) {
  const [pins, setPins] = useState<Set<string>>(new Set(initialPins))
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function toggle(slug: string) {
    const next = new Set(pins)
    const pinned = !next.has(slug)
    pinned ? next.add(slug) : next.delete(slug)
    setPins(next)
    setError(null)
    const res = await fetch('/api/dashboard/pins', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, pinned }),
    })
    if (!res.ok) {
      setPins(new Set(pins)) // undo
      setError('That pin didn’t save. Try again.')
    }
  }

  // Live tools always show; pinned ones join them.
  const shown = TOOLS.filter((t) => isLive(t) || pins.has(t.slug))

  return (
    <div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {shown.map((t) => (
          <ToolTile key={t.slug} t={t} pinned={pins.has(t.slug)} onToggle={() => toggle(t.slug)} />
        ))}
      </ul>
      {error && <p role="alert" className="mt-3 text-[0.9rem] text-leaf-soft">{error}</p>}

      <button
        type="button"
        onClick={() => setEditing((e) => !e)}
        aria-expanded={editing}
        className="mt-5 text-[0.95rem] text-leaf-soft underline decoration-leaf/40 underline-offset-[0.3em] hover:text-vellum"
      >
        {editing ? 'Done' : 'Pin more tools'}
      </button>

      {editing && (
        <ul className="mt-4 grid gap-x-8 border-t border-plum-line sm:grid-cols-2">
          {TOOLS.filter((t) => !isLive(t)).map((t) => (
            <li key={t.slug} className="flex items-center gap-3 border-b border-plum-line py-2.5">
              <Image src={`/icons/atelier/48/${t.icon}`} width={28} height={28} alt="" unoptimized className="opacity-70" />
              <span className="flex-1 text-[0.95rem] text-prose">{t.name}</span>
              <StarButton on={pins.has(t.slug)} onClick={() => toggle(t.slug)} label={pins.has(t.slug) ? `Unpin ${t.name}` : `Pin ${t.name}`} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
