import Link from 'next/link'
import Image from 'next/image'

export default function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: {
  eyebrow: string
  title: string
  subtitle?: string
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <main className="min-h-screen bg-brand-bg flex flex-col items-center justify-center px-4 py-12">
      <Link href="/" className="mb-8 opacity-90 hover:opacity-100 transition-opacity" aria-label="Braosa Tales home">
        <Image src="/mark-purple.png" alt="" width={44} height={44} />
      </Link>

      <div className="w-full max-w-md bg-brand-card border border-brand-border rounded-sm px-6 py-8 sm:px-8">
        <div className="text-center">
          <p className="section-label">{eyebrow}</p>
          <h1 className="font-cinzel font-bold text-brand-parchment text-2xl tracking-widest uppercase">{title}</h1>
          {subtitle && <p className="font-fell text-brand-gold-300/80 mt-2 text-base">{subtitle}</p>}
          <div className="flex items-center justify-center mt-4">
            <span className="h-px w-16 bg-brand-border" />
            <span className="ornament text-xs">✦</span>
            <span className="h-px w-16 bg-brand-border" />
          </div>
        </div>

        <div className="mt-6">{children}</div>
      </div>

      {footer && <div className="mt-6 text-center text-sm text-brand-muted max-w-md">{footer}</div>}
    </main>
  )
}
