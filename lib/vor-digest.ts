/**
 * The daily to-do digest Vôr DMs to João. The Mac's bridge (hq-phone, bridge/digest.ts) builds the
 * payload and decides everything that needs its clock or a private line; this side only checks the
 * shape and draws it (lib/digest-card.tsx). Keep the types in step with bridge/digest.ts.
 */

export const FOCI = ['MASTER', 'VERUM', 'BRAOSA', 'PREAMAR', 'FAMILY'] as const
export type Focus = (typeof FOCI)[number]
export type Bucket = 'overdue' | 'today' | 'week' | 'later' | 'undated'

export type DigestItem = { focus: Focus; title: string; priority: 1 | 2 | 3; status: string; due: string | null; days: number | null; bucket: Bucket }
export type DigestDay = { date: string; count: number; overdue: number }
export type Digest = {
  today: string
  weekday: string
  counts: Record<Bucket, number> & { open: number; doing: number; done7: number }
  perFocus: { focus: Focus; open: number; overdue: number; today: number; private: number }[]
  items: DigestItem[]
  more: number
  calendar: DigestDay[]
}

const isInt = (v: unknown, max = 100000): v is number => typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= max
const isDate = (v: unknown): v is string => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)
const isFocus = (v: unknown): v is Focus => typeof v === 'string' && (FOCI as readonly string[]).includes(v)
const BUCKETS: Bucket[] = ['overdue', 'today', 'week', 'later', 'undated']

/** Checks a payload from the bridge; returns the clean digest or the reason it was refused. */
export function parseDigest(raw: unknown): { ok: true; digest: Digest } | { ok: false; error: string } {
  const bad = (error: string) => ({ ok: false as const, error })
  const d = raw as Partial<Digest> | null
  if (!d || typeof d !== 'object') return bad('digest missing')
  if (!isDate(d.today)) return bad('today must be YYYY-MM-DD')
  if (typeof d.weekday !== 'string' || d.weekday.length > 12) return bad('weekday')
  const c = d.counts as Digest['counts'] | undefined
  if (!c || !BUCKETS.every((b) => isInt(c[b])) || !isInt(c.open) || !isInt(c.doing) || !isInt(c.done7 ?? 0)) return bad('counts')
  if (!Array.isArray(d.perFocus) || d.perFocus.length !== FOCI.length) return bad('perFocus')
  for (const f of d.perFocus) if (!isFocus(f?.focus) || !isInt(f.open) || !isInt(f.overdue) || !isInt(f.today) || !isInt(f.private)) return bad('perFocus row')
  if (!Array.isArray(d.items) || d.items.length > 40) return bad('items')
  for (const i of d.items) {
    if (!isFocus(i?.focus) || typeof i.title !== 'string' || i.title.length > 120) return bad('item')
    if (![1, 2, 3].includes(i.priority) || !BUCKETS.includes(i.bucket)) return bad('item priority/bucket')
    if (i.due !== null && !isDate(i.due)) return bad('item due')
    if (i.days !== null && !(Number.isInteger(i.days) && Math.abs(i.days) < 100000)) return bad('item days')
  }
  if (!isInt(d.more)) return bad('more')
  if (!Array.isArray(d.calendar) || d.calendar.length !== 28) return bad('calendar')
  for (const x of d.calendar) if (!isDate(x?.date) || !isInt(x.count) || !isInt(x.overdue)) return bad('calendar day')
  return { ok: true, digest: { ...(d as Digest), counts: { ...c, done7: c.done7 ?? 0 } } }
}

/** One line for the notification text: counts only, never a title (it shows on the lock screen). */
export function digestHeadline(c: Digest['counts']): string {
  const bits: string[] = []
  if (c.overdue) bits.push(`${c.overdue} overdue`)
  if (c.today) bits.push(`${c.today} today`)
  if (c.week) bits.push(`${c.week} this week`)
  return bits.length ? bits.join(' · ') : `${c.open} open, nothing due this week`
}
