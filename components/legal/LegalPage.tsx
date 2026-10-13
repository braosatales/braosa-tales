import Nav from '@/components/NavServer'
import Footer from '@/components/Footer'

export const CONTACT_EMAIL = 'braosa.tales@gmail.com'

export function LegalPage({
  eyebrow,
  title,
  updated,
  intro,
  children,
}: {
  eyebrow: string
  title: string
  updated?: string
  intro?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <main>
      <Nav />

      <section className="px-8 pt-[calc(64px+1.5rem)] md:pt-24 pb-8 md:pb-14 text-center border-b border-brand-border">
        <p className="section-label">{eyebrow}</p>
        <h1 className="font-cinzel font-black text-brand-parchment text-4xl md:text-5xl mb-4 leading-tight">{title}</h1>
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="h-px w-16 bg-brand-gold-400/30" />
          <span className="text-brand-gold-400/50 text-xs">✦</span>
          <div className="h-px w-16 bg-brand-gold-400/30" />
        </div>
        {intro && <p className="font-fell text-[#D4AE58] text-lg md:text-xl max-w-xl mx-auto leading-relaxed opacity-90">{intro}</p>}
        {updated && <p className="mt-4 text-sm text-brand-muted">Last updated: {updated}</p>}
      </section>

      <section className="px-6 md:px-8 py-10 md:py-16 border-b border-brand-border">
        <div className="max-w-3xl mx-auto">{children}</div>
      </section>

      <Footer />
    </main>
  )
}

export function H2({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="font-cinzel font-bold text-brand-gold-300 text-lg md:text-xl tracking-widest uppercase mt-12 first:mt-0 mb-4 scroll-mt-24">
      {children}
    </h2>
  )
}

export function P({ children }: { children: React.ReactNode }) {
  return <p className="font-fell text-brand-muted leading-loose text-base md:text-lg mb-4">{children}</p>
}

export function UL({ children }: { children: React.ReactNode }) {
  return <ul className="font-fell text-brand-muted leading-loose text-base md:text-lg mb-4 pl-6 list-disc marker:text-brand-gold-400 space-y-1">{children}</ul>
}

export function Strong({ children }: { children: React.ReactNode }) {
  return <strong className="text-brand-parchment font-normal">{children}</strong>
}

export function A({ href, children }: { href: string; children: React.ReactNode }) {
  const external = href.startsWith('http')
  return (
    <a
      href={href}
      className="text-brand-gold-300 underline decoration-brand-gold-400/40 underline-offset-4 hover:text-brand-parchment"
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {children}
    </a>
  )
}
