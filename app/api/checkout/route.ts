import { stripe } from '@/lib/stripe'
import { getAuthUser } from '@/lib/auth'

const PRICE_MAP: Record<string, string | undefined> = {
  keeper:    process.env.STRIPE_PRICE_KEEPER,
  shaper:    process.env.STRIPE_PRICE_SHAPER,
  weaver:    process.env.STRIPE_PRICE_WEAVER,
  visionary: process.env.STRIPE_PRICE_VISIONARY,
  author:    process.env.STRIPE_PRICE_AUTHOR,
}

export async function POST(req: Request) {
  const user = await getAuthUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { tier } = await req.json()
  const priceId = PRICE_MAP[tier]
  if (!priceId) return Response.json({ error: 'Invalid tier' }, { status: 400 })

  const isOneTime = tier === 'author'
  const metadata = { user_id: user.id, tier }

  const session = await stripe.checkout.sessions.create({
    mode: isOneTime ? 'payment' : 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: 'https://braosatales.com/atelier?upgraded=true',
    cancel_url: 'https://braosatales.com/pricing',
    client_reference_id: user.id,
    customer_email: user.email ?? undefined,
    metadata,
    // Copy metadata onto the subscription too, so customer.subscription.deleted can find the user.
    ...(isOneTime ? {} : { subscription_data: { metadata } }),
  })
  return Response.json({ url: session.url })
}
