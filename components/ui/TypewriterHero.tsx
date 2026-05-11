'use client'

import { useState, useEffect } from 'react'

const phrase = 'Every world begins with a word.'

export default function TypewriterHero() {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    const start = setTimeout(() => {
      let i = 0
      const tick = setInterval(() => {
        i++
        setDisplayed(phrase.slice(0, i))
        if (i === phrase.length) {
          clearInterval(tick)
          setDone(true)
        }
      }, 65)
      return () => clearInterval(tick)
    }, 600)
    return () => clearTimeout(start)
  }, [])

  return (
    <>
      <style>{`
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        .cursor-blink { animation: blink 0.75s step-end infinite; }
      `}</style>
      <p
        className="font-cinzel text-4xl md:text-6xl text-center"
        style={{ color: '#D4AE58' }}
      >
        {displayed}
        <span className="cursor-blink">|</span>
      </p>
    </>
  )
}
