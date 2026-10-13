'use client'

import { useEffect, useState } from 'react'
import { SCHEDULE } from '@/lib/sessions'

/** Offset (ms) of `timeZone` from UTC at a given instant. */
function tzOffset(instant: number, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).formatToParts(new Date(instant))
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value)
  const asUTC = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second'))
  return asUTC - instant
}

/** The instant when the wall clock in `timeZone` reads `hhmm` on the next weekday from now. */
function nextWeekdayAt(hhmm: string, timeZone: string, now = Date.now()) {
  const [h, m] = hhmm.split(':').map(Number)
  for (let add = 0; add < 8; add++) {
    const day = new Date(now + add * 86400000)
    const guess = Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), h, m)
    const instant = guess - tzOffset(guess, timeZone)
    const weekday = new Intl.DateTimeFormat('en-US', { timeZone, weekday: 'short' }).format(new Date(instant))
    if (instant > now && weekday !== 'Sat' && weekday !== 'Sun') return instant
  }
  return now
}

type Local = { start: string; end: string; zone: string; dayNote: string | null; sameZone: boolean }

function computeLocal(): Local | null {
  try {
    const viewerZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const start = nextWeekdayAt(SCHEDULE.start, SCHEDULE.timeZone)
    const end = start + 3 * 3600 * 1000
    const time = (t: number) => new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(t))
    const dayKey = (t: number, z: string) => new Intl.DateTimeFormat('en-CA', { timeZone: z, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(t))
    const diff = (Date.parse(dayKey(start, viewerZone)) - Date.parse(dayKey(start, SCHEDULE.timeZone))) / 86400000
    const zoneName =
      new Intl.DateTimeFormat(undefined, { timeZoneName: 'long' }).formatToParts(new Date(start)).find((p) => p.type === 'timeZoneName')?.value ?? viewerZone
    return {
      start: time(start),
      end: time(end),
      zone: zoneName,
      dayNote: diff < 0 ? 'the evening before' : diff > 0 ? 'the day after' : null,
      sameZone: tzOffset(start, viewerZone) === tzOffset(start, SCHEDULE.timeZone),
    }
  } catch {
    return null
  }
}

/** "Weekday mornings in Lisbon, 5:00–8:00 — that's 9:00 PM–12:00 AM for you, the evening before." */
export default function LocalTime({ className = '' }: { className?: string }) {
  const [local, setLocal] = useState<Local | null>(null)
  useEffect(() => setLocal(computeLocal()), [])

  return (
    <p className={className}>
      {SCHEDULE.label}, {SCHEDULE.start}–{SCHEDULE.end}
      {local && !local.sameZone && (
        <>
          <br />
          <span className="text-vellum">
            That’s {local.start}–{local.end} for you{local.dayNote ? `, ${local.dayNote}` : ''}
          </span>{' '}
          <span className="text-mist/80">({local.zone})</span>
        </>
      )}
    </p>
  )
}
