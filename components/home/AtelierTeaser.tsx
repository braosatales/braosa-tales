import Image from 'next/image'
import Link from 'next/link'

const coming = [
  { name: 'The Athenaeum', what: 'A world wiki where you choose what players can see', icon: '01 The Athenaeum.svg' },
  { name: 'The Atlas', what: 'Maps linked to the places and lore on them', icon: '02 The Atlas.svg' },
  { name: 'The Chronicle', what: 'Session notes, private for you and shared recaps for players', icon: '03 The Chronicle.svg' },
  { name: 'The Armature', what: 'Live D&D 5e character sheets your players edit', icon: '08 The Armature.svg' },
  { name: 'The Blade', what: 'Encounters with initiative and combat tracking', icon: '06 The Blade.svg' },
  { name: 'The Tome', what: 'Every campaign you run, in one dashboard', icon: '09 The Tome.svg' },
]

export default function AtelierTeaser() {
  return (
    <section className="relative overflow-hidden bg-plum">
      <div className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-amethyst-deep/20 blur-[120px]" />
      <div className="relative mx-auto grid max-w-[1180px] gap-14 px-6 py-20 md:px-10 md:py-28 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        <div>
          <h2 className="font-cinzel text-[2.1rem] font-bold leading-tight text-vellum md:text-[2.6rem]">The Atelier</h2>
          <p className="mt-4 max-w-measure text-[1.1rem] leading-relaxed text-prose">
            The workshop behind the table. These are the tools that run our campaigns, and one by one they’re
            opening to every game master.
          </p>

          <div className="mt-10 rounded-2xl border border-amethyst/30 bg-night/50 p-6 md:p-7">
            <div className="flex items-center gap-4">
              <Image src="/icons/atelier/48/10 The Signet.svg" width={48} height={48} alt="" unoptimized />
              <div>
                <p className="text-[0.8rem] text-amethyst">Open now, in alpha</p>
                <h3 className="font-cinzel text-[1.4rem] font-bold text-vellum">The Signet</h3>
              </div>
            </div>
            <p className="mt-4 leading-relaxed text-prose">
              Names for characters, places, factions and artifacts, drawn from more than a hundred real and invented
              languages, each with its meaning and pronunciation.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link href="/atelier/signet" className="btn-amethyst">
                Try The Signet free
              </Link>
              <p className="text-[0.88rem] text-mist">100 free credits every month</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-cinzel text-[1.1rem] font-bold text-vellum">In the workshop</h3>
          <ul className="mt-5 divide-y divide-plum-line border-y border-plum-line">
            {coming.map((t) => (
              <li key={t.name} className="flex items-center gap-4 py-4">
                <Image src={`/icons/atelier/48/${t.icon}`} width={36} height={36} alt="" unoptimized className="opacity-80" />
                <div className="min-w-0 flex-1">
                  <p className="font-cinzel text-[0.98rem] font-bold text-vellum">{t.name}</p>
                  <p className="text-[0.92rem] leading-snug text-mist">{t.what}</p>
                </div>
                <span className="shrink-0 text-[0.78rem] text-mist/80">Coming soon</span>
              </li>
            ))}
          </ul>
          <Link href="/atelier" className="link-quiet mt-6 inline-block text-[0.95rem]">
            See all 22 tools in the Atelier
          </Link>
        </div>
      </div>
    </section>
  )
}
