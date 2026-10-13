import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { getAuthUser, displayName } from '@/lib/auth'

export async function GET() {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServerSupabase()

  const { data: existing } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (existing) {
    await supabase.from('users').update({ last_active: new Date().toISOString() }).eq('id', user.id)
    return NextResponse.json(existing)
  }

  // Safety net: the on_auth_user_confirmed trigger normally creates (or reclaims) this row.
  const { data: newUser, error } = await supabase
    .from('users')
    .upsert(
      {
        id: user.id,
        email: user.email ?? '',
        full_name: displayName(user),
        tier: 'wanderer',
        credits: 100,
        daily_credits: 5,
        signed_up_at: new Date().toISOString(),
        last_active: new Date().toISOString(),
      },
      { onConflict: 'id' }
    )
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(newUser)
}
