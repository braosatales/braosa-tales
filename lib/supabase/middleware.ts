import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Pages that require a signed-in user. API routes guard themselves (401).
const PROTECTED_PAGE_PREFIXES = ['/atelier/signet', '/the8adventurers', '/dashboard', '/settings']

export async function updateSession(request: NextRequest) {
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

  // Do not put code between createServerClient and getUser(): getUser() is what refreshes the session.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname, search } = request.nextUrl
  const isProtected = PROTECTED_PAGE_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))

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
