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
    <LegalPage title="Contact" intro="Every message is read by a real person at the table.">
      <p className="text-mist">Email</p>
      <a href={`mailto:${CONTACT_EMAIL}`} className="mt-1 inline-block break-all font-cinzel text-[1.5rem] font-bold text-leaf-soft hover:text-vellum md:text-[1.9rem]">
        {CONTACT_EMAIL}
      </a>
      <p className="mt-2 text-mist">We usually reply within a few working days.</p>

      <ul className="mt-12 grid gap-x-10 border-t border-plum-line sm:grid-cols-2">
        {topics.map((t) => (
          <li key={t.label} className="border-b border-plum-line py-5">
            <a href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`[Braosa Tales] ${t.subject}`)}`} className="group block">
              <p className="font-cinzel text-[1.1rem] font-bold text-vellum group-hover:text-leaf-soft">{t.label}</p>
              <p className="mt-1 leading-snug text-prose">{t.text}</p>
              <p className="mt-2 text-[0.9rem] text-leaf-soft underline decoration-leaf/40 underline-offset-[0.3em]">Write to us</p>
            </a>
          </li>
        ))}
      </ul>

      <p className="mt-12 text-[0.95rem] text-mist">
        Braosa Tales is run by João Fidalgo Rodrigues in Montijo, Portugal. See the{' '}
        <Link href="/privacy" className="link-quiet">privacy policy</Link> and{' '}
        <Link href="/terms" className="link-quiet">terms</Link>.
      </p>
    </LegalPage>
  )
}
