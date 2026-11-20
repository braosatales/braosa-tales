import { NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import { sendDueDiscordMessages } from '@/lib/discord-queue'
import { syncStartPlaying } from '@/lib/startplaying-sync'
import { sendOwnerNotices } from '@/lib/vor-notices'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

function authorized(req: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const got = Buffer.from(req.headers.get('authorization') ?? '')
  const want = Buffer.from(`Bearer ${secret}`)
  return got.length === want.length && timingSafeEqual(got, want)
}

// Called every 15 minutes by Supabase (pg_cron, see supabase/discord_cron.sql).
// 1. bring sessions in line with StartPlaying  2. send what is due through Vôr  3. DM João about drafts, deadlines, failures.
// Each step runs even if an earlier one failed, so a StartPlaying hiccup never stops the reminders.
async function run(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const sync = process.env.STARTPLAYING_ICAL_URL ? await syncStartPlaying() : ({ ok: false, error: 'STARTPLAYING_ICAL_URL is not set.' } as const)
  const sent = await sendDueDiscordMessages()
  const notices = await sendOwnerNotices()
  return NextResponse.json({ sync: sync.ok ? { changes: sync.changes.length } : sync, ...sent, notices })
}

export const GET = run
export const POST = run
