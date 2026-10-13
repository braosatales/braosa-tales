/** Shared hero for inner pages (same pattern as /games). */
export default function PageHero({
  title,
  intro,
  tone = 'night',
  children,
}: {
  title: string
  intro?: React.ReactNode
  tone?: 'night' | 'umber' | 'plum'
  children?: React.ReactNode
}) {
  const bg = tone === 'umber' ? 'bg-umber' : tone === 'plum' ? 'bg-plum' : 'bg-night'
  return (
    <section className={`relative overflow-hidden ${bg}`}>
      {tone === 'plum' && (
        <div className="pointer-events-none absolute -right-48 -top-48 h-[560px] w-[560px] rounded-full bg-amethyst-deep/25 blur-[130px]" />
      )}
      <div className="relative mx-auto max-w-[1180px] px-6 pb-16 pt-32 md:px-10 md:pb-20 md:pt-40">
        <h1 className="max-w-[18ch] font-cinzel text-[2.6rem] font-bold leading-[1.05] text-vellum md:text-[3.6rem]">{title}</h1>
        {intro && <div className="mt-5 max-w-measure text-[1.15rem] leading-relaxed text-prose">{intro}</div>}
        {children && <div className="mt-10">{children}</div>}
      </div>
    </section>
  )
}

/** Section heading used across inner pages. */
export function SectionTitle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <h2 className={`font-cinzel text-[2rem] font-bold leading-tight text-vellum ${className}`}>{children}</h2>
}
