const STATUSES = ['scheduled', 'played', 'cancelled']
const MAX_LENGTH_MS = 12 * 3600 * 1000

/** Validate a session body. `full` = creating, so the times are required. */
export function cleanSession(b: Record<string, unknown>, full: boolean): Record<string, unknown> | { error: string } {
  const out: Record<string, unknown> = {}
  if (full || 'starts_at' in b || 'ends_at' in b) {
    const start = new Date(String(b.starts_at ?? ''))
    const end = new Date(String(b.ends_at ?? ''))
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return { error: 'Pick a start and end time.' }
    if (end <= start) return { error: 'The session has to end after it starts.' }
    if (end.getTime() - start.getTime() > MAX_LENGTH_MS) return { error: 'That session is longer than 12 hours.' }
    out.starts_at = start.toISOString()
    out.ends_at = end.toISOString()
  }
  if ('session_number' in b) {
    const n = b.session_number === '' || b.session_number == null ? null : Math.round(Number(b.session_number))
    out.session_number = n != null && Number.isFinite(n) && n > 0 && n < 10000 ? n : null
  }
  if ('title' in b) out.title = typeof b.title === 'string' ? b.title.trim().slice(0, 120) || null : null
  if ('status' in b) {
    if (!STATUSES.includes(String(b.status))) return { error: 'Unknown status.' }
    out.status = b.status
  }
  return out
}
