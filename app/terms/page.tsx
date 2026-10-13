import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalPage, H2, P, UL, Strong, A, CONTACT_EMAIL } from '@/components/legal/LegalPage'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The terms for using Braosa Tales, Braosa’s Atelier and The Signet.',
  alternates: { canonical: 'https://braosatales.com/terms' },
}

const mail = `mailto:${CONTACT_EMAIL}`

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms of Service"
      updated="13 October 2026"
      intro="The ground rules for using Braosa Tales and its tools."
    >
      <H2>1. Who we are</H2>
      <P>
        Braosa Tales (<Strong>braosatales.com</Strong>, including Braosa&apos;s Atelier and The Signet) is operated by{' '}
        <Strong>João Fidalgo Rodrigues</Strong>, Montijo, Portugal (&quot;we&quot;, &quot;us&quot;). By creating an
        account or using the site, you agree to these terms. If you don&apos;t agree, please don&apos;t use the service.
      </P>

      <H2>2. Alpha service</H2>
      <P>
        Our tools are in <Strong>alpha</Strong>. Features may change, break or be removed, and we may reset or limit
        functionality while we build. We&apos;ll try to give notice of significant changes, but we can&apos;t guarantee
        the service will always be available or error-free.
      </P>

      <H2>3. Your account</H2>
      <UL>
        <li>You must be at least 13 years old to create an account.</li>
        <li>Give us accurate information and keep your login details secure. You&apos;re responsible for activity on your account.</li>
        <li>You can close your account at any time by emailing <A href={mail}>{CONTACT_EMAIL}</A>.</li>
      </UL>

      <H2>4. Plans, credits and payments</H2>
      <UL>
        <li>
          The free plan includes a limited number of credits. Paid plans add more credits and features, as described on the{' '}
          <Link href="/pricing" className="link-quiet">pricing page</Link>.
        </li>
        <li>Monthly plans renew automatically each billing period until you cancel. Cancelling stops future renewals; your plan stays active until the end of the period you&apos;ve paid for.</li>
        <li>Credits have no cash value, can&apos;t be transferred, and expire as described on the pricing page (monthly credits reset each billing period; daily credits refresh every 24 hours).</li>
        <li>The Author plan is a one-time purchase that gives access for as long as the service operates.</li>
        <li>Payments are processed by Stripe. Prices may change; changes apply from your next billing period and we&apos;ll tell you before they do.</li>
        <li>
          If you&apos;re a consumer in the EU, you keep all rights mandatory law gives you. If something isn&apos;t right
          with a purchase, email us and we&apos;ll work it out.
        </li>
      </UL>

      <H2>5. What you create</H2>
      <P>
        You own the content you create with our tools, including names and text generated for you, to the extent the law
        allows. AI-generated results may be similar to existing names or works, and we can&apos;t guarantee they&apos;re
        unique or free to register as trademarks — check before using them commercially.
      </P>
      <P>
        You give us permission to store and process your content only as needed to run the service for you. We don&apos;t
        claim ownership of it.
      </P>

      <H2>6. Acceptable use</H2>
      <P>Don&apos;t:</P>
      <UL>
        <li>use the service for anything illegal, or to create content that is hateful, harassing or infringes someone else&apos;s rights;</li>
        <li>try to break, overload, reverse-engineer or get around limits or security of the service;</li>
        <li>scrape the service, resell access, or use automated means to generate content at scale without our permission;</li>
        <li>share your account or create multiple accounts to get extra free credits.</li>
      </UL>
      <P>We may suspend or close accounts that break these rules.</P>

      <H2>7. Our content</H2>
      <P>
        The Braosa Tales name, logos, stories, worlds, artwork and the design of the site and tools belong to us. You
        may not copy or reuse them without permission, except as the law allows.
      </P>

      <H2>8. Liability</H2>
      <P>
        The service is provided &quot;as is&quot;. To the extent the law allows, we&apos;re not liable for indirect or
        consequential losses, or for loss of data or content, and our total liability to you is limited to the amount
        you paid us in the 12 months before the claim. Nothing in these terms limits liability that can&apos;t be limited
        by law, or your statutory rights as a consumer.
      </P>

      <H2>9. Privacy</H2>
      <P>
        How we handle your personal data is explained in our{' '}
        <Link href="/privacy" className="link-quiet">Privacy Policy</Link>.
      </P>

      <H2>10. Changes and ending</H2>
      <P>
        We may update these terms; we&apos;ll change the date at the top and tell account holders about significant
        changes. If we ever shut the service down, we&apos;ll give reasonable notice where possible.
      </P>

      <H2>11. Law</H2>
      <P>
        These terms are governed by Portuguese law. If you&apos;re a consumer, you can also rely on the mandatory laws and
        courts of the country where you live.
      </P>

      <H2>12. Contact</H2>
      <P>
        Questions about these terms? Email <A href={mail}>{CONTACT_EMAIL}</A>.
      </P>
    </LegalPage>
  )
}
