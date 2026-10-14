'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { toolBySlug, isLive } from '@/lib/atelier'

type MenuCampaign = { slug: string; title: string; role: 'gm' | 'player'; href: string | null; cover: string | null }
export type MenuData = { campaigns: MenuCampaign[]; favourites: string[] }

/* ── Icons (inline, inherit currentColor) ─────────────────────────────── */
const IconHall = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 10.5 12 4l9 6.5" />
    <path d="M5 9.5V20h14V9.5" />
    <path d="M10 20v-5.5a2 2 0 0 1 4 0V20" />
  </svg>
)
const IconD20 = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 2.5 20.5 7.5v9L12 21.5 3.5 16.5v-9Z" />
    <path d="M12 2.5 7.5 15h9Z" />
    <path d="M3.5 7.5 7.5 15M20.5 7.5 16.5 15M7.5 15 12 21.5 16.5 15M3.5 16.5l4-1.5M20.5 16.5l-4-1.5" />
  </svg>
)
const IconStar = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" aria-hidden="true">
    <path d="m12 3.2 2.6 5.5 6 .8-4.4 4.1 1.1 5.9L12 16.6l-5.3 2.9 1.1-5.9L3.4 9.5l6-.8Z" />
  </svg>
)
const IconCog = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
  </svg>
)
const IconDoor = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4" />
    <path d="M10 8 6 12l4 4M6 12h10" />
  </svg>
)

function SectionHeading({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-2.5 px-4 pb-1.5 pt-3 font-cinzel text-[0.78rem] font-bold tracking-[0.06em] text-leaf">
      {icon}
      {children}
    </p>
  )
}

const rowCls =
  'flex items-center gap-3 rounded-lg mx-2 px-2 py-2 text-[0.95rem] text-prose transition-colors hover:bg-night/70 hover:text-vellum focus-visible:bg-night/70'

export default function UserMenuContent({
  name,
  email,
  open,
  onNavigate,
  onSignOut,
  initialData = null,
}: {
  initialData?: MenuData | null
  name: string | null
  email: string | null
  open: boolean
  onNavigate: () => void
  onSignOut: () => void
}) {
  const [data, setData] = useState<MenuData | null>(initialData)

  // Refresh every time the menu opens, so new favourites/campaigns show up straight away.
  useEffect(() => {
    if (!open) return
    let cancelled = false
    fetch('/api/dashboard/menu', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => !cancelled && d && setData(d))
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [open])

  const favourites = (data?.favourites ?? []).map(toolBySlug).filter(Boolean) as NonNullable<ReturnType<typeof toolBySlug>>[]

  return (
    <div className="py-2">
      {/* Who + settings */}
      <div className="flex items-start gap-2 pb-3 pl-4 pr-2 pt-2">
        <div className="min-w-0 flex-1">
          {name && <p className="truncate font-cinzel text-[1rem] font-bold text-vellum">{name}</p>}
          {email && <p className="truncate text-[0.88rem] text-mist">{email}</p>}
        </div>
        <Link
          href="/settings"
          role="menuitem"
          onClick={onNavigate}
          aria-label="Account settings"
          title="Account settings"
          className="rounded-lg p-2 text-mist transition-colors hover:bg-night/70 hover:text-leaf-soft"
        >
          <IconCog />
        </Link>
      </div>

      <Link href="/dashboard" role="menuitem" onClick={onNavigate} className={`${rowCls} text-vellum`}>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-leaf/15 text-leaf">
          <IconHall />
        </span>
        <span className="font-cinzel text-[0.98rem] font-bold">Your dashboard</span>
      </Link>

      <div className="my-2 h-px bg-plum-line" />

      {/* Active campaigns */}
      <SectionHeading icon={<IconD20 />}>Active campaigns</SectionHeading>
      {data === null ? (
        <p className="px-4 py-2 text-[0.88rem] text-mist/70">Loading…</p>
      ) : data.campaigns.length === 0 ? (
        <Link href="/games" role="menuitem" onClick={onNavigate} className={`${rowCls} text-mist`}>
          <span className="text-[0.9rem]">No campaigns yet. <span className="text-leaf-soft">Find a table</span></span>
        </Link>
      ) : (
        data.campaigns.map((c) => (
          <Link key={c.slug} href={c.href ?? '/dashboard'} role="menuitem" onClick={onNavigate} className={rowCls}>
            <span className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-umber-line bg-umber font-cinzel text-[0.8rem] font-bold text-leaf-soft">
              {c.cover ? <Image src={c.cover} alt="" fill sizes="32px" className="object-cover" /> : c.title.replace(/^The\s+/i, '').charAt(0)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate">{c.title}</span>
              <span className="block text-[0.75rem] text-mist">
                {c.role === 'gm' ? 'Game master' : 'Player'}
                {!c.href && ', site opening soon'}
              </span>
            </span>
          </Link>
        ))
      )}

      <div className="my-2 h-px bg-plum-line" />

      {/* Favourite apps */}
      <SectionHeading icon={<IconStar />}>Favourite apps</SectionHeading>
      {data === null ? (
        <p className="px-4 py-2 text-[0.88rem] text-mist/70">Loading…</p>
      ) : favourites.length === 0 ? (
        <Link href="/dashboard#atelier" role="menuitem" onClick={onNavigate} className={`${rowCls} text-mist`}>
          <span className="text-[0.9rem]">Star apps on your dashboard to keep them here.</span>
        </Link>
      ) : (
        favourites.map((t) =>
          isLive(t) ? (
            <Link key={t.slug} href={t.href!} role="menuitem" onClick={onNavigate} className={rowCls}>
              <Image src={`/icons/atelier/48/${t.icon}`} width={32} height={32} alt="" unoptimized className="shrink-0 rounded-lg" />
              <span className="truncate">{t.name}</span>
            </Link>
          ) : (
            <div key={t.slug} className={`${rowCls} cursor-default text-mist/70 hover:bg-transparent hover:text-mist/70`} aria-disabled="true">
              <Image src={`/icons/atelier/48/${t.icon}`} width={32} height={32} alt="" unoptimized className="shrink-0 rounded-lg opacity-50" />
              <span className="min-w-0 flex-1 truncate">{t.name}</span>
              <span className="text-[0.72rem]">soon</span>
            </div>
          )
        )
      )}

      <div className="my-2 h-px bg-plum-line" />

      <button type="button" role="menuitem" onClick={onSignOut} className={`${rowCls} w-[calc(100%-1rem)] text-mist`}>
        <span className="flex h-8 w-8 items-center justify-center"><IconDoor /></span>
        Sign out
      </button>
    </div>
  )
}
