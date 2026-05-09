import Link from 'next/link'
import Image from 'next/image'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden">
      
      {/* World map background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/world-map.jpg"
          alt="World of Braosa Tales"
          fill
          className="object-cover object-center opacity-30"
          priority
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-brand-bg/60 via-brand-bg/40 to-brand-bg" />
        <div className="absolute inset-0 bg-brand-bg/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center px-8 py-32">

        {/* Logo stamp */}
        <div className="mb-8">
          <Image
            src="/logo-stamp.png"
            alt="Braosa Tales"
            width={160}
            height={160}
            className="opacity-90 mix-blend-luminosity"
          />
        </div>

        {/* Ornamental divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="h-px w-16 bg-brand-gold-400/40" />
          <span className="text-brand-gold-400/60 text-xs tracking-widest">✦</span>
          <div className="h-px w-16 bg-brand-gold-400/40" />
        </div>

        <h1 className="font-cinzel font-black text-brand-parchment text-5xl md:text-7xl leading-tight mb-4 tracking-wide">
          Braosa Tales
        </h1>

        <p className="font-fell italic text-brand-gold-300 text-xl md:text-2xl mb-10 max-w-lg leading-relaxed opacity-90">
          Forge the world. Tell the story. Run the game.
        </p>

        {/* Ornamental divider */}
        <div className="flex items-center gap-4 mb-10">
          <div className="h-px w-12 bg-brand-gold-400/30" />
          <span className="text-brand-gold-400/40 text-xs tracking-widest uppercase font-cinzel">TTRPG Tools · Stories · Games</span>
          <div className="h-px w-12 bg-brand-gold-400/30" />
        </div>

        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/atelier" className="btn-primary">
            Explore the tools
          </Link>
          <Link href="/stories" className="btn-outline">
            Read the stories
          </Link>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-brand-bg to-transparent z-10" />

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 opacity-40">
        <span className="font-cinzel text-xs tracking-widest uppercase text-brand-parchment">Scroll</span>
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="text-brand-parchment animate-bounce">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

    </section>
  )
}
