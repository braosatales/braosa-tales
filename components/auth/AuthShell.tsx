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
    <main className="flex min-h-screen flex-col items-center justify-center bg-night px-4 py-12">
      <Link href="/" className="mb-8 opacity-90 hover:opacity-100 transition-opacity" aria-label="Braosa Tales home">
        <Image src="/mark-purple.png" alt="" width={44} height={44} />
      </Link>

      <div className="w-full max-w-md rounded-2xl border border-plum-line bg-plum px-6 py-8 sm:px-8">
        <div className="text-center">
          <p className="text-[0.95rem] text-leaf-soft">{eyebrow}</p>
          <h1 className="font-cinzel text-[1.8rem] font-bold text-vellum">{title}</h1>
          {subtitle && <p className="mt-2 text-mist">{subtitle}</p>}
        </div>

        <div className="mt-6">{children}</div>
      </div>

      {footer && <div className="mt-6 max-w-md text-center text-[0.9rem] text-mist">{footer}</div>}
    </main>
  )
}
