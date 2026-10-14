import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { hubApi, idsInCampaign, ownsRow } from '@/lib/hub/server'

type P = { params: { slug: string } }

export async function GET(_req: Request, { params }: P) {
  const hub = await hubApi(params.slug)
  if (hub instanceof NextResponse) return hub
  const { data, error } = await createServerSupabase().from('the8_maps').select('*').eq('campaign_id', hub.campaign.id).order('sort_order')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST FormData: file, title, caption, sort_order
export async function POST(req: Request, { params }: P) {
  const hub = await hubApi(params.slug, { gm: true })
  if (hub instanceof NextResponse) return hub
  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const title = (formData.get('title') as string | null) || 'Untitled map'
  const caption = (formData.get('caption') as string | null) || null
  const sort_order = parseInt((formData.get('sort_order') as string | null) ?? '0', 10) || 0
  if (!file) return NextResponse.json({ error: 'Map image file is required' }, { status: 400 })
  if (!file.type.startsWith('image/')) return NextResponse.json({ error: 'Images only' }, { status: 400 })

  const db = createServerSupabase()
  await db.storage.createBucket('the8adventurers', { public: true }).catch(() => {})
  const ext = (file.name.split('.').pop() ?? 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
  const fileName = `${hub.campaign.id}/maps/${crypto.randomUUID()}.${ext}`
  const { error: uploadErr } = await db.storage.from('the8adventurers').upload(fileName, new Uint8Array(await file.arrayBuffer()), { contentType: file.type })
  if (uploadErr) return NextResponse.json({ error: uploadErr.message }, { status: 500 })
  const image_url = db.storage.from('the8adventurers').getPublicUrl(fileName).data.publicUrl

  const { data, error } = await db.from('the8_maps').insert({ campaign_id: hub.campaign.id, title, image_url, caption, sort_order }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
