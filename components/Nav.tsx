'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

const links = [
  { href: '/tools', label: 'Tools' },
  { href: '/stories', label: 'Stories' },
  { href: '/games', label: 'Games' },
  { href: '/blog', label: 'Blog' },
]

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
      <Link href="/" className="flex items-center gap-3">
        {/* Swap src for your actual logo file in /public */}
        {/* <Image src="/logo-purple.png" alt="Braosa Tales" width={36} height={36} /> */}
        <span className="font-cinzel font-bold text-brand-purple-600 tracking-widest text-base">
          BRAOSA TALES
        </span>
      </Link>

      {/* Desktop links */}
      <div className="hidden md:flex items-center gap-8">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="text-sm text-gray-500 hover:text-brand-purple-600 transition-colors"
          >
            {l.label}
          </Link>
        ))}
      </div>

      <div className="hidden md:flex items-center gap-3">
        <Link href="/login" className="text-sm text-gray-500 hover:text-brand-purple-600 transition-colors">
          Sign in
        </Link>
        <Link href="/signup" className="btn-primary text-sm py-2 px-4">
          Get started
        </Link>
      </div>

      {/* Mobile menu button */}
      <button
        className="md:hidden text-gray-500"
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

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="absolute top-[68px] left-0 right-0 bg-white border-b border-gray-100 px-8 py-4 flex flex-col gap-4 z-50 md:hidden">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm text-gray-600" onClick={() => setMenuOpen(false)}>
              {l.label}
            </Link>
          ))}
          <hr className="border-gray-100" />
          <Link href="/login" className="text-sm text-gray-600" onClick={() => setMenuOpen(false)}>Sign in</Link>
          <Link href="/signup" className="btn-primary text-sm py-2 px-4 text-center" onClick={() => setMenuOpen(false)}>Get started</Link>
        </div>
      )}
    </nav>
  )
}
