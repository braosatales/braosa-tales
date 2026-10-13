'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import AccountMenu from '@/components/auth/AccountMenu'
import CreditsBadge from '@/app/atelier/signet/CreditsBadge'

const links = [
  { href: '/games', label: 'Sessions' },
  { href: '/atelier', label: 'Atelier' },
  { href: '/stories', label: 'Stories' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/about', label: 'About' },
]

interface NavProps {
  userProfile?: {
    tier: string
    credits: number
    daily_credits: number
    credits_reset_date: string
    daily_reset_date: string
  } | null
}

export default function Nav({ userProfile }: NavProps = {}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { isSignedIn, signOut } = useAuth()
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setMenuOpen(false), [pathname])

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)
  const solid = scrolled || menuOpen

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300 ${
        solid ? 'border-b border-plum-line/70 bg-night/85 backdrop-blur-md' : 'border-b border-transparent bg-transparent'
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-[1180px] items-center justify-between gap-6 px-6 md:px-10" aria-label="Main">
        <Link href="/" className="flex shrink-0 items-center gap-3" aria-label="Braosa Tales, home">
          <Image src="/mark-purple.png" alt="" width={34} height={34} />
          <span className="hidden font-cinzel text-[0.85rem] font-bold tracking-[0.18em] text-vellum sm:block">BRAOSA TALES</span>
        </Link>

        <ul className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                aria-current={isActive(l.href) ? 'page' : undefined}
                className={`text-[0.95rem] transition-colors hover:text-vellum ${
                  isActive(l.href) ? 'text-leaf-soft' : 'text-prose/80'
                }`}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-4 md:flex">
          {!isSignedIn ? (
            <>
              <Link href="/sign-in" className="text-[0.95rem] text-prose/80 transition-colors hover:text-vellum">
                Sign in
              </Link>
              <Link href="/#campaigns" className="btn-gold px-5 py-2">
                Book a seat
              </Link>
            </>
          ) : (
            <>
              <Suspense fallback={null}>
                <CreditsBadge initialProfile={userProfile ?? null} />
              </Suspense>
              <AccountMenu />
            </>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          {!isSignedIn && (
            <Link href="/#campaigns" className="btn-gold px-4 py-1.5 text-[0.72rem]">
              Book a seat
            </Link>
          )}
        <button
          className="-mr-2 rounded p-2 text-prose md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
        >
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
        </div>
      </nav>

      {menuOpen && (
        <div id="mobile-menu" className="border-t border-plum-line/70 bg-night/95 px-6 pb-8 pt-4 backdrop-blur-md md:hidden">
          <ul className="flex flex-col">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={`block py-3 font-cinzel text-[1.1rem] ${isActive(l.href) ? 'text-leaf-soft' : 'text-vellum'}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-col gap-3 border-t border-plum-line pt-6">
            {!isSignedIn ? (
              <>
                <Link href="/#campaigns" className="btn-gold" onClick={() => setMenuOpen(false)}>
                  Book a seat
                </Link>
                <Link href="/sign-in" className="btn-ghost" onClick={() => setMenuOpen(false)}>
                  Sign in
                </Link>
              </>
            ) : (
              <>
                <div className="flex justify-center py-2">
                  <CreditsBadge />
                </div>
                <Link href="/atelier/signet" className="btn-ghost" onClick={() => setMenuOpen(false)}>
                  The Signet
                </Link>
                <button
                  type="button"
                  className="py-2 text-prose/80"
                  onClick={() => {
                    setMenuOpen(false)
                    signOut()
                  }}
                >
                  Sign out
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
