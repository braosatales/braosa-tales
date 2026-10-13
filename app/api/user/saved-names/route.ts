import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { getAuthUser } from '@/lib/auth'

export async function GET() {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServerSupabase()
  const { data } = await supabase
    .from('saved_names')
    .select('*')
    .eq('user_id', user.id)
    .order('saved_at', { ascending: false })

  return NextResponse.json(data || [])
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const {
    name, pronunciation, language, root_words,
    meaning, resonance, target,
    vibe, style, themes, concept, languages,
  } = await req.json()

  const supabase = createServerSupabase()
  const { data, error } = await supabase
    .from('saved_names')
    .insert({
      user_id: user.id,
      name, pronunciation, language,
      root_words, meaning, resonance,
      target: target || 'Unknown',
      vibe:      vibe      || null,
      style:     style     || null,
      themes:    themes    || null,
      concept:   concept   || null,
      languages: languages || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const supabase = createServerSupabase()
  await supabase.from('saved_names').delete().eq('id', id).eq('user_id', user.id)

  return NextResponse.json({ success: true })
}
