'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from './AuthProvider'

// Account avatar (initial letter) + dropdown with sign-out.
export default function AccountMenu({ onNavigate }: { onNavigate?: () => void }) {
  const { user, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!user) return null
  const label = user.name || user.email || 'Account'
  const initial = label.trim().charAt(0).toUpperCase() || '✦'

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="w-8 h-8 rounded-full border border-brand-gold-400/60 bg-brand-card text-brand-gold-300 font-cinzel text-xs flex items-center justify-center hover:border-brand-gold-300 transition-colors"
      >
        {initial}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-60 bg-brand-card border border-brand-border rounded-sm shadow-xl z-50 py-2"
        >
          <div className="px-4 py-2 border-b border-brand-border">
            {user.name && <p className="font-cinzel text-xs tracking-widest text-brand-parchment truncate">{user.name}</p>}
            {user.email && <p className="text-sm text-brand-muted truncate">{user.email}</p>}
          </div>
          <Link
            href="/atelier/signet"
            role="menuitem"
            onClick={() => { setOpen(false); onNavigate?.() }}
            className="block px-4 py-2 font-cinzel text-xs tracking-widest uppercase text-brand-muted hover:text-brand-parchment hover:bg-brand-bg/60"
          >
            The Signet
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => { setOpen(false); onNavigate?.(); signOut() }}
            className="w-full text-left px-4 py-2 font-cinzel text-xs tracking-widest uppercase text-brand-muted hover:text-brand-gold-300 hover:bg-brand-bg/60"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
