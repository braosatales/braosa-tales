'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

type Props = {
  isAdmin: boolean
  onEdit?: () => void
  onDelete?: () => void
  onToggleSecret?: () => void
  isSecret?: boolean
  variant?: 'grid' | 'list'
}

type MenuPos = { top: number; right: number; flipUp: boolean }

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

function DotsIcon() {
  return (
    <svg width="16" height="4" viewBox="0 0 16 4" fill="currentColor" aria-hidden="true">
      <circle cx="2" cy="2" r="1.5" />
      <circle cx="8" cy="2" r="1.5" />
      <circle cx="14" cy="2" r="1.5" />
    </svg>
  )
}

function DropdownMenu({
  pos,
  onEdit,
  onToggleSecret,
  onDelete,
  onClose,
}: {
  pos: MenuPos
  onEdit?: () => void
  onToggleSecret?: () => void
  onDelete?: () => void
  onClose: () => void
}) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Timeout so the click that opened the menu doesn't immediately close it
    const t = setTimeout(() => {
      function handler(e: MouseEvent) {
        if (ref.current && !ref.current.contains(e.target as Node)) {
          onClose()
        }
      }
      document.addEventListener('mousedown', handler)
      return () => document.removeEventListener('mousedown', handler)
    }, 0)
    return () => clearTimeout(t)
  }, [onClose])

  useEffect(() => {
    function handler() { onClose() }
    window.addEventListener('scroll', handler, { capture: true, passive: true })
    return () => window.removeEventListener('scroll', handler, { capture: true })
  }, [onClose])

  const style: React.CSSProperties = {
    position: 'fixed',
    right: pos.right,
    zIndex: 9999,
    ...(pos.flipUp
      ? { bottom: window.innerHeight - pos.top }
      : { top: pos.top }),
  }

  return createPortal(
    <div
      ref={ref}
      style={style}
      className="bg-brand-card border border-brand-border rounded-sm shadow-lg min-w-[130px]"
    >
      {onEdit && (
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); onEdit() }}
          className="w-full text-left px-3 py-2 text-sm font-fell text-brand-parchment hover:bg-brand-purple-600/20 transition-colors"
        >
          Edit
        </button>
      )}
      {onToggleSecret && (
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); onToggleSecret() }}
          className={`w-full text-left px-3 py-2 text-sm font-fell text-brand-parchment hover:bg-brand-purple-600/20 transition-colors${onEdit ? ' border-t border-brand-border/40' : ''}`}
        >
          Toggle Secret
        </button>
      )}
      {onDelete && !confirmDelete && (
        <button
          onClick={(e) => { e.stopPropagation(); setConfirmDelete(true) }}
          className={`w-full text-left px-3 py-2 text-sm font-fell text-red-400 hover:bg-red-400/10 transition-colors${(onEdit || onToggleSecret) ? ' border-t border-brand-border/40' : ''}`}
        >
          Delete
        </button>
      )}
      {onDelete && confirmDelete && (
        <div className={`p-2 space-y-1.5${(onEdit || onToggleSecret) ? ' border-t border-brand-border/40' : ''}`}>
          <p className="text-[10px] font-fell text-brand-muted px-1">Are you sure?</p>
          <div className="flex gap-1.5">
            <button
              onClick={(e) => { e.stopPropagation(); onClose(); onDelete() }}
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
    </div>,
    document.body
  )
}

export default function CardMenu({
  isAdmin,
  onEdit,
  onDelete,
  onToggleSecret,
  isSecret,
  variant = 'grid',
}: Props) {
  const [open, setOpen] = useState(false)
  const [menuPos, setMenuPos] = useState<MenuPos | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)

  function openDropdown(e: React.MouseEvent) {
    e.stopPropagation()
    if (open) {
      setOpen(false)
      setMenuPos(null)
      return
    }
    if (!btnRef.current) return
    const rect = btnRef.current.getBoundingClientRect()
    const estimatedHeight = 130
    const flipUp = rect.bottom + estimatedHeight > window.innerHeight - 20
    setMenuPos({
      top: flipUp ? rect.top : rect.bottom + 4,
      right: window.innerWidth - rect.right,
      flipUp,
    })
    setOpen(true)
  }

  function closeDropdown() {
    setOpen(false)
    setMenuPos(null)
  }

  if (!isAdmin) return null

  // ─── List variant ───────────────────────────────────────────────────────────
  if (variant === 'list') {
    return (
      <div className="flex items-center flex-shrink-0" onClick={(e) => e.stopPropagation()}>
        {/* Desktop: 3 icon buttons, revealed on row hover via group-hover */}
        <div className="hidden md:flex items-center gap-0.5">
          {confirmDelete ? (
            <div className="flex items-center gap-1.5 bg-red-900/20 border border-red-800/40 rounded-sm px-2 py-1">
              <span className="font-fell text-[10px] text-red-300">Delete?</span>
              <button
                onClick={(e) => { e.stopPropagation(); setConfirmDelete(false); onDelete?.() }}
                className="font-cinzel text-[10px] text-red-400 hover:text-red-300 transition-colors px-1"
              >
                Yes
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setConfirmDelete(false) }}
                className="font-cinzel text-[10px] text-brand-muted hover:text-brand-parchment transition-colors px-1"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
              {onEdit && (
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit() }}
                  className="w-9 h-9 flex items-center justify-center text-brand-muted hover:text-brand-parchment transition-colors rounded-sm hover:bg-brand-border/30"
                  aria-label="Edit"
                  title="Edit"
                >
                  <IconEdit />
                </button>
              )}
              {onToggleSecret && (
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleSecret() }}
                  className="w-9 h-9 flex items-center justify-center text-brand-muted hover:text-brand-parchment transition-colors rounded-sm hover:bg-brand-border/30"
                  aria-label={isSecret ? 'Make public' : 'Make secret'}
                  title={isSecret ? 'Make public' : 'Make secret'}
                >
                  <IconEye off={isSecret} />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={(e) => { e.stopPropagation(); setConfirmDelete(true) }}
                  className="w-9 h-9 flex items-center justify-center text-brand-muted hover:text-red-400 transition-colors rounded-sm hover:bg-red-400/10"
                  aria-label="Delete"
                  title="Delete"
                >
                  <IconTrash />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Mobile: "..." portal dropdown */}
        <button
          ref={btnRef}
          onClick={openDropdown}
          className="flex md:hidden w-7 h-7 items-center justify-center text-brand-muted hover:text-brand-parchment transition-colors rounded-sm hover:bg-brand-border/30"
          aria-label="Card options"
          title="Options"
        >
          <DotsIcon />
        </button>

        {open && menuPos && (
          <DropdownMenu
            pos={menuPos}
            onEdit={onEdit}
            onToggleSecret={onToggleSecret}
            onDelete={onDelete}
            onClose={closeDropdown}
          />
        )}
      </div>
    )
  }

  // ─── Grid variant (default): portal-based "..." dropdown ───────────────────
  return (
    <div onClick={(e) => e.stopPropagation()}>
      <button
        ref={btnRef}
        onClick={openDropdown}
        className="w-7 h-7 flex items-center justify-center text-brand-muted hover:text-brand-parchment transition-colors rounded-sm hover:bg-brand-border/30"
        aria-label="Card options"
        title="Options"
      >
        <DotsIcon />
      </button>

      {open && menuPos && (
        <DropdownMenu
          pos={menuPos}
          onEdit={onEdit}
          onToggleSecret={onToggleSecret}
          onDelete={onDelete}
          onClose={closeDropdown}
        />
      )}
    </div>
  )
}
