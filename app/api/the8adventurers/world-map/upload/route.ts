import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { isAdmin } from '@/lib/the8adventurers/isAdmin'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!await isAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const caption = (formData.get('caption') as string | null) || null

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const supabase = createServerSupabase()

  // Create bucket if it doesn't exist yet
  await supabase.storage.createBucket('the8adventurers', { public: true }).catch(() => {})

  const ext = file.name.split('.').pop() ?? 'jpg'
  const fileName = `world-map.${ext}`

  const arrayBuffer = await file.arrayBuffer()
  const buffer = new Uint8Array(arrayBuffer)

  const { error: uploadError } = await supabase.storage
    .from('the8adventurers')
    .upload(fileName, buffer, { upsert: true, contentType: file.type })

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

  const { data: { publicUrl } } = supabase.storage.from('the8adventurers').getPublicUrl(fileName)

  // Upsert single world map row
  const { data: existing } = await supabase
    .from('the8_world_map')
    .select('id')
    .limit(1)
    .maybeSingle()

  if (existing) {
    await supabase
      .from('the8_world_map')
      .update({ image_url: publicUrl, caption, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
  } else {
    await supabase.from('the8_world_map').insert({ image_url: publicUrl, caption })
  }

  return NextResponse.json({ image_url: publicUrl })
}

export async function PUT(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!await isAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { caption } = await req.json()
  const supabase = createServerSupabase()

  const { data: existing } = await supabase
    .from('the8_world_map')
    .select('id')
    .limit(1)
    .maybeSingle()

  if (!existing) return NextResponse.json({ error: 'No map yet' }, { status: 404 })

  const { data, error } = await supabase
    .from('the8_world_map')
    .update({ caption, updated_at: new Date().toISOString() })
    .eq('id', existing.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
