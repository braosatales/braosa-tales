import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase'
import { headers } from 'next/headers'

const TIER_CREDITS: Record<string, number> = {
  keeper: 500, shaper: 1000, weaver: 2500, visionary: 5000, author: 500,
}
const TIER_DAILY: Record<string, number> = {
  keeper: 10, shaper: 15, weaver: 25, visionary: 50, author: 50,
}

export async function POST(req: Request) {
  const body = await req.text()
  const sig = headers().get('stripe-signature')!
  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return new Response('Invalid signature', { status: 400 })
  }

  await supabaseAdmin.from('stripe_events').insert({
    stripe_event_id: event.id,
    type: event.type,
    payload: event,
  })

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any
    const { clerk_id, tier } = session.metadata
    await supabaseAdmin.from('users').update({
      tier,
      credits: TIER_CREDITS[tier] ?? 100,
      daily_credits: TIER_DAILY[tier] ?? 5,
      credits_reset_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }).eq('clerk_id', clerk_id)
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as any
    const clerkId = sub.metadata?.clerk_id
    if (clerkId) {
      await supabaseAdmin.from('users').update({
        tier: 'wanderer',
        credits: 100,
        daily_credits: 5,
      }).eq('clerk_id', clerkId)
    }
  }

  return new Response('OK', { status: 200 })
}
