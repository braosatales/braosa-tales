import Link from 'next/link'

const pillars = [
  {
    label: 'The Tools',
    accent: 'border-t-brand-purple-600',
    iconColor: 'text-brand-purple-400',
    linkColor: 'text-brand-purple-400 hover:text-brand-purple-200',
    href: '/atelier',
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
      </svg>
    ),
    description: 'A campaign suite built for GMs. World wiki, character sheets, encounters, maps and timelines — with a GM/player visibility layer built in.',
    cta: 'See the app',
  },
  {
    label: 'The Stories',
    accent: 'border-t-brand-gold-400',
    iconColor: 'text-brand-gold-300',
    linkColor: 'text-brand-gold-300 hover:text-brand-gold-300/70',
    href: '/stories',
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
    description: 'Worlds built by hand, stories told by one. Read the lore, buy the books, and step into worlds years in the making.',
    cta: 'Browse the library',
  },
  {
    label: 'The Games',
    accent: 'border-t-brand-purple-800',
    iconColor: 'text-brand-purple-200',
    linkColor: 'text-brand-purple-200 hover:text-brand-purple-200/70',
    href: '/games',
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.96.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z" />
      </svg>
    ),
    description: 'Live campaigns inside the Braosa Tales universe — no third-party platforms. The world, the tools, and the game itself, all in one place.',
    cta: 'Join the waitlist',
  },
]

export default function Pillars() {
  return (
    <section className="px-8 py-20 grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
      {pillars.map((p) => (
        <div key={p.label} className={`dark-card border-t-2 ${p.accent}`}>
          <div className={p.iconColor}>{p.icon}</div>
          <h2 className="font-cinzel font-bold text-sm tracking-widest uppercase text-brand-parchment mt-4 mb-3">{p.label}</h2>
          <p className="font-fell text-brand-muted leading-relaxed mb-6 text-sm">{p.description}</p>
          <Link href={p.href} className={`font-cinzel text-xs tracking-widest uppercase ${p.linkColor} transition-colors`}>
            {p.cta} →
          </Link>
        </div>
      ))}
    </section>
  )
}
