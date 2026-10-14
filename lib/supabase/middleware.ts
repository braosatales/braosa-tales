import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Pages that require a signed-in user. API routes guard themselves (401).
const PROTECTED_PAGE_PREFIXES = ['/atelier/signet', '/dashboard', '/settings']

export async function updateSession(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const isProtected = PROTECTED_PAGE_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))

  // Signed-out visitors: nothing to refresh, so skip Supabase entirely.
  const hasSession = request.cookies.getAll().some((c) => c.name.startsWith('sb-') && c.name.includes('-auth-token'))
  if (!hasSession) {
    if (!isProtected) return NextResponse.next({ request })
    const url = request.nextUrl.clone()
    url.pathname = '/sign-in'
    url.search = `?next=${encodeURIComponent(pathname + search)}`
    return NextResponse.redirect(url)
  }

  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )

  // getSession() reads the cookie and only calls Supabase when the access token has expired and must be
  // refreshed (about once an hour), instead of a network round trip on every page view. It's not a security
  // check: every protected page and API route verifies the user itself with getUser().
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const user = session?.user ?? null

  if (!user && isProtected) {
    const url = request.nextUrl.clone()
    url.pathname = '/sign-in'
    url.search = `?next=${encodeURIComponent(pathname + search)}`
    const redirect = NextResponse.redirect(url)
    // Carry over any refreshed/cleared auth cookies.
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c))
    return redirect
  }

  return response
}
