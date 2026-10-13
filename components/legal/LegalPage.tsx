import Nav from '@/components/NavServer'
import Footer from '@/components/Footer'
import PageHero from '@/components/PageHero'

export const CONTACT_EMAIL = 'braosa.tales@gmail.com'

export function LegalPage({
  eyebrow,
  title,
  updated,
  intro,
  children,
}: {
  eyebrow?: string
  title: string
  updated?: string
  intro?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <main className="bg-night">
      <Nav />
      <PageHero
        title={title}
        intro={
          <>
            {intro}
            {updated && <span className="mt-3 block text-[0.9rem] text-mist">Last updated {updated}</span>}
          </>
        }
      />
      <section className="border-t border-plum-line">
        <div className="mx-auto max-w-[1180px] px-6 py-16 md:px-10 md:py-20">
          <div className="max-w-[44rem]">{children}</div>
        </div>
      </section>
      <Footer />
    </main>
  )
}

export function H2({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="mb-3 mt-12 scroll-mt-24 font-cinzel text-[1.35rem] font-bold text-vellum first:mt-0">
      {children}
    </h2>
  )
}

export function P({ children }: { children: React.ReactNode }) {
  return <p className="mb-4 leading-relaxed text-prose">{children}</p>
}

export function UL({ children }: { children: React.ReactNode }) {
  return <ul className="mb-4 list-disc space-y-2 pl-6 leading-relaxed text-prose marker:text-leaf">{children}</ul>
}

export function Strong({ children }: { children: React.ReactNode }) {
  return <strong className="font-normal text-vellum">{children}</strong>
}

export function A({ href, children }: { href: string; children: React.ReactNode }) {
  const external = href.startsWith('http')
  return (
    <a
      href={href}
      className="link-quiet"
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {children}
    </a>
  )
}
