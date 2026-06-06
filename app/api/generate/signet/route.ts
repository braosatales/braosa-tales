import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase, getUserByClerkId } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { creditsToUse = 1, target = '', languages = [], vibe = '', themes = [], style = '', concept = '' } = body

  const user = await getUserByClerkId(userId)
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  const totalAvailable = (user.credits || 0) + (user.daily_credits || 0)
  if (totalAvailable < creditsToUse) return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })

  const supabase = createServerSupabase()

  const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5',
      max_tokens: body.max_tokens || 1400,
      messages: body.messages,
    }),
  })

  const data = await anthropicRes.json()

  if (!anthropicRes.ok) {
    return NextResponse.json({ error: 'Generation failed', detail: data }, { status: 500 })
  }

  // Spend daily credits first, then monthly
  const dailyAvailable  = user.daily_credits || 0
  const dailyToSpend    = Math.min(creditsToUse, dailyAvailable)
  const monthlyToSpend  = creditsToUse - dailyToSpend

  const newDaily   = dailyAvailable - dailyToSpend
  const newMonthly = (user.credits || 0) - monthlyToSpend

  const { data: updatedUser } = await supabase
    .from('users')
    .update({
      daily_credits: newDaily,
      credits: newMonthly,
    })
    .eq('id', user.id)
    .select('daily_credits, credits')
    .single()

  const text = (data.content || []).map((b: { text?: string }) => b.text || '').join('')
  let results = []
  try { results = JSON.parse(text.replace(/```json|```/g, '').trim()) } catch {}

  if (results.length > 0) {
    await supabase.from('generation_history').insert({
      user_id: user.id,
      target,
      languages,
      vibe,
      themes,
      style,
      concept: concept || null,
      results,
      credits_used: creditsToUse,
    })
  }

  return NextResponse.json({
    ...data,
    creditsRemaining: (updatedUser?.daily_credits || 0) + (updatedUser?.credits || 0),
    dailyRemaining:   updatedUser?.daily_credits || 0,
    monthlyRemaining: updatedUser?.credits || 0,
  })
}
