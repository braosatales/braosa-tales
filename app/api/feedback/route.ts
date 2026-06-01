import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase, getUserByClerkId } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  const body = await req.json()
  const { type, message, context } = body

  if (!message?.trim()) {
    return NextResponse.json({ error: 'Message required' }, { status: 400 })
  }

  const supabase = createServerSupabase()

  let userEmail = 'anonymous'
  let userName  = 'anonymous'
  if (userId) {
    const user = await getUserByClerkId(userId)
    if (user) {
      userEmail = user.email || 'unknown'
      userName  = user.full_name || 'unknown'
    }
  }

  const { error } = await supabase
    .from('feedback')
    .insert({
      type,
      message: message.trim(),
      context: context || null,
      user_email: userEmail,
      user_name: userName,
      submitted_at: new Date().toISOString(),
    })

  if (error) {
    // If table doesn't exist yet, still return success
    // so the user experience isn't broken
    console.error('Feedback insert error:', error)
  }

  return NextResponse.json({ success: true })
}
