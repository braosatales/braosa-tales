import { NextResponse } from 'next/server'
import { syncStartPlaying } from '@/lib/startplaying-sync'
import { vorUnauthorized } from '@/lib/vor-api'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// POST ?dry=1 — sync from StartPlaying now (Clot's refresh). With dry=1 it only reports what it would change.
export async function POST(req: Request) {
  const denied = vorUnauthorized(req)
  if (denied) return denied
  const dry = new URL(req.url).searchParams.get('dry') === '1'
  const r = await syncStartPlaying({ dry })
  return NextResponse.json(r, { status: r.ok ? 200 : 502 })
}
