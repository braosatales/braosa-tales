import Link from 'next/link'
import { LORE_CATEGORIES } from '@/lib/hub/lore'

export default function LoreNav({ base, active }: { base: string; active?: string }) {
  return (
    <nav aria-label="Lore categories" className="flex flex-wrap gap-2">
      {LORE_CATEGORIES.map((c) => (
        <Link
          key={c.slug}
          href={`${base}/lore/${c.slug}`}
          aria-current={active === c.slug ? 'page' : undefined}
          className={`rounded-full border px-4 py-1.5 text-[0.9rem] transition-colors ${
            active === c.slug ? 'border-leaf bg-leaf/10 text-leaf-soft' : 'border-plum-line text-prose hover:border-amethyst hover:text-vellum'
          }`}
        >
          {c.label}
        </Link>
      ))}
    </nav>
  )
}
