import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { createServerSupabase } from '@/lib/supabase-server'
import { TOOL_SLUGS } from '@/lib/atelier'

// PUT { slug, pinned } — pin or unpin an Atelier tool on the user's dashboard
export async function PUT(req: Request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { slug, pinned } = await req.json()
  if (typeof slug !== 'string' || !TOOL_SLUGS.has(slug)) {
    return NextResponse.json({ error: 'Unknown tool' }, { status: 400 })
  }

  const db = createServerSupabase()
  const { error } = pinned
    ? await db.from('user_pinned_tools').upsert({ user_id: user.id, tool_slug: slug }, { onConflict: 'user_id,tool_slug', ignoreDuplicates: true })
    : await db.from('user_pinned_tools').delete().eq('user_id', user.id).eq('tool_slug', slug)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
