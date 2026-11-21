import { NextResponse } from 'next/server'
import { openDmChannel, postImageToDiscord } from '@/lib/discord'
import { renderDigestPng } from '@/lib/digest-card'
import { digestHeadline, parseDigest } from '@/lib/vor-digest'
import { vorUnauthorized } from '@/lib/vor-api'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60

const MAX_BODY = 64 * 1024

/**
 * POST — the daily to-do digest. Clot's bridge (the Mac) sends `{ digest }`, built from the TODO.md files
 * with private items already reduced to counts; Vôr draws the card and DMs it to João (DISCORD_OWNER_ID).
 * ?preview=1 returns the PNG and sends nothing. The message text is counts only, so a task title never
 * shows on the lock screen.
 */
export async function POST(req: Request) {
  const denied = vorUnauthorized(req)
  if (denied) return denied

  const raw = await req.text()
  if (raw.length > MAX_BODY) return NextResponse.json({ error: 'Payload too large.' }, { status: 413 })
  let body: unknown
  try {
    body = JSON.parse(raw)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 })
  }
  const parsed = parseDigest((body as { digest?: unknown } | null)?.digest)
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })
  const d = parsed.digest

  let png: ArrayBuffer
  try {
    png = await renderDigestPng(d)
  } catch (e) {
    return NextResponse.json({ error: `Could not draw the card: ${e instanceof Error ? e.message : 'error'}` }, { status: 500 })
  }

  if (new URL(req.url).searchParams.get('preview') === '1') {
    return new Response(png, { headers: { 'content-type': 'image/png', 'cache-control': 'no-store' } })
  }

  const owner = process.env.DISCORD_OWNER_ID
  if (!owner) return NextResponse.json({ error: 'DISCORD_OWNER_ID is not set.' }, { status: 503 })
  const dm = await openDmChannel(owner)
  if (!dm.ok) return NextResponse.json({ error: dm.error }, { status: 502 })

  const headline = digestHeadline(d.counts)
  const alt = `To-dos for ${d.weekday} ${d.today}: ${headline}.`
  const sent = await postImageToDiscord(dm.id, headline, { filename: `todos-${d.today}.png`, bytes: png, alt })
  if (!sent.ok) return NextResponse.json({ error: sent.error }, { status: 502 })
  return NextResponse.json({ ok: true, headline, items: d.items.length })
}
