import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: Request) {
  const { email } = await req.json()
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: 'Invalid email' }, { status: 400 })
  }
  const { error } = await supabaseAdmin.from('newsletter').insert({ email })
  if (error?.code === '23505') {
    return Response.json({ error: 'Already subscribed' }, { status: 409 })
  }
  if (error) return Response.json({ error: 'Server error' }, { status: 500 })
  return Response.json({ success: true })
}
