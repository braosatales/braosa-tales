import Image from 'next/image'
import Link from 'next/link'
import LocalTime from '@/components/sessions/LocalTime'
import { GM } from '@/lib/sessions'

export default function HomeHero() {
  return (
    <section className="relative isolate overflow-hidden">
      <Image
        src="/world-map.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-10 object-cover object-[70%_center] opacity-[0.3]"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-night via-night/85 to-night/30" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-b from-transparent to-night" />

      <div className="mx-auto flex min-h-[88svh] max-w-[1180px] flex-col justify-center px-6 pb-20 pt-32 md:px-10">
        <p className="text-[1.05rem] text-leaf-soft">Live Dungeons &amp; Dragons, online, every week</p>
        <h1 className="mt-3 max-w-[12ch] font-cinzel text-[2.9rem] font-bold leading-[1.02] tracking-[-0.01em] text-vellum sm:text-[3.6rem] lg:text-[4.4rem]">
          Sit at our table.
        </h1>
        <p className="mt-6 max-w-measure text-[1.1rem] leading-relaxed text-prose md:text-[1.2rem]">
          Long campaigns run by {GM.name} for players anywhere in the world, plus the Atelier: the tools
          built to run them, now opening to every game master.
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-3">
          <Link href="#campaigns" className="btn-gold">
            Choose a campaign
          </Link>
          <Link href="/atelier/signet" className="btn-ghost">
            Try The Signet
          </Link>
        </div>

        <div className="mt-10 grid max-w-2xl gap-x-10 gap-y-4 text-[0.92rem] text-mist sm:grid-cols-2">
          <LocalTime className="leading-snug" />
          <p className="leading-snug">
            <span className="text-vellum">
              {GM.rating.toFixed(1)} stars from {GM.reviews} reviews
            </span>
            <br />
            {GM.gamesRun} games run on{' '}
            <a href={GM.profileUrl} target="_blank" rel="noopener noreferrer" className="link-quiet">
              StartPlaying
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
