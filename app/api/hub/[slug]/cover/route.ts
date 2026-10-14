import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { hubApi } from '@/lib/hub/server'

type P = { params: { slug: string } }

// POST FormData { file } — new cover image. DELETE — back to the plain banner.
export async function POST(req: Request, { params }: P) {
  const hub = await hubApi(params.slug, { gm: true })
  if (hub instanceof NextResponse) return hub
  const file = (await req.formData()).get('file') as File | null
  if (!file || !file.type.startsWith('image/')) return NextResponse.json({ error: 'Choose an image.' }, { status: 400 })
  if (file.size > 8 * 1024 * 1024) return NextResponse.json({ error: 'Image is over 8 MB.' }, { status: 400 })
  const db = createServerSupabase()
  await db.storage.createBucket('the8adventurers', { public: true }).catch(() => {})
  const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
  const path = `${hub.campaign.id}/cover/${crypto.randomUUID()}.${ext}`
  const { error } = await db.storage.from('the8adventurers').upload(path, new Uint8Array(await file.arrayBuffer()), { contentType: file.type })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const url = db.storage.from('the8adventurers').getPublicUrl(path).data.publicUrl
  await db.from('campaigns').update({ cover_url: url }).eq('id', hub.campaign.id)
  return NextResponse.json({ url })
}

export async function DELETE(_req: Request, { params }: P) {
  const hub = await hubApi(params.slug, { gm: true })
  if (hub instanceof NextResponse) return hub
  await createServerSupabase().from('campaigns').update({ cover_url: null }).eq('id', hub.campaign.id)
  return NextResponse.json({ ok: true })
}
