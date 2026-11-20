// Run: node lib/ical.test.ts  (Node 24 strips the types itself)
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseIcal, parseIcalDate } from './ical.ts'

const feed = [
  'BEGIN:VCALENDAR',
  'VERSION:2.0',
  'BEGIN:VEVENT',
  'UID:abc-1@startplaying.games',
  'DTSTART:20261123T193000Z',
  'DTEND:20261123T223000Z',
  'SUMMARY:Wings over Phandalin\\, a new campaign',
  'DESCRIPTION:Join here: https://startplaying.games/adventure/00fsjv06zh',
  ' jz2yfa?x=1',
  'BEGIN:VALARM',
  'DESCRIPTION:ignore me',
  'END:VALARM',
  'END:VEVENT',
  'BEGIN:VEVENT',
  'UID:abc-2',
  'DTSTART;TZID=Europe/Lisbon:20260710T200000',
  'DTEND;TZID=Europe/Lisbon:20260710T230000',
  'URL:https://startplaying.games/adventure/003zjy06bvggk3uo',
  'STATUS:CANCELLED',
  'END:VEVENT',
  'BEGIN:VEVENT',
  'UID:no-dates',
  'END:VEVENT',
  'END:VCALENDAR',
].join('\r\n')

test('reads events, unfolds lines, skips alarms and dateless events', () => {
  const ev = parseIcal(feed)
  assert.equal(ev.length, 2)
  assert.equal(ev[0].summary, 'Wings over Phandalin, a new campaign')
  assert.match(ev[0].text, /00fsjv06zhjz2yfa/)
  assert.equal(ev[0].description.includes('ignore me'), false)
  assert.equal(ev[0].start.toISOString(), '2026-11-23T19:30:00.000Z')
  assert.equal(ev[1].status, 'CANCELLED')
})

test('TZID times become the right instant (Lisbon summer = UTC+1)', () => {
  const ev = parseIcal(feed)
  assert.equal(ev[1].start.toISOString(), '2026-07-10T19:00:00.000Z')
  assert.equal(parseIcalDate('20261220T200000', { TZID: 'Europe/Lisbon' })?.toISOString(), '2026-12-20T20:00:00.000Z')
})

test('a non-calendar body throws', () => {
  assert.throws(() => parseIcal('<html>login</html>'))
})
