'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useHub } from './HubContext'
import HubSearch from './HubSearch'

const TABS = [
  { href: '', label: 'Overview' },
  { href: '/party', label: 'Party' },
  { href: '/quests', label: 'Quests' },
  { href: '/lore', label: 'Lore' },
  { href: '/map', label: 'Map' },
  { href: '/timeline', label: 'Timeline' },
  { href: '/recaps', label: 'Recaps' },
  { href: '/journal', label: 'Journal' },
  { href: '/achievements', label: 'Achievements' },
]

export default function HubTabs() {
  const { base, gm } = useHub()
  const pathname = usePathname()
  const tabs = gm ? [...TABS, { href: '/manage', label: 'Manage' }] : TABS

  return (
    <div className="sticky top-16 z-40 border-b border-plum-line bg-night/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1180px] items-center gap-4 px-6 md:px-10">
        <nav aria-label="Campaign sections" className="-mb-px flex min-w-0 flex-1 gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {tabs.map((t) => {
            const href = `${base}${t.href}`
            const active = t.href === '' ? pathname === base : pathname === href || pathname.startsWith(`${href}/`)
            const manage = t.href === '/manage'
            return (
              <Link
                key={t.href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-3.5 text-[0.92rem] transition-colors ${
                  active
                    ? 'border-leaf text-vellum'
                    : `border-transparent hover:text-vellum ${manage ? 'text-ember' : 'text-mist'}`
                } ${manage ? 'md:ml-auto' : ''}`}
              >
                {manage && (
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" strokeLinecap="round" />
                  </svg>
                )}
                {t.label}
              </Link>
            )
          })}
        </nav>
        <HubSearch />
      </div>
    </div>
  )
}
