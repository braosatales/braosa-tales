import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { createServerSupabase } from '@/lib/supabase-server'

const MAX_BYTES = 2 * 1024 * 1024
const TYPES: Record<string, string> = { 'image/webp': 'webp', 'image/jpeg': 'jpg', 'image/png': 'png' }

async function setAvatar(userId: string, meta: Record<string, unknown>, url: string | null) {
  const db = createServerSupabase()
  await db.auth.admin.updateUserById(userId, { user_metadata: { ...meta, bt_avatar: url } })
  await db.from('users').update({ avatar_url: url }).eq('id', userId)
}

async function removeOldFiles(userId: string, keep?: string) {
  const db = createServerSupabase()
  const { data } = await db.storage.from('avatars').list(userId)
  const old = (data ?? []).map((f) => `${userId}/${f.name}`).filter((p) => p !== keep)
  if (old.length) await db.storage.from('avatars').remove(old)
}

// POST multipart { file } — upload a new profile picture (the page crops it to a square first)
export async function POST(req: Request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const form = await req.formData()
  const file = form.get('file')
  if (!(file instanceof File)) return NextResponse.json({ error: 'No image received.' }, { status: 400 })
  const ext = TYPES[file.type]
  if (!ext) return NextResponse.json({ error: 'Use a JPG, PNG or WebP image.' }, { status: 400 })
  if (file.size > MAX_BYTES) return NextResponse.json({ error: 'That image is over 2 MB.' }, { status: 400 })

  const path = `${user.id}/${crypto.randomUUID()}.${ext}`
  const db = createServerSupabase()
  const { error } = await db.storage.from('avatars').upload(path, file, { contentType: file.type, upsert: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data } = db.storage.from('avatars').getPublicUrl(path)
  await setAvatar(user.id, user.user_metadata ?? {}, data.publicUrl)
  await removeOldFiles(user.id, path)
  return NextResponse.json({ url: data.publicUrl })
}

// DELETE — remove the profile picture
export async function DELETE() {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await setAvatar(user.id, user.user_metadata ?? {}, null)
  await removeOldFiles(user.id)
  return NextResponse.json({ ok: true })
}
