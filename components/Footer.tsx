import Link from 'next/link'

const links = [
  { href: '/tools', label: 'Tools' },
  { href: '/stories', label: 'Stories' },
  { href: '/games', label: 'Games' },
  { href: '/blog', label: 'Blog' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
  { href: '/contact', label: 'Contact' },
]

export default function Footer() {
  return (
    <footer className="px-8 py-6 border-t border-gray-100 flex flex-wrap justify-between items-center gap-4">
      <span className="font-cinzel font-bold text-brand-purple-600 tracking-widest text-sm">
        BRAOSA TALES™
      </span>
      <div className="flex flex-wrap gap-5">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
            {l.label}
          </Link>
        ))}
      </div>
      <p className="text-xs text-gray-400">© {new Date().getFullYear()} Braosa Tales</p>
    </footer>
  )
}
