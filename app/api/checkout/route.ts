import { stripe } from '@/lib/stripe'
import { auth } from '@clerk/nextjs/server'

const PRICE_MAP: Record<string, string> = {
  keeper:    process.env.STRIPE_PRICE_KEEPER!,
  shaper:    process.env.STRIPE_PRICE_SHAPER!,
  weaver:    process.env.STRIPE_PRICE_WEAVER!,
  visionary: process.env.STRIPE_PRICE_VISIONARY!,
  author:    process.env.STRIPE_PRICE_AUTHOR!,
}

export async function POST(req: Request) {
  console.log('PRICE_MAP:', JSON.stringify(PRICE_MAP))
  const body = await req.json()
  console.log('Checkout body:', JSON.stringify(body))
  const { userId } = auth()
  console.log('User ID:', userId)
  if (!userId) {
    console.log('FAIL: no userId')
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { tier } = body
  const priceId = PRICE_MAP[tier]
  if (!priceId) {
    console.log('FAIL: invalid tier, received:', tier, 'valid keys:', Object.keys(PRICE_MAP))
    return Response.json({ error: 'Invalid tier' }, { status: 400 })
  }
  const isOneTime = tier === 'author'
  const session = await stripe.checkout.sessions.create({
    mode: isOneTime ? 'payment' : 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: 'https://braosatales.com/atelier?upgraded=true',
    cancel_url: 'https://braosatales.com/pricing',
    metadata: { clerk_id: userId, tier },
  })
  return Response.json({ url: session.url })
}
