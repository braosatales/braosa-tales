'use client'

import Image from 'next/image'
import Nav from '@/components/Nav'
import PageHero, { SectionTitle } from '@/components/PageHero'
import Footer from '@/components/Footer'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'

type Feature = { text: string; included: boolean }

type Tier = {
  name: string
  id: string
  icon: string
  price: string
  period?: string
  flavour: string
  features: Feature[]
  cta: string
  badge?: string
  lifetime?: boolean
  borderClass?: string
}

const tiers: Tier[] = [
  {
    name: 'Wanderer',
    id: 'wanderer',
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
    id: 'keeper',
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
    id: 'shaper',
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
    id: 'weaver',
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
    id: 'visionary',
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
    id: 'author',
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

const PRICES = {
  wanderer:  { usd: 'Free',   eur: 'Free'   },
  keeper:    { usd: '$6.99',  eur: '€5.99'  },
  shaper:    { usd: '$12.99', eur: '€10.99' },
  weaver:    { usd: '$19.99', eur: '€16.99' },
  visionary: { usd: '$34.99', eur: '€29.99' },
  author:    { usd: '$999',   eur: '€899'   },
}

export default function PricingPage() {
  const [loadingTier, setLoadingTier] = useState<string | null>(null)
  const [currency, setCurrency] = useState<'usd' | 'eur'>('usd')
  const router = useRouter()
  const { isSignedIn } = useAuth()

  async function handleCheckout(tier: Tier) {
    if (tier.id === 'wanderer') {
      router.push('/sign-up')
      return
    }
    if (!isSignedIn) {
      router.push('/sign-in')
      return
    }
    setLoadingTier(tier.id)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: tier.id }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } finally {
      setLoadingTier(null)
    }
  }

  const price = (t: Tier) => PRICES[t.id as keyof typeof PRICES]?.[currency]

  const TierCard = ({ tier }: { tier: Tier }) => {
    const featured = !!tier.badge
    return (
      <div
        className={`flex flex-col rounded-2xl border p-6 ${
          tier.lifetime
            ? 'border-leaf/40 bg-umber'
            : featured
              ? 'border-leaf/60 bg-plum shadow-[0_0_0_1px_rgba(212,174,88,0.15)]'
              : 'border-plum-line bg-plum/60'
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <Image src={`/icons/${tier.icon}`} width={40} height={40} alt="" unoptimized />
          {tier.badge && <span className="rounded-full bg-leaf/15 px-3 py-1 text-[0.72rem] font-bold text-leaf-soft">{tier.badge}</span>}
          {tier.lifetime && <span className="rounded-full bg-ember/15 px-3 py-1 text-[0.72rem] font-bold text-ember">Pay once</span>}
        </div>
        <h2 className="mt-4 font-cinzel text-[1.35rem] font-bold text-vellum">{tier.name}</h2>
        <p className="mt-1 text-[0.9rem] leading-snug text-mist">{tier.flavour}</p>
        <p className="mt-5 flex items-baseline gap-1">
          <span className="font-cinzel text-[2rem] font-bold text-vellum">{price(tier)}</span>
          {tier.id !== 'wanderer' && <span className="text-mist">{tier.lifetime ? 'once' : '/month'}</span>}
        </p>
        <ul className="mt-5 flex-1 space-y-2">
          {tier.features.map((f) => (
            <li key={f.text} className={`flex items-start gap-2 text-[0.9rem] leading-snug ${f.included ? 'text-prose' : 'text-mist/50 line-through decoration-mist/30'}`}>
              <span aria-hidden="true" className={`mt-[0.1em] shrink-0 ${f.included ? 'text-leaf' : ''}`}>{f.included ? '✓' : '–'}</span>
              <span>
                <span className="sr-only">{f.included ? 'Included: ' : 'Not included: '}</span>
                {f.text}
              </span>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className={`${featured || tier.lifetime ? 'btn-gold' : 'btn-ghost'} mt-7 w-full disabled:opacity-60`}
          disabled={loadingTier === tier.id}
          onClick={() => handleCheckout(tier)}
        >
          {loadingTier === tier.id ? 'Opening checkout…' : tier.id === 'wanderer' ? 'Start free' : tier.lifetime ? 'Claim lifetime access' : `Choose ${tier.name}`}
        </button>
      </div>
    )
  }

  return (
    <main className="bg-night">
      <Nav />
      <PageHero
        tone="plum"
        title="Plans for the Atelier"
        intro="Begin free. Forge deeper when you’re ready."
      >
        <div role="group" aria-label="Currency" className="inline-flex rounded-full border border-leaf/50 p-1">
          {(['usd', 'eur'] as const).map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={currency === c}
              onClick={() => setCurrency(c)}
              className={`rounded-full px-5 py-1.5 text-[0.85rem] font-bold transition-colors ${
                currency === c ? 'bg-leaf text-night' : 'text-leaf-soft hover:text-vellum'
              }`}
            >
              {c === 'usd' ? '$ USD' : '€ EUR'}
            </button>
          ))}
        </div>
      </PageHero>

      <section className="bg-plum">
        <div className="mx-auto max-w-[1180px] px-6 pb-20 md:px-10">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {tiers.map((tier) => (
              <TierCard key={tier.id} tier={tier} />
            ))}
          </div>

        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-6 py-20 md:px-10 md:py-24">
        <SectionTitle>How credits work</SectionTitle>
        <p className="mt-3 max-w-measure leading-relaxed text-prose">
          Each name The Signet generates costs credits, depending on how many languages you blend.
        </p>
        <ul className="mt-10 grid gap-8 border-t border-plum-line pt-8 md:grid-cols-3">
          {creditTiers.map((ct) => (
            <li key={ct.label}>
              <p aria-hidden="true" className="flex gap-1.5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <span key={i} className={`h-2.5 w-2.5 rounded-full ${i < ct.dots ? 'bg-leaf' : 'bg-plum-line'}`} />
                ))}
              </p>
              <p className="mt-3 font-cinzel text-[1.15rem] font-bold text-vellum">{ct.label}</p>
              <p className="text-mist">{ct.subtitle}</p>
              <p className="mt-1 text-leaf-soft">{ct.cost}</p>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-mist">Daily refresh credits reset every 24 hours and don’t touch your monthly pool.</p>
      </section>

      <section className="border-t border-plum-line">
        <div className="mx-auto grid max-w-[1180px] gap-12 px-6 py-20 md:px-10 md:py-24 lg:grid-cols-[1fr_2fr]">
          <SectionTitle>Questions</SectionTitle>
          <div className="divide-y divide-plum-line border-y border-plum-line">
            {faqs.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-[1.08rem] text-vellum">
                  {f.q}
                  <span aria-hidden="true" className="text-leaf transition-transform duration-300 group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 max-w-measure leading-relaxed text-prose">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
