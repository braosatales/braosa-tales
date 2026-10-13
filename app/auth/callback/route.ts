import { NextResponse, type NextRequest } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { safeNext } from '@/lib/safe-next'

// Lands here from: Google OAuth, the sign-up confirmation email, and the password-reset email.
// Supports both the PKCE `code` flow and the `token_hash` email-template flow.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = safeNext(searchParams.get('next'), '/')

  const supabase = createClient()
  let error: { message: string } | null = null

  if (code) {
    ;({ error } = await supabase.auth.exchangeCodeForSession(code))
  } else if (tokenHash && type) {
    ;({ error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash }))
  } else {
    error = { message: searchParams.get('error_description') || 'Missing auth code' }
  }

  if (error) {
    const url = new URL('/sign-in', origin)
    url.searchParams.set('error', 'That link is invalid or has expired. Please try again.')
    return NextResponse.redirect(url)
  }

  return NextResponse.redirect(new URL(type === 'recovery' ? '/reset-password' : next, origin))
}
