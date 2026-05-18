import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: Request) {
  console.log('SUPABASE_URL present:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log('SERVICE_KEY present:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)

  const { email } = await req.json()
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: 'Invalid email' }, { status: 400 })
  }

  try {
    const { error } = await supabaseAdmin.from('newsletter').insert({ email })
    if (error?.code === '23505') {
      return Response.json({ error: 'Already subscribed' }, { status: 409 })
    }
    if (error) {
      console.error('Newsletter error:', JSON.stringify(error))
      return Response.json({ error: 'Server error' }, { status: 500 })
    }
    return Response.json({ success: true })
  } catch (err) {
    console.error('Newsletter error:', JSON.stringify(err))
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}
