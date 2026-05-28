import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServerSupabase()

  const { data: existing } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_id', userId)
    .single()

  if (existing) {
    await supabase.from('users').update({ last_active: new Date().toISOString() }).eq('clerk_id', userId)
    return NextResponse.json(existing)
  }

  const clerkUser = await currentUser()
  const email = clerkUser?.emailAddresses?.[0]?.emailAddress ?? ''
  const full_name = `${clerkUser?.firstName ?? ''} ${clerkUser?.lastName ?? ''}`.trim()

  const { data: newUser, error } = await supabase
    .from('users')
    .insert({
      clerk_id: userId,
      email,
      full_name,
      tier: 'wanderer',
      credits: 100,
      daily_credits: 5,
      signed_up_at: new Date().toISOString(),
      last_active: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(newUser)
}
