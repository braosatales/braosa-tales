'use client'

import { useEffect, useState } from 'react'

const LINE_1 = 'Every world begins '
const LINE_2 = 'with a word.'
const FULL = LINE_1 + LINE_2

/**
 * The hero phrase, typed out letter by letter with a blinking cursor.
 * The full phrase is laid out invisibly underneath so nothing shifts while it types,
 * and screen readers / search engines get the whole sentence at once.
 * Shows instantly for people who prefer reduced motion.
 */
export default function TypewriterHeadline({ className = '' }: { className?: string }) {
  const [count, setCount] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCount(FULL.length)
      setDone(true)
      return
    }
    let tick: ReturnType<typeof setInterval>
    const start = setTimeout(() => {
      tick = setInterval(() => {
        setCount((c) => {
          if (c + 1 >= FULL.length) {
            clearInterval(tick)
            setDone(true)
          }
          return Math.min(c + 1, FULL.length)
        })
      }, 65)
    }, 500)
    return () => {
      clearTimeout(start)
      clearInterval(tick)
    }
  }, [])

  const typed1 = FULL.slice(0, Math.min(count, LINE_1.length))
  const typed2 = count > LINE_1.length ? FULL.slice(LINE_1.length, count) : ''
  const cursor = (
    <span aria-hidden="true" className={`ml-[0.04em] inline-block w-[0.06em] -translate-y-[0.04em] bg-leaf align-baseline ${done ? 'animate-[blink_0.9s_step-end_infinite]' : ''}`} style={{ height: '0.82em' }} />
  )

  return (
    <h1 className={`relative ${className}`} aria-label={FULL}>
      {/* Invisible full text reserves the final size */}
      <span aria-hidden="true" className="invisible">
        {LINE_1}
        <span className="sm:block">{LINE_2}</span>
      </span>
      {/* Typed text on top */}
      <span aria-hidden="true" className="absolute inset-0">
        {typed1}
        {count <= LINE_1.length && cursor}
        {count > LINE_1.length && (
          <span className="sm:block">
            {typed2}
            {cursor}
          </span>
        )}
      </span>
    </h1>
  )
}
