import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { hubApi } from '@/lib/hub/server'

type P = { params: { slug: string } }

// POST FormData { file, path } → { url }. Files live under the campaign's own folder.
export async function POST(req: Request, { params }: P) {
  const hub = await hubApi(params.slug)
  if (hub instanceof NextResponse) return hub
  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const sub = String(formData.get('path') ?? 'misc').replace(/[^a-z0-9/_-]/gi, '').slice(0, 60) || 'misc'
  // Players may upload a portrait for their own character; everything else is the GM's.
  if (!hub.gm && sub !== 'portraits/players') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  if (!file.type.startsWith('image/')) return NextResponse.json({ error: 'Images only' }, { status: 400 })
  if (file.size > 8 * 1024 * 1024) return NextResponse.json({ error: 'Image is over 8 MB' }, { status: 400 })

  const db = createServerSupabase()
  await db.storage.createBucket('the8adventurers', { public: true }).catch(() => {})
  const ext = (file.name.split('.').pop() ?? 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
  const fileName = `${hub.campaign.id}/${sub}/${crypto.randomUUID()}.${ext}`
  const { error } = await db.storage.from('the8adventurers').upload(fileName, new Uint8Array(await file.arrayBuffer()), { contentType: file.type })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ url: db.storage.from('the8adventurers').getPublicUrl(fileName).data.publicUrl })
}
