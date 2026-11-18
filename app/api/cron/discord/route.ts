import { NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import { sendDueDiscordMessages } from '@/lib/discord-queue'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

function authorized(req: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const got = Buffer.from(req.headers.get('authorization') ?? '')
  const want = Buffer.from(`Bearer ${secret}`)
  return got.length === want.length && timingSafeEqual(got, want)
}

// Called every 15 minutes by Supabase (pg_cron, see supabase/discord_cron.sql). Sends what is due through Vôr.
async function run(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json(await sendDueDiscordMessages())
}

export const GET = run
export const POST = run
