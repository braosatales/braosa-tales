'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from './AuthProvider'
import UserMenuContent from './UserMenuContent'

// Account avatar (initial letter) + dropdown: dashboard, active campaigns, favourite apps, sign out.
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
        className="w-8 h-8 rounded-full border border-leaf/60 bg-plum text-leaf-soft font-cinzel text-xs flex items-center justify-center hover:border-leaf-soft transition-colors"
      >
        {initial}
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Account"
          className="absolute right-0 z-50 mt-3 w-[19rem] max-h-[calc(100vh-6rem)] overflow-y-auto rounded-2xl border border-plum-line bg-plum shadow-[0_24px_60px_-12px_rgba(0,0,0,0.7)]"
        >
          <UserMenuContent
            name={user.name}
            email={user.email}
            open={open}
            onNavigate={() => { setOpen(false); onNavigate?.() }}
            onSignOut={() => { setOpen(false); onNavigate?.(); signOut() }}
          />
        </div>
      )}
    </div>
  )
}
