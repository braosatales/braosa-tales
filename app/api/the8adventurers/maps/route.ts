import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { isAdmin } from '@/lib/the8adventurers/isAdmin'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServerSupabase()
  const { data, error } = await supabase
    .from('the8_maps')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST with FormData: file (optional), title, caption, sort_order
export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!await isAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const title = (formData.get('title') as string | null) ?? 'Untitled Map'
  const caption = (formData.get('caption') as string | null) || null
  const sort_order = parseInt((formData.get('sort_order') as string | null) ?? '0', 10)

  const supabase = createServerSupabase()

  let image_url = ''

  if (file) {
    await supabase.storage.createBucket('the8adventurers', { public: true }).catch(() => {})
    const ext = file.name.split('.').pop() ?? 'jpg'
    const fileName = `maps/${crypto.randomUUID()}.${ext}`
    const buffer = new Uint8Array(await file.arrayBuffer())
    const { error: uploadErr } = await supabase.storage
      .from('the8adventurers')
      .upload(fileName, buffer, { contentType: file.type })
    if (uploadErr) return NextResponse.json({ error: uploadErr.message }, { status: 500 })
    image_url = supabase.storage.from('the8adventurers').getPublicUrl(fileName).data.publicUrl
  } else {
    return NextResponse.json({ error: 'Map image file is required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('the8_maps')
    .insert({ title, image_url, caption, sort_order })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
