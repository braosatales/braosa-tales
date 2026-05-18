'use client'

import Image from 'next/image'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { useState } from 'react'

type Feature = { text: string; included: boolean }

type Tier = {
  name: string
  price: string
  period?: string
  flavour: string
  features: Feature[]
  cta: string
  badge?: string
  lifetime?: boolean
  borderClass?: string
  icon: string
}

const tiers: Tier[] = [
  {
    name: 'Wanderer',
    icon: 'tier-wanderer.svg',
    price: 'Free',
    flavour: 'Every tale begins with a single word.',
    features: [
      { text: '100 credits / month', included: true },
      { text: '5 daily refresh credits', included: true },
      { text: '2 languages max', included: true },
      { text: '5 saved names', included: true },
      { text: '1 preset', included: true },
      { text: 'Last 12 generations history', included: true },
      { text: 'Duplicate protection', included: false },
      { text: 'Full tool suite', included: false },
      { text: 'Full generator access', included: false },
    ],
    cta: 'Get Started',
  },
  {
    name: 'Keeper',
    icon: 'tier-keeper.svg',
    price: '$6.99',
    period: '/mo',
    flavour: 'For the keeper of lore and language.',
    features: [
      { text: '500 credits / month', included: true },
      { text: '10 daily refresh credits', included: true },
      { text: '3 languages max', included: true },
      { text: '20 saved names', included: true },
      { text: '5 presets', included: true },
      { text: 'Last 100 generations history', included: true },
      { text: 'Full tool suite', included: true },
      { text: 'Duplicate protection', included: false },
      { text: 'Full generator access', included: false },
    ],
    cta: 'Get Started',
  },
  {
    name: 'Shaper',
    icon: 'tier-shaper.svg',
    price: '$12.99',
    period: '/mo',
    flavour: 'Shape the names that will define your world.',
    features: [
      { text: '1,000 credits / month', included: true },
      { text: '15 daily refresh credits', included: true },
      { text: '∞ languages', included: true },
      { text: '∞ saved names', included: true },
      { text: '10 presets', included: true },
      { text: '∞ generation history', included: true },
      { text: 'Duplicate protection', included: true },
      { text: 'Full generator access', included: true },
      { text: 'Full tool suite', included: false },
    ],
    cta: 'Get Started',
  },
  {
    name: 'Weaver',
    icon: 'tier-weaver.svg',
    price: '$19.99',
    period: '/mo',
    flavour: 'Weave worlds from the threads of ancient tongues.',
    features: [
      { text: '2,500 credits / month', included: true },
      { text: '25 daily refresh credits', included: true },
      { text: '∞ languages', included: true },
      { text: '∞ saved names', included: true },
      { text: '20 presets', included: true },
      { text: '∞ generation history', included: true },
      { text: 'Duplicate protection', included: true },
      { text: 'Full generator access', included: true },
      { text: 'Full tool suite + The Tome', included: true },
    ],
    cta: 'Get Started',
    badge: 'Most Popular',
    borderClass: 'border-brand-gold-400/50',
  },
  {
    name: 'Visionary',
    icon: 'tier-visionary.svg',
    price: '$34.99',
    period: '/mo',
    flavour: 'For those who build entire cosmologies.',
    features: [
      { text: '5,000 credits / month', included: true },
      { text: '50 daily refresh credits', included: true },
      { text: '∞ languages', included: true },
      { text: '∞ saved names', included: true },
      { text: '20 presets', included: true },
      { text: '∞ generation history', included: true },
      { text: 'Duplicate protection', included: true },
      { text: 'Full generator access', included: true },
      { text: 'Full tool suite + The Tome', included: true },
      { text: 'Alpha feature access', included: true },
      { text: 'AI image generation', included: true },
    ],
    cta: 'Get Started',
  },
  {
    name: 'The Author',
    icon: 'tier-author.svg',
    price: '$999',
    period: ' lifetime',
    flavour: 'Once, forever. The name of your world deserves no less.',
    features: [
      { text: '500 rollover credits / month (15,000 cap)', included: true },
      { text: '50 daily refresh credits', included: true },
      { text: '∞ languages', included: true },
      { text: '∞ saved names', included: true },
      { text: '20 presets', included: true },
      { text: '∞ generation history', included: true },
      { text: 'Duplicate protection', included: true },
      { text: 'Full generator access', included: true },
      { text: 'Full tool suite + The Tome', included: true },
      { text: 'Alpha feature access', included: true },
      { text: 'AI image generation', included: true },
      { text: 'Never pay again', included: true },
    ],
    cta: 'Claim Lifetime Access',
    lifetime: true,
    borderClass: 'border-red-700/50',
  },
]

const creditTiers = [
  { dots: 1, label: 'Simple', subtitle: '1–2 languages', cost: '1 credit per name' },
  { dots: 2, label: 'Standard', subtitle: '3–4 languages', cost: '2 credits per name' },
  { dots: 3, label: 'Complex', subtitle: '5+ languages', cost: '3 credits per name' },
]

