import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { isAdmin } from '@/lib/the8adventurers/isAdmin'

// POST /api/the8adventurers/upload-image
// Body: FormData with `file` (image) and `path` (storage subfolder, e.g. "portraits/lore")
// Returns: { url: string }
export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!await isAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const path = (formData.get('path') as string | null) ?? 'misc'

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const supabase = createServerSupabase()
  await supabase.storage.createBucket('the8adventurers', { public: true }).catch(() => {})

  const ext = file.name.split('.').pop() ?? 'jpg'
  const fileName = `${path}/${crypto.randomUUID()}.${ext}`

  const arrayBuffer = await file.arrayBuffer()
  const buffer = new Uint8Array(arrayBuffer)

  const { error: uploadError } = await supabase.storage
    .from('the8adventurers')
    .upload(fileName, buffer, { contentType: file.type })

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

  const { data: { publicUrl } } = supabase.storage.from('the8adventurers').getPublicUrl(fileName)
  return NextResponse.json({ url: publicUrl })
}
