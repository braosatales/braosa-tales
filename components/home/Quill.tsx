'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * A gold quill that drifts down the right-hand margin as the page scrolls,
 * drawing a faint ink line behind it. Desktop-wide screens only; static for
 * people who prefer reduced motion. Purely decorative (aria-hidden).
 *
 * Place it once, as the first child of a `relative` wrapper around the page
 * content. It ends where an element with id="quill-end" begins.
 */

const AMPLITUDE = 26 // px of sideways sway
const WAVELENGTH = 300 // px of page per half swing
const ANCHOR = 0.42 // feather sits at 42% of the viewport height

function swayX(y: number) {
  return Math.sin(y / WAVELENGTH) * AMPLITUDE + Math.sin(y / (WAVELENGTH * 2.7)) * AMPLITUDE * 0.45
}

export default function Quill() {
  const wrap = useRef<HTMLDivElement>(null)
  const feather = useRef<HTMLDivElement>(null)
  const clip = useRef<SVGRectElement>(null)
  const [path, setPath] = useState({ d: '', height: 0, start: 0, end: 0, cx: 60, width: 120 })

  // Build the ink path for the current page height.
  useEffect(() => {
    const el = wrap.current?.parentElement
    if (!el) return
    const build = () => {
      const top = el.getBoundingClientRect().top + window.scrollY
      const endEl = document.getElementById('quill-end')
      const height = el.offsetHeight
      const end = endEl ? endEl.getBoundingClientRect().top + window.scrollY - top + 150 : height
      const start = window.innerHeight * 0.55
      const cx = (wrap.current?.offsetWidth ?? 120) / 2
      let d = ''
      for (let y = start; y <= end; y += 12) d += `${d ? 'L' : 'M'}${(cx + swayX(y)).toFixed(1)} ${y.toFixed(1)} `
      setPath({ d, height, start, end, cx, width: wrap.current?.offsetWidth ?? 120 })
    }
    build()
    const ro = new ResizeObserver(build)
    ro.observe(el)
    window.addEventListener('resize', build)
    return () => { ro.disconnect(); window.removeEventListener('resize', build) }
  }, [])

  // Move the feather and reveal the ink as you scroll.
  useEffect(() => {
    if (!path.d) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const el = wrap.current?.parentElement
    if (!el) return
    let frame = 0
    const update = () => {
      frame = 0
      const top = el.getBoundingClientRect().top + window.scrollY
      const vh = window.innerHeight
      let y = window.scrollY - top + vh * ANCHOR // page-y of the feather tip
      y = Math.max(path.start, Math.min(path.end, y))
      const x = path.cx + swayX(y)
      const slope = swayX(y + 1) - swayX(y) // dx per px of y
      const angle = Math.atan(slope) * (180 / Math.PI)
      const screenY = y + top - window.scrollY
      if (feather.current && wrap.current) {
        feather.current.style.left = `${wrap.current.getBoundingClientRect().left}px`
        feather.current.style.transform = `translate3d(${x - 40}px, ${screenY}px, 0) rotate(${(-angle * 1.6 + 14).toFixed(2)}deg)`
        feather.current.style.opacity = screenY < -60 || screenY > vh + 60 ? '0' : '1'
      }
      if (clip.current) clip.current.setAttribute('height', String(Math.max(0, y)))
    }
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update) }
    update()
    if (reduced) return
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [path])

  return (
    <div ref={wrap} aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 z-30 hidden w-[calc((100%-1180px)/2)] min-[1400px]:block">
      {path.d && (
        <svg className="absolute left-0 top-0" width={path.width} height={path.height} viewBox={`0 0 ${path.width} ${path.height}`} fill="none">
          <defs>
            <clipPath id="ink-reveal">
              <rect ref={clip} x="0" y="0" width={path.width} height="0" />
            </clipPath>
            <linearGradient id="ink-fade" x1="0" y1="0" x2="0" y2={path.height} gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#D4AE58" stopOpacity="0" />
              <stop offset={path.start / path.height + 0.03} stopColor="#D4AE58" stopOpacity="0.45" />
              <stop offset="1" stopColor="#D4AE58" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          <path d={path.d} stroke="url(#ink-fade)" strokeWidth="1.25" strokeLinecap="round" clipPath="url(#ink-reveal)" />
        </svg>
      )}

      {/* The quill — positioned with `fixed` so it stays in view while the page moves */}
      <div ref={feather} className="fixed left-0 top-0 w-[120px] origin-[40px_0px] transition-opacity duration-300">
        <svg width="56" height="150" viewBox="0 0 56 150" className="ml-[12px] -translate-y-[146px] drop-shadow-[0_6px_18px_rgba(212,174,88,0.25)]">
          <defs>
            <linearGradient id="vane" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#F4DE9F" />
              <stop offset="0.55" stopColor="#D4AE58" />
              <stop offset="1" stopColor="#8C6420" />
            </linearGradient>
          </defs>
          {/* vane, with a split on the left edge */}
          <path
            d="M30 4 C44 22 48 52 42 86 C39 102 34 116 29 128 C27 118 24 110 20 104 L25 98 C19 96 14 88 13 78 C9 50 15 22 30 4 Z"
            fill="url(#vane)"
            opacity="0.92"
          />
          {/* barbs */}
          <g stroke="#7A5418" strokeWidth="0.7" opacity="0.45" fill="none">
            <path d="M29 26 Q37 22 41 18" /><path d="M29 40 Q38 36 44 30" /><path d="M29 54 Q39 50 45 44" />
            <path d="M29 68 Q38 66 44 60" /><path d="M29 82 Q37 80 42 76" /><path d="M29 96 Q35 94 39 90" />
            <path d="M29 32 Q21 28 17 22" /><path d="M29 46 Q19 42 14 36" /><path d="M29 60 Q19 58 13 52" />
            <path d="M29 74 Q20 72 14 68" />
          </g>
          {/* shaft and nib */}
          <path d="M30 6 C29 50 29 100 28.5 146" stroke="#F7EBC8" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M28.5 136 L28.5 148" stroke="#3A2A12" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  )
}
