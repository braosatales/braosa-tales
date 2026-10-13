import Link from 'next/link'
import Image from 'next/image'

const groups = [
  {
    title: 'Play',
    links: [
      { href: '/games', label: 'Sessions' },
      { href: '/#campaigns', label: 'Campaigns' },
      { href: 'https://startplaying.games/gm/johnrodrigues', label: 'StartPlaying profile', external: true },
    ],
  },
  {
    title: 'Create',
    links: [
      { href: '/atelier', label: 'The Atelier' },
      { href: '/atelier/signet', label: 'The Signet' },
      { href: '/pricing', label: 'Pricing' },
    ],
  },
  {
    title: 'Braosa Tales',
    links: [
      { href: '/stories', label: 'Stories' },
      { href: '/about', label: 'About' },
      { href: '/contact', label: 'Contact' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="border-t border-plum-line bg-night">
      <div className="mx-auto grid max-w-[1180px] gap-12 px-6 py-14 md:grid-cols-[1.3fr_repeat(3,1fr)] md:px-10">
        <div>
          <Link href="/" className="inline-flex items-center gap-3" aria-label="Braosa Tales, home">
            <Image src="/mark-purple.png" alt="" width={32} height={32} />
            <span className="font-cinzel text-[0.85rem] font-bold tracking-[0.18em] text-vellum">BRAOSA TALES™</span>
          </Link>
          <p className="mt-4 max-w-[22rem] text-[0.95rem] leading-relaxed text-mist">
            Forge the world. Tell the story. Run the game.
          </p>
        </div>
        {groups.map((g) => (
          <div key={g.title}>
            <h2 className="font-cinzel text-[0.9rem] font-bold text-vellum">{g.title}</h2>
            <ul className="mt-4 space-y-2.5">
              {g.links.map((l) => (
                <li key={l.href}>
                  {'external' in l && l.external ? (
                    <a href={l.href} target="_blank" rel="noopener noreferrer" className="text-[0.95rem] text-mist transition-colors hover:text-vellum">
                      {l.label}
                    </a>
                  ) : (
                    <Link href={l.href} className="text-[0.95rem] text-mist transition-colors hover:text-vellum">
                      {l.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-plum-line/60">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-4 px-6 py-6 text-[0.85rem] text-mist/80 md:px-10">
          <p>© {new Date().getFullYear()} Braosa Tales</p>
          <p className="flex gap-6">
            <Link href="/privacy" className="hover:text-vellum">Privacy</Link>
            <Link href="/terms" className="hover:text-vellum">Terms</Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
