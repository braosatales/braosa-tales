import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalPage, CONTACT_EMAIL } from '@/components/legal/LegalPage'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with Braosa Tales — support, privacy requests, campaigns and partnerships.',
  alternates: { canonical: 'https://braosatales.com/contact' },
}

const topics = [
  { label: 'Support', text: 'Problems with your account, credits, payments or the tools.', subject: 'Support' },
  { label: 'Privacy', text: 'Access, correct or delete your data, or close your account.', subject: 'Privacy request' },
  { label: 'Games', text: 'Live campaigns, seats at the table and sessions.', subject: 'Games' },
  { label: 'Partnerships', text: 'Collaborations, creators, press and everything else.', subject: 'Partnership' },
]

export default function ContactPage() {
  return (
    <LegalPage eyebrow="Get in touch" title="Contact" intro="Every message is read by a real person at the table.">
      <div className="text-center mb-10">
        <p className="section-label">Email</p>
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="font-cinzel text-xl md:text-2xl text-brand-gold-300 hover:text-brand-parchment tracking-wider break-all"
        >
          {CONTACT_EMAIL}
        </a>
        <p className="font-fell text-brand-muted mt-3">We usually reply within a few working days.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {topics.map((t) => (
          <a
            key={t.label}
            href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`[Braosa Tales] ${t.subject}`)}`}
            className="dark-card block group"
          >
            <p className="section-label">{t.label}</p>
            <p className="font-fell text-brand-muted leading-relaxed">{t.text}</p>
            <p className="mt-3 font-cinzel text-xs tracking-widest uppercase text-brand-gold-300 group-hover:text-brand-parchment">
              Write to us →
            </p>
          </a>
        ))}
      </div>

      <p className="font-fell text-brand-muted text-center mt-10">
        Braosa Tales is operated by João Fidalgo Rodrigues · Montijo, Portugal ·{' '}
        <Link href="/privacy" className="text-brand-gold-300 hover:text-brand-parchment">Privacy</Link> ·{' '}
        <Link href="/terms" className="text-brand-gold-300 hover:text-brand-parchment">Terms</Link>
      </p>
    </LegalPage>
  )
}
