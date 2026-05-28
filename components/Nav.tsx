'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, Suspense } from 'react'
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import CreditsBadge from '@/app/atelier/signet/CreditsBadge'

const links = [
  { href: '/', label: 'Home' },
  { href: '/stories', label: 'Stories' },
  { href: '/games', label: 'Games' },
  { href: '/atelier', label: 'Tools' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/about', label: 'About' },
]

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-brand-bg/80 backdrop-blur-sm border-b border-brand-border">
      <Link href="/" className="flex items-center gap-3">
        <Image src="/mark-purple.png" alt="Braosa Tales" width={36} height={36} className="opacity-90" />
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
        <SignedOut>
          <Link
            href="/sign-in"
            className="font-cinzel text-xs tracking-widest uppercase text-brand-muted hover:text-brand-parchment transition-colors"
          >
            Sign in
          </Link>
          <Link href="/sign-up" className="btn-primary text-xs py-2 px-4">
            Get started
          </Link>
        </SignedOut>
        <SignedIn>
          <Suspense fallback={null}>
            <CreditsBadge />
          </Suspense>
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: 'w-8 h-8',
              },
            }}
          />
        </SignedIn>
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
          <SignedOut>
            <Link
              href="/sign-in"
              className="font-cinzel text-xs tracking-widest uppercase text-brand-muted text-left"
              onClick={() => setMenuOpen(false)}
            >
              Sign in
            </Link>
            <Link href="/sign-up" className="btn-primary text-xs py-2 px-4 text-center" onClick={() => setMenuOpen(false)}>Get started</Link>
          </SignedOut>
          <SignedIn>
            <div style={{
              padding: "16px 24px",
              borderBottom: "1px solid rgba(237,224,200,0.08)",
              display: "flex",
              justifyContent: "center",
            }}>
              <CreditsBadge/>
            </div>
          </SignedIn>
          <SignedIn>
            <div className="flex items-center gap-3">
              <UserButton afterSignOutUrl="/" />
              <span className="font-cinzel text-xs tracking-widest uppercase text-brand-muted">Account</span>
            </div>
          </SignedIn>
        </div>
      )}
    </nav>
  )
}