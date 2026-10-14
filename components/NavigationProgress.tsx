'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

/**
 * A thin gold bar at the top of the screen that starts the moment a link is clicked
 * and finishes when the new page is in, so slow loads never feel like a dead click.
 */
export default function NavigationProgress() {
  const pathname = usePathname()
  const search = useSearchParams()
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle')
  const timer = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = (e.target as HTMLElement | null)?.closest?.('a[href]') as HTMLAnchorElement | null
      if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return
      const url = new URL(a.href, location.href)
      if (url.origin !== location.origin) return
      if (url.pathname === location.pathname && url.search === location.search) return
      clearTimeout(timer.current)
      setState('loading')
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [])

  // New route rendered: finish the bar, then hide it.
  useEffect(() => {
    setState((s) => (s === 'loading' ? 'done' : s))
    timer.current = setTimeout(() => setState('idle'), 350)
    return () => clearTimeout(timer.current)
  }, [pathname, search])

  if (state === 'idle') return null
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px]">
      <div
        className={`h-full bg-leaf shadow-[0_0_8px_rgba(212,174,88,0.7)] ${
          state === 'loading' ? 'animate-[navprogress_8s_cubic-bezier(0.1,0.7,0.2,1)_forwards]' : 'w-full opacity-0 transition-opacity duration-300'
        }`}
      />
    </div>
  )
}
