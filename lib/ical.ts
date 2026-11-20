/**
 * Minimal iCalendar (RFC 5545) reader for the StartPlaying GM feed.
 * No imports, so it can be tested on its own with `node lib/ical.test.ts`.
 */

export type IcalEvent = {
  uid: string
  summary: string
  description: string
  url: string
  status: string // CONFIRMED / TENTATIVE / CANCELLED, or '' when absent
  start: Date
  end: Date
  /** Every property value joined, for finding the listing id wherever StartPlaying put the link. */
  text: string
}

/** Undo line folding (a line starting with a space or tab continues the previous one). */
function unfold(src: string) {
  return src.replace(/\r\n/g, '\n').replace(/\n[ \t]/g, '')
}

function unescape(v: string) {
  return v.replace(/\\n/gi, '\n').replace(/\\([,;\\])/g, '$1')
}

/** Offset in minutes of `timeZone` at the given UTC instant (e.g. Europe/Lisbon in summer = 60). */
function tzOffsetMinutes(timeZone: string, at: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).formatToParts(at)
  const n = (t: string) => Number(parts.find((p) => p.type === t)?.value)
  const asUtc = Date.UTC(n('year'), n('month') - 1, n('day'), n('hour'), n('minute'), n('second'))
  return Math.round((asUtc - at.getTime()) / 60000)
}

/** DTSTART/DTEND value → Date. Handles UTC (…Z), TZID=… local times, floating times (as UTC) and all-day dates. */
export function parseIcalDate(value: string, params: Record<string, string>): Date | null {
  const m = value.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?(Z)?)?$/)
  if (!m) return null
  const [, y, mo, d, h = '00', mi = '00', s = '00', z] = m
  const wall = Date.UTC(+y, +mo - 1, +d, +h, +mi, +s)
  if (z || !params.TZID) return new Date(wall)
  try {
    // Two passes, so a time right next to a DST change still lands on the right offset.
    let guess = wall - tzOffsetMinutes(params.TZID, new Date(wall)) * 60000
    guess = wall - tzOffsetMinutes(params.TZID, new Date(guess)) * 60000
    return new Date(guess)
  } catch {
    return new Date(wall) // unknown zone: better roughly right than dropped
  }
}

/** Parse a feed. Throws if it isn't a calendar at all, so a broken fetch never looks like "no sessions". */
export function parseIcal(src: string): IcalEvent[] {
  const text = unfold(src)
  if (!/BEGIN:VCALENDAR/.test(text)) throw new Error('Not an iCalendar feed.')
  const events: IcalEvent[] = []
  let cur: Record<string, { value: string; params: Record<string, string> }> | null = null
  let all: string[] = []
  let depth = 0 // nested components (VALARM) inside a VEVENT
  for (const line of text.split('\n')) {
    if (line === 'BEGIN:VEVENT') { cur = {}; all = []; depth = 0; continue }
    if (!cur) continue
    if (line.startsWith('BEGIN:')) { depth++; continue }
    if (line.startsWith('END:') && line !== 'END:VEVENT') { depth--; continue }
    if (line === 'END:VEVENT') {
      const start = cur.DTSTART && parseIcalDate(cur.DTSTART.value, cur.DTSTART.params)
      let end = cur.DTEND && parseIcalDate(cur.DTEND.value, cur.DTEND.params)
      if (start && !end) end = new Date(start.getTime() + 4 * 3600 * 1000)
      if (cur.UID && start && end) {
        const v = (k: string) => (cur![k] ? unescape(cur![k].value) : '')
        events.push({
          uid: cur.UID.value,
          summary: v('SUMMARY'),
          description: v('DESCRIPTION'),
          url: v('URL'),
          status: v('STATUS').toUpperCase(),
          start,
          end: end > start ? end : new Date(start.getTime() + 4 * 3600 * 1000),
          text: all.join('\n'),
        })
      }
      cur = null
      continue
    }
    if (depth > 0) continue
    const colon = line.indexOf(':')
    if (colon < 0) continue
    const [name, ...rawParams] = line.slice(0, colon).split(';')
    const params: Record<string, string> = {}
    for (const p of rawParams) {
      const eq = p.indexOf('=')
      if (eq > 0) params[p.slice(0, eq).toUpperCase()] = p.slice(eq + 1).replace(/^"|"$/g, '')
    }
    const value = line.slice(colon + 1)
    cur[name.toUpperCase()] = { value, params }
    all.push(unescape(value))
  }
  return events
}
