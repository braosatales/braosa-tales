import Link from 'next/link'
import Image from 'next/image'

const pillars = [
  {
    label: 'The Stories',
    accent: 'border-t-brand-gold-400',
    iconColor: 'text-brand-gold-300',
    linkColor: 'text-brand-gold-300 hover:text-brand-gold-300/70',
    href: '/stories',
    icon: 'stories-pillar.svg',
    description: 'Worlds built by hand, stories told by one. Read the lore, buy the books, and step into worlds years in the making.',
    cta: 'Browse the library',
  },
  {
    label: 'The Games',
    accent: 'border-t-brand-purple-800',
    iconColor: 'text-brand-purple-200',
    linkColor: 'text-brand-purple-200 hover:text-brand-purple-200/70',
    href: '/games',
    icon: 'games-pillar.svg',
    description: 'Live campaigns inside the Braosa Tales universe — no third-party platforms. The world, the tools, and the game itself, all in one place.',
    cta: 'Join the waitlist',
  },
  {
    label: 'The Tools',
    accent: 'border-t-brand-purple-600',
    iconColor: 'text-brand-purple-400',
    linkColor: 'text-brand-purple-400 hover:text-brand-purple-200',
    href: '/atelier',
    icon: 'tools-pillar.svg',
    description: 'A campaign suite built for GMs. World wiki, character sheets, encounters, maps and timelines — with a GM/player visibility layer built in.',
    cta: 'See the app',
  },
]

export default function Pillars() {
  return (
    <section className="px-8 py-20 grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
      {pillars.map((p) => (
        <div key={p.label} className={`dark-card border-t-2 ${p.accent}`}>
          <div className={p.iconColor}>
            <Image src={`/icons/${p.icon}`} width={48} height={48} alt={p.label} unoptimized />
          </div>
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
