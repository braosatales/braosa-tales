'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

type Item = { key: string; node: React.ReactNode }

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

/**
 * A row of campaign cards you can swipe or step through. When there are more cards than fit,
 * the row loops forever: past the last card comes the first again.
 */
export default function CampaignCarousel({ items, label }: { items: Item[]; label: string }) {
  const track = useRef<HTMLDivElement>(null)
  const [loop, setLoop] = useState(false)
  const settle = useRef<ReturnType<typeof setTimeout>>()

  // One copy of the cards: do they overflow? Then switch to the looping three-copy row.
  useEffect(() => {
    const el = track.current
    if (!el) return
    const check = () => {
      if (loop) return
      setLoop(el.scrollWidth > el.clientWidth + 8 && items.length > 1)
    }
    check()
    const ro = new ResizeObserver(check)
    ro.observe(el)
    return () => ro.disconnect()
  }, [items.length, loop])

  const setWidth = useCallback(() => {
    const el = track.current
    if (!el || !loop) return 0
    const kids = el.children
    const first = kids[0] as HTMLElement | undefined
    const firstOfMiddle = kids[items.length] as HTMLElement | undefined
    return first && firstOfMiddle ? firstOfMiddle.offsetLeft - first.offsetLeft : 0
  }, [loop, items.length])

  // Start on the middle copy, with no visible jump.
  useIsoLayoutEffect(() => {
    const el = track.current
    if (el && loop) el.scrollLeft = setWidth()
  }, [loop, setWidth])

  function onScroll() {
    if (!loop) return
    clearTimeout(settle.current)
    settle.current = setTimeout(() => {
      const el = track.current
      const w = setWidth()
      if (!el || !w) return
      if (el.scrollLeft < w * 0.5) el.scrollTo({ left: el.scrollLeft + w, behavior: 'instant' as ScrollBehavior })
      else if (el.scrollLeft >= w * 1.5) el.scrollTo({ left: el.scrollLeft - w, behavior: 'instant' as ScrollBehavior })
    }, 140)
  }

  function step(dir: 1 | -1) {
    const el = track.current
    if (!el) return
    const card = el.children[0] as HTMLElement | undefined
    const gap = parseFloat(getComputedStyle(el).columnGap || '0') || 0
    el.scrollBy({ left: dir * ((card?.offsetWidth ?? el.clientWidth) + gap), behavior: 'smooth' })
  }

  const copies = loop ? [0, 1, 2] : [1]

  return (
    <div className="relative">
      <div
        ref={track}
        onScroll={onScroll}
        role="region"
        aria-roledescription="carousel"
        aria-label={label}
        tabIndex={0}
        className="relative -mx-6 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-px-6 px-6 pb-2 [scrollbar-width:none] focus:outline-none md:-mx-10 md:scroll-px-10 md:px-10 [&::-webkit-scrollbar]:hidden"
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') step(1)
          if (e.key === 'ArrowLeft') step(-1)
        }}
      >
        {copies.flatMap((copy) =>
          items.map((it) => (
            <div
              key={`${copy}-${it.key}`}
              id={copy === 1 ? it.key : undefined}
              aria-hidden={copy !== 1 ? true : undefined}
              ref={(n) => {
                if (n) {
                  if (copy !== 1) n.setAttribute('inert', '')
                  else n.removeAttribute('inert')
                }
              }}
              className="relative w-[min(540px,86vw)] shrink-0 scroll-mt-28 snap-start"
            >
              {it.node}
            </div>
          ))
        )}
      </div>

      {loop && (
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={() => step(-1)} aria-label="Previous campaign" className="flex h-11 w-11 items-center justify-center rounded-full border border-vellum/25 text-vellum transition-colors hover:border-leaf hover:text-leaf-soft">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <button type="button" onClick={() => step(1)} aria-label="Next campaign" className="flex h-11 w-11 items-center justify-center rounded-full border border-vellum/25 text-vellum transition-colors hover:border-leaf hover:text-leaf-soft">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
      )}
    </div>
  )
}
