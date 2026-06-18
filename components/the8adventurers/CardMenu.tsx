'use client'

import { useState, useEffect, useRef } from 'react'

type Props = {
  isAdmin: boolean
  onView: () => void
  onEdit?: () => void
  onDelete?: () => void
}

export default function CardMenu({ isAdmin, onView, onEdit, onDelete }: Props) {
  const [open, setOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setConfirmDelete(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); setConfirmDelete(false) }}
        className="w-7 h-7 flex items-center justify-center text-brand-muted hover:text-brand-parchment transition-colors rounded-sm hover:bg-brand-border/30"
        aria-label="Card options"
        title="Options"
      >
        <svg width="16" height="4" viewBox="0 0 16 4" fill="currentColor" aria-hidden="true">
          <circle cx="2" cy="2" r="1.5" />
          <circle cx="8" cy="2" r="1.5" />
          <circle cx="14" cy="2" r="1.5" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-8 z-40 bg-brand-card border border-brand-border rounded-sm shadow-lg min-w-[130px]">
          <button
            onClick={(e) => { e.stopPropagation(); setOpen(false); onView() }}
            className="w-full text-left px-3 py-2 text-sm font-fell text-brand-parchment hover:bg-brand-purple-600/20 transition-colors"
          >
            View
          </button>

          {isAdmin && onEdit && (
            <button
              onClick={(e) => { e.stopPropagation(); setOpen(false); onEdit() }}
              className="w-full text-left px-3 py-2 text-sm font-fell text-brand-parchment hover:bg-brand-purple-600/20 transition-colors border-t border-brand-border/40"
            >
              Edit
            </button>
          )}

          {isAdmin && onDelete && !confirmDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); setConfirmDelete(true) }}
              className="w-full text-left px-3 py-2 text-sm font-fell text-red-400 hover:bg-red-400/10 transition-colors border-t border-brand-border/40"
            >
              Delete
            </button>
          )}

          {isAdmin && onDelete && confirmDelete && (
            <div className="border-t border-brand-border/40 p-2 space-y-1.5">
              <p className="text-[10px] font-fell text-brand-muted px-1">Are you sure?</p>
              <div className="flex gap-1.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setOpen(false)
                    setConfirmDelete(false)
                    onDelete()
                  }}
                  className="flex-1 px-2 py-1 text-[10px] font-cinzel text-red-400 border border-red-400/40 rounded-sm hover:bg-red-400/10 transition-colors"
                >
                  Yes
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setConfirmDelete(false) }}
                  className="flex-1 px-2 py-1 text-[10px] font-cinzel text-brand-muted border border-brand-border rounded-sm hover:bg-brand-border/30 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
