import type { Metadata } from 'next'
import { LegalPage, H2, P, UL, Strong, A, CONTACT_EMAIL } from '@/components/legal/LegalPage'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Braosa Tales collects, uses and protects your personal data.',
  alternates: { canonical: 'https://braosatales.com/privacy' },
}

const mail = `mailto:${CONTACT_EMAIL}`

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy Policy"
      updated="14 October 2026"
      intro="What we collect, why, who helps us run the service, and the rights you have over your data."
    >
      <H2>Who we are</H2>
      <P>
        Braosa Tales (<Strong>braosatales.com</Strong>, including Braosa&apos;s Atelier and The Signet) is operated by{' '}
        <Strong>João Fidalgo Rodrigues</Strong>, based in Montijo, Portugal, who is the data controller for the personal
        data described here. For anything about your data, email <A href={mail}>{CONTACT_EMAIL}</A>.
      </P>

      <H2>What we collect</H2>
      <UL>
        <li>
          <Strong>Account data</Strong> — your email address, the name you give us, an optional profile picture you
          upload, your display preferences (such as text size) and your password (stored only as a secure hash by our
          authentication provider). If you sign in with Google, we receive your name and email
          address from Google. We don&apos;t receive your Google password or access anything else in your Google account.
        </li>
        <li>
          <Strong>Tool data</Strong> — what you create and save in our tools: generator settings, generated names, saved
          names, presets, generation history, your credit balance and plan.
        </li>
        <li>
          <Strong>Payment data</Strong> — if you buy a plan, payment is handled by Stripe. We never see or store your
          card number; we keep your plan, purchase status and the related Stripe records.
        </li>
        <li>
          <Strong>Newsletter and waitlist</Strong> — your email address, if you sign up.
        </li>
        <li>
          <Strong>Feedback</Strong> — the message you send us and, if you&apos;re signed in, your name and email.
        </li>
        <li>
          <Strong>Campaign sites</Strong> — for players of our campaigns: character details, your private journal, the lore
          and quests you pin, and other content you or the game master add. If you link a D&amp;D Beyond character, we read
          its public character sheet from D&amp;D Beyond (name, species, class, level, hit points, ability scores and
          portrait) about every 30 minutes while the campaign site is in use, and keep a copy on the character.
        </li>
        <li>
          <Strong>Technical data</Strong> — basic logs (such as IP address, browser type and timestamps) kept by our hosting
          provider for security and to keep the service running.
        </li>
      </UL>

      <H2>Why we use it (and the legal basis)</H2>
      <UL>
        <li>To create and run your account and provide the tools you use — <Strong>performance of our contract with you</Strong>.</li>
        <li>To process payments and keep records required by Portuguese tax law — <Strong>contract and legal obligation</Strong>.</li>
        <li>To send the newsletter or waitlist updates you asked for — <Strong>your consent</Strong>, which you can withdraw at any time.</li>
        <li>To keep the service secure, prevent abuse and improve it based on feedback — <Strong>our legitimate interests</Strong>.</li>
      </UL>
      <P>We do not sell your personal data, and we do not use it for advertising.</P>

      <H2>AI generation</H2>
      <P>
        Some tools, such as The Signet, use AI. When you generate content, your settings and prompt are sent to{' '}
        <Strong>Anthropic</Strong> (the provider of the Claude models) to produce the result. We send only what&apos;s
        needed for the generation — not your password or payment details. Anthropic processes this data under its
        commercial terms as our service provider.
      </P>

      <H2 id="google">Google user data</H2>
      <P>
        If you choose <Strong>&quot;Continue with Google&quot;</Strong>, we use Google Sign-In only to create your account
        and sign you in. This is exactly what happens to the data Google shares with us:
      </P>
      <UL>
        <li>
          <Strong>What we access:</Strong> only your name, email address and profile picture URL, through the standard{' '}
          <Strong>openid</Strong>, <Strong>email</Strong> and <Strong>profile</Strong> scopes. We do not access your Gmail,
          Google Drive, contacts, calendar or any other Google data, and we never receive your Google password.
        </li>
        <li>
          <Strong>How we use it:</Strong> to create and identify your Braosa Tales account, sign you in, show your name in
          the app and contact you about your account. Nothing else.
        </li>
        <li>
          <Strong>How we store it:</Strong> your name and email are stored in our authentication provider and database
          (Supabase), encrypted in transit and protected by access controls. Google&apos;s profile picture link is kept by the
          authentication provider as part of your sign-in record, but we never display or use it: the only picture on
          your account is one you upload yourself in Settings.
        </li>
        <li>
          <Strong>How we share it:</Strong> we do not sell, rent or share Google user data with third parties, do not use it
          for advertising, and do not use it to train AI or machine-learning models. It is only processed by Supabase to
          run sign-in.
        </li>
        <li>
          <Strong>Retention and deletion:</Strong> we keep it while your account is open. To delete it, email{' '}
          <A href={mail}>{CONTACT_EMAIL}</A> and we&apos;ll delete your account and the Google data linked to it within 30
          days. You can also remove Braosa Tales&apos; access at any time from your{' '}
          <A href="https://myaccount.google.com/connections">Google Account connections page</A>.
        </li>
      </UL>
      <P>
        Braosa Tales&apos; use and transfer of information received from Google APIs adheres to the{' '}
        <A href="https://developers.google.com/terms/api-services-user-data-policy">Google API Services User Data Policy</A>,
        including the Limited Use requirements.
      </P>

      <H2>Who helps us run the service</H2>
      <P>We share data only with providers that need it to operate Braosa Tales:</P>
      <UL>
        <li><Strong>Supabase</Strong> — authentication and database.</li>
        <li><Strong>Vercel</Strong> — website hosting.</li>
        <li><Strong>Stripe</Strong> — payments.</li>
        <li><Strong>Anthropic</Strong> — AI generation.</li>
        <li><Strong>Google</Strong> — only if you choose &quot;Continue with Google&quot; to sign in.</li>
      </UL>
      <P>
        Some of these providers process data outside the European Economic Area, including in the United States. Where
        that happens, transfers are covered by appropriate safeguards such as the European Commission&apos;s Standard
        Contractual Clauses or the EU–US Data Privacy Framework.
      </P>
      <P>We may also disclose data where the law requires it.</P>

      <H2>Cookies and local storage</H2>
      <P>
        We use only essential cookies — the ones that keep you signed in. Some tools remember display preferences (for
        example grid or list view) in your browser&apos;s local storage. We don&apos;t use advertising or third-party
        tracking cookies.
      </P>

      <H2>How long we keep it</H2>
      <UL>
        <li>Account and tool data: while your account is open. You can delete your account yourself in Account settings, which removes it straight away; or email us and we’ll do it within 30 days.</li>
        <li>Payment records: as long as Portuguese tax and accounting law requires.</li>
        <li>Newsletter and waitlist: until you unsubscribe or ask us to remove you.</li>
        <li>Server logs: for a short period, for security purposes.</li>
      </UL>

      <H2>Your rights</H2>
      <P>
        Under the GDPR you can ask to access, correct, delete or receive a copy of your data, to restrict or object to how
        we use it, and to withdraw consent at any time. Email <A href={mail}>{CONTACT_EMAIL}</A> — we&apos;ll reply within
        one month. You can also complain to the Portuguese data protection authority, the{' '}
        <A href="https://www.cnpd.pt">Comissão Nacional de Proteção de Dados (CNPD)</A>.
      </P>

      <H2>Children</H2>
      <P>
        Braosa Tales is not intended for children under 13, and we don&apos;t knowingly collect their data. If you believe a
        child has given us personal data, contact us and we&apos;ll delete it.
      </P>

      <H2>Security</H2>
      <P>
        Data is encrypted in transit, passwords are stored only as hashes, and access to user data is restricted. No system
        is perfectly secure, but we take reasonable measures to protect your information.
      </P>

      <H2>Changes to this policy</H2>
      <P>
        If we change this policy, we&apos;ll update the date at the top. For significant changes, we&apos;ll let account
        holders know by email or on the site.
      </P>
    </LegalPage>
  )
}
