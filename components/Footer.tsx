import Link from 'next/link'

const links = [
  { href: '/atelier', label: 'Atelier' },
  { href: '/stories', label: 'Stories' },
  { href: '/games', label: 'Games' },
  { href: '/blog', label: 'Blog' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
  { href: '/contact', label: 'Contact' },
]

export default function Footer() {
  return (
    <footer className="px-8 py-8 border-t border-brand-border flex flex-wrap justify-between items-center gap-4">
      <span className="font-cinzel font-bold text-brand-parchment tracking-widest text-xs">
        BRAOSA TALES™
      </span>
      <div className="flex flex-wrap gap-6">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="font-cinzel text-xs tracking-widest uppercase text-brand-muted hover:text-brand-parchment transition-colors">
            {l.label}
          </Link>
        ))}
      </div>
      <p className="font-fell text-xs text-brand-muted">© {new Date().getFullYear()} Braosa Tales</p>
    </footer>
  )
}
