import { NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'

/**
 * Server-to-server guard for /api/vor/*: only Clot's bridge on João's Mac calls these.
 * VOR_API_SECRET lives in Vercel and in hq-phone's bridge/.env.local, nowhere else.
 */
export function vorUnauthorized(req: Request): NextResponse | null {
  const secret = process.env.VOR_API_SECRET
  if (!secret || secret.length < 24) return NextResponse.json({ error: 'VOR_API_SECRET is not set.' }, { status: 503 })
  const got = Buffer.from(req.headers.get('authorization') ?? '')
  const want = Buffer.from(`Bearer ${secret}`)
  if (got.length === want.length && timingSafeEqual(got, want)) return null
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

export const MAX_POST_LENGTH = 1900