const faqs = [
  {
    q: 'What happens when I run out of credits?',
    a: 'Daily refresh credits arrive every 24 hours. Monthly credits reset on your billing date. You can still browse tools and view saved names while out of credits.',
  },
  {
    q: 'Can I change my tier?',
    a: 'Yes. Upgrade or downgrade anytime. Upgrades take effect immediately, downgrades at the end of your billing cycle.',
  },
  {
    q: 'What is The Author tier?',
    a: 'A one-time lifetime purchase. Pay once, use forever. Credits roll over month to month up to a 15,000 cap.',
  },
  {
    q: 'What tools are available?',
    a: 'The Atelier currently features The Signet (name generator), with more tools arriving regularly. All tools are accessible on the Atelier page.',
  },
]

export default function PricingClient() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <main>
      <Nav />

      {/* Hero */}
      <section className="px-8 pt-40 pb-24 text-center border-b border-brand-border">
        <h1 className="font-cinzel font-black text-brand-parchment text-5xl md:text-6xl mb-4 leading-tight">
          Choose Your Path
        </h1>
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="h-px w-16 bg-brand-gold-400/30" />
          <span className="text-brand-gold-400/50 text-xs">✦</span>
          <div className="h-px w-16 bg-brand-gold-400/30" />
        </div>
        <p className="font-fell text-brand-gold-300 text-xl md:text-2xl max-w-lg mx-auto leading-relaxed opacity-90">
          Begin free. Forge deeper when you&apos;re ready.
        </p>
      </section>

      {/* Tier Cards */}
      <section className="px-8 py-20 border-b border-brand-border">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`dark-card flex flex-col ${tier.borderClass ?? ''} ${tier.lifetime ? 'p-8' : ''}`}
            >
              {tier.lifetime && (
                <p className="section-label mb-1">Lifetime</p>
              )}
              {tier.badge && (
                <span className="inline-block self-start mb-2 font-cinzel text-xs tracking-widest uppercase text-brand-gold-400 bg-brand-gold-400/10 border border-brand-gold-400/30 px-2 py-0.5 rounded-sm">
                  {tier.badge}
                </span>
              )}
              <div className="flex items-center gap-3 mb-1">
                <Image src={`/icons/${tier.icon}`} width={48} height={48} alt={tier.name} unoptimized />
                <h2 className="font-cinzel font-black text-brand-parchment text-2xl">
                  {tier.name}
                </h2>
              </div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="font-cinzel font-black text-brand-gold-400 text-4xl">{tier.price}</span>
                {tier.period && (
                  <span className="font-cinzel text-brand-muted text-sm">{tier.period}</span>
                )}
              </div>
              <p className="font-fell text-brand-gold-300 text-sm mb-6 opacity-80">
                {tier.flavour}
              </p>
              <ul className="flex flex-col gap-2 mb-8 flex-1">
                {tier.features.map((f) => (
                  <li
                    key={f.text}
                    className={`font-fell text-sm flex items-start gap-2 ${f.included ? 'text-brand-parchment' : 'text-brand-muted opacity-50'}`}
                  >
                    <span className="mt-0.5 shrink-0">{f.included ? '✓' : '—'}</span>
                    <span>{f.text}</span>
                  </li>
                ))}
              </ul>
              <button type="button" className="btn-primary w-full">
                {tier.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Credit System Explainer */}
      <section className="bg-brand-card px-8 py-20 border-b border-brand-border">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-cinzel font-black text-brand-parchment text-3xl text-center mb-10">
            How Credits Work
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {creditTiers.map((ct) => (
              <div key={ct.label} className="dark-card">
                <div className="flex gap-1.5 mb-4">
                  {Array.from({ length: ct.dots }).map((_, i) => (
                    <div key={i} className="w-3 h-3 rounded-full bg-brand-gold-400" />
                  ))}
                </div>
                <p className="font-cinzel font-black text-brand-parchment text-lg mb-1">{ct.label}</p>
                <p className="font-fell text-brand-gold-300 text-sm mb-3 opacity-80">{ct.subtitle}</p>
                <p className="font-cinzel text-xs tracking-widest uppercase text-brand-muted">{ct.cost}</p>
              </div>
            ))}
          </div>
          <p className="font-fell text-brand-gold-300 text-center text-lg opacity-80">
            Daily refresh credits reset every 24 hours and do not consume your monthly pool.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-8 py-20 border-b border-brand-border">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-cinzel font-black text-brand-parchment text-3xl text-center mb-10">
            Questions
          </h2>
          <div className="flex flex-col gap-2">
            {faqs.map((faq, i) => (
              <div key={i} className="dark-card">
                <button
                  type="button"
                  className="w-full flex items-start justify-between gap-4 text-left"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-cinzel text-sm tracking-wide text-brand-parchment">{faq.q}</span>
                  <span className="font-cinzel text-brand-muted shrink-0 mt-0.5 text-lg leading-none">
                    {openFaq === i ? '−' : '+'}
                  </span>
                </button>
                {openFaq === i && (
                  <p className="font-fell text-brand-muted leading-relaxed mt-4 text-sm">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
