import Link from 'next/link'

/** Section heading for campaign pages, with an optional action link on the right. */
export function HubSectionTitle({ children, action, as: Tag = 'h2' }: { children: React.ReactNode; action?: { href: string; label: string } | React.ReactNode; as?: 'h1' | 'h2' }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
      <Tag className={`font-cinzel font-bold leading-tight text-vellum ${Tag === 'h1' ? 'text-[2rem]' : 'text-[1.5rem]'}`}>{children}</Tag>
      {action && typeof action === 'object' && 'href' in action ? (
        <Link href={action.href} className="link-quiet text-[0.92rem]">{action.label}</Link>
      ) : (
        action
      )}
    </div>
  )
}

export function EmptyNote({ children }: { children: React.ReactNode }) {
  return <p className="rounded-xl border border-dashed border-plum-line px-5 py-6 text-[0.95rem] leading-relaxed text-mist">{children}</p>
}
