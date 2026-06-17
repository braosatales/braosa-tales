import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServerSupabase()
  const { data } = await supabase
    .from('the8_world_map')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return NextResponse.json(data)
}
