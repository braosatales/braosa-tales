import Image from 'next/image'
import Link from 'next/link'

export default function StoriesTeaser() {
  return (
    <section className="mx-auto max-w-[1180px] px-6 py-20 md:px-10 md:py-28">
      <div className="grid gap-10 md:grid-cols-[1fr_1fr] md:gap-20">
        <div>
          <h2 className="font-cinzel text-[2.1rem] font-bold leading-tight text-vellum md:text-[2.6rem]">
            The world of Braosa
          </h2>
          <div className="relative mt-8 aspect-[4/3] overflow-hidden rounded-2xl border border-plum-line">
            <Image
              src="/world-map.jpg"
              alt="Hand-drawn map of the world of Braosa"
              fill
              sizes="(min-width: 768px) 520px, 100vw"
              className="object-cover opacity-80 sepia-[0.25]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-night/70 to-transparent" />
          </div>
        </div>
        <div className="max-w-measure">
          <p className="text-[1.1rem] leading-relaxed text-prose">
            Long before the tools, there was a world. Braosa was built at real tables over years: empires, faiths,
            languages and wars that players lived through and changed.
          </p>
          <p className="mt-4 leading-relaxed text-mist">
            Its stories are being written down now, as fiction, lore books and an open wiki for players.
          </p>
          <Link href="/stories" className="link-quiet mt-6 inline-block">
            Visit the library
          </Link>
        </div>
      </div>
    </section>
  )
}
