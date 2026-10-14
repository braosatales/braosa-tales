import Link from 'next/link'
import type { VisiblePlayerData } from '@/lib/hub/getVisiblePlayerFields'

function timeAgo(iso: string) {
  const min = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
  if (min < 1) return 'just now'
  if (min < 60) return `${min} min ago`
  const h = Math.round(min / 60)
  if (h < 24) return `${h} h ago`
  return `${Math.round(h / 24)} d ago`
}

export function hpTone(pct: number) {
  return pct > 0.6 ? 'bg-emerald-500/80' : pct > 0.3 ? 'bg-leaf' : 'bg-red-500/80'
}

export default function CharacterCard({ p, href, playedBy, mine }: { p: VisiblePlayerData; href: string; playedBy: string | null; mine?: boolean }) {
  const line = [p.level ? `Level ${p.level}` : null, p.race].filter(Boolean).join(' · ')
  const hasHp = typeof p.hp_current === 'number' && typeof p.hp_max === 'number' && p.hp_max > 0
  const pct = hasHp ? Math.max(0, Math.min(1, (p.hp_current as number) / (p.hp_max as number))) : 0

  return (
    <Link
      href={href}
      className={`group flex h-full flex-col overflow-hidden rounded-2xl border bg-umber-deep/80 transition-colors hover:border-leaf/50 ${mine ? 'border-leaf/40' : 'border-umber-line'}`}
    >
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-umber-line via-umber to-plum">
        {p.portrait_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.portrait_url} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
        ) : (
          <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center font-cinzel text-[3.5rem] font-bold text-vellum/15">
            {p.name.charAt(0)}
          </span>
        )}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-umber-deep to-transparent" />
        {mine && <span className="absolute left-3 top-3 rounded-full bg-night/75 px-2.5 py-0.5 text-[0.72rem] font-bold text-leaf-soft backdrop-blur-sm">You</span>}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-cinzel text-[1.15rem] font-bold leading-tight text-vellum">{p.name}</h3>
        {line && <p className="mt-1 text-[0.9rem] text-prose">{line}</p>}
        {p.class && <p className="text-[0.9rem] leading-snug text-mist">{p.class}</p>}
        {hasHp && (
          <div className="mt-3" aria-label={`Hit points ${p.hp_current} of ${p.hp_max}`}>
            <div className="flex items-baseline justify-between text-[0.78rem] text-mist">
              <span>HP</span>
              <span className="tabular-nums text-prose">
                {p.hp_current} / {p.hp_max}
              </span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-night">
              <div className={`h-full rounded-full ${hpTone(pct)}`} style={{ width: `${pct * 100}%` }} />
            </div>
          </div>
        )}
        <div className="mt-auto pt-4 text-[0.78rem] text-mist/90">
          {playedBy && <p>Played by {playedBy}</p>}
          {p.ddb_character_id && (
            <p className={p.ddb_error ? 'text-red-300/90' : ''}>
              {p.ddb_error ? 'D&D Beyond sync failed' : p.ddb_synced_at ? `D&D Beyond, updated ${timeAgo(p.ddb_synced_at)}` : 'D&D Beyond'}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
