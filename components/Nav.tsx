'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

const links = [
  { href: '/atelier', label: 'Atelier' },
  { href: '/stories', label: 'Stories' },
  { href: '/games', label: 'Games' },
  { href: '/blog', label: 'Blog' },
]

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-brand-bg/80 backdrop-blur-sm border-b border-brand-border">
      <Link href="/" className="flex items-center gap-3">
        <Image src="/logo-mark.png" alt="Braosa Tales" width={36} height={36} className="opacity-90" />
        <span className="font-cinzel font-bold text-brand-parchment tracking-widest text-sm hidden sm:block">
          BRAOSA TALES
        </span>
      </Link>

      <div className="hidden md:flex items-center gap-8">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="font-cinzel text-xs tracking-widest uppercase text-brand-muted hover:text-brand-parchment transition-colors"
          >
            {l.label}
          </Link>
        ))}
      </div>

      <div className="hidden md:flex items-center gap-3">
        <Link href="/login" className="font-cinzel text-xs tracking-widest uppercase text-brand-muted hover:text-brand-parchment transition-colors">
          Sign in
        </Link>
        <Link href="/signup" className="btn-primary text-xs py-2 px-4">
          Get started
        </Link>
      </div>

      <button
        className="md:hidden text-brand-muted"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          {menuOpen
            ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          }
        </svg>
      </button>

      {menuOpen && (
        <div className="absolute top-[64px] left-0 right-0 bg-brand-bg border-b border-brand-border px-8 py-6 flex flex-col gap-5 z-50 md:hidden">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="font-cinzel text-xs tracking-widest uppercase text-brand-muted" onClick={() => setMenuOpen(false)}>
              {l.label}
            </Link>
          ))}
          <hr className="border-brand-border" />
          <Link href="/login" className="font-cinzel text-xs tracking-widest uppercase text-brand-muted" onClick={() => setMenuOpen(false)}>Sign in</Link>
          <Link href="/signup" className="btn-primary text-xs py-2 px-4 text-center" onClick={() => setMenuOpen(false)}>Get started</Link>
        </div>
      )}
    </nav>
  )
}
