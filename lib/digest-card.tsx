import { ImageResponse } from 'next/og'
import type { Bucket, Digest, DigestItem, Focus } from '@/lib/vor-digest'

/**
 * Draws the daily digest as one phone-sized PNG (1080 px wide) for Vôr to DM.
 * Satori rules: flexbox only, `display: flex` on every box with more than one child, no WOFF2 fonts
 * (the default font is used). Server-only.
 *
 * Colours are for a dark surface (#1a1a19). Status colours (overdue, today) are reserved for state.
 * The five focus colours are João's identity colours, lightened for dark; every bar is also labelled
 * with its focus name and number, so identity never rests on colour alone.
 */

const W = 1080
const PAD = 48

const C = {
  bg: '#1a1a19',
  panel: '#242423',
  line: '#3a3a38',
  text: '#f3f2f0',
  text2: '#cfcecb',
  muted: '#9a9995',
  critical: '#ef6b5f',
  warning: '#f0b44c',
}
const FOCUS: Record<Focus, { name: string; color: string }> = {
  MASTER: { name: 'Master', color: '#b5b5b2' },
  VERUM: { name: 'Verum', color: '#5fbf7f' },
  BRAOSA: { name: 'Braosa', color: '#b185e0' },
  PREAMAR: { name: 'Preamar', color: '#6aa6ea' },
  FAMILY: { name: 'Family', color: '#ee8d68' },
}
const GROUPS: { bucket: Bucket; label: string; color: string }[] = [
  { bucket: 'overdue', label: 'Overdue', color: C.critical },
  { bucket: 'today', label: 'Today', color: C.warning },
  { bucket: 'week', label: 'Next 7 days', color: C.text2 },
]

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function parts(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  const dow = (new Date(Date.UTC(y!, m! - 1, d!)).getUTCDay() + 6) % 7
  return { y: y!, m: m!, d: d!, dow }
}

function dueLabel(i: DigestItem): string {
  if (i.days === null || !i.due) return ''
  if (i.days < 0) return i.days === -1 ? '1 day late' : `${-i.days} days late`
  if (i.days === 0) return 'today'
  if (i.days === 1) return 'tomorrow'
  const p = parts(i.due)
  return `${DOW[p.dow]} ${p.d}`
}

const ROW = 60
const GROUP_H = 64

export function digestSize(d: Digest) {
  const groups = GROUPS.filter((g) => d.items.some((i) => i.bucket === g.bucket))
  const privateN = d.perFocus.reduce((n, f) => n + f.private, 0)
  const listH = (groups.length ? groups.length * GROUP_H + d.items.length * ROW : 90) + (d.more || privateN ? 56 : 0)
  // header + stats + focus bars + calendar + list + footer, each with its own gap
  const height = PAD + 120 + 24 + 150 + 24 + (56 + 5 * 52 + 16) + 24 + (56 + 40 + 4 * 84 + 8) + 24 + (56 + listH) + 24 + 40 + PAD + 2 * 24
  return { width: W, height }
}

function Section({ title, right, children }: { title: string; right?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', background: C.panel, borderRadius: 28, padding: '0 32px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 56, fontSize: 24, color: C.muted, letterSpacing: 2, textTransform: 'uppercase' }}>
        <div style={{ display: 'flex' }}>{title}</div>
        {right ? <div style={{ display: 'flex', textTransform: 'none', letterSpacing: 0 }}>{right}</div> : null}
      </div>
      {children}
    </div>
  )
}

export function DigestCard({ d }: { d: Digest }) {
  const t = parts(d.today)
  const maxOpen = Math.max(1, ...d.perFocus.map((f) => f.open))
  const BAR_MAX = 520
  const stats: { label: string; n: number; color: string }[] = [
    { label: 'Overdue', n: d.counts.overdue, color: d.counts.overdue ? C.critical : C.muted },
    { label: 'Today', n: d.counts.today, color: d.counts.today ? C.warning : C.muted },
    { label: 'Next 7 days', n: d.counts.week, color: C.text },
    { label: 'Later / no date', n: d.counts.later + d.counts.undated, color: C.text2 },
  ]
  const { height } = digestSize(d)
  const groups = GROUPS.filter((g) => d.items.some((i) => i.bucket === g.bucket))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: W, height, background: C.bg, color: C.text, padding: PAD, gap: 24 }}>
      {/* header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: 120 }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: 28, color: C.muted, letterSpacing: 2, textTransform: 'uppercase' }}>Daily to-dos</div>
          <div style={{ display: 'flex', fontSize: 68, fontWeight: 700, lineHeight: 1.1 }}>{`${d.weekday} ${t.d} ${MONTHS[t.m - 1]}`}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', fontSize: 68, fontWeight: 700, lineHeight: 1.1 }}>{d.counts.open}</div>
          <div style={{ display: 'flex', fontSize: 26, color: C.muted }}>open</div>
        </div>
      </div>

      {/* stat strip */}
      <div style={{ display: 'flex', gap: 16, height: 150 }}>
        {stats.map((s) => (
          <div key={s.label} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1, background: C.panel, borderRadius: 28, padding: '0 24px' }}>
            <div style={{ display: 'flex', fontSize: 64, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.n}</div>
            <div style={{ display: 'flex', fontSize: 22, color: C.text2, marginTop: 8, whiteSpace: 'nowrap' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* open per focus */}
      <Section title="Open by focus">
        <div style={{ display: 'flex', flexDirection: 'column', height: 5 * 52 + 16 }}>
          {d.perFocus.map((f) => (
            <div key={f.focus} style={{ display: 'flex', alignItems: 'center', height: 52 }}>
              <div style={{ display: 'flex', width: 150, fontSize: 28, color: C.text }}>{FOCUS[f.focus].name}</div>
              <div style={{ display: 'flex', alignItems: 'center', width: BAR_MAX + 70 }}>
                <div style={{ display: 'flex', width: Math.max(f.open ? 8 : 0, Math.round((f.open / maxOpen) * BAR_MAX)), height: 28, background: FOCUS[f.focus].color, borderRadius: 8 }} />
                <div style={{ display: 'flex', fontSize: 28, fontWeight: 700, marginLeft: 14 }}>{f.open}</div>
              </div>
              <div style={{ display: 'flex', flex: 1, justifyContent: 'flex-end', alignItems: 'center', fontSize: 22, whiteSpace: 'nowrap' }}>
                {f.overdue ? <div style={{ display: 'flex', color: C.critical }}>{`${f.overdue} overdue`}</div> : null}
                {f.private ? <div style={{ display: 'flex', color: C.muted, marginLeft: f.overdue ? 18 : 0 }}>{`${f.overdue ? '· ' : ''}${f.private} private`}</div> : null}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* calendar */}
      <Section title="Next four weeks" right={`${MONTHS[parts(d.calendar[0]!.date).m - 1]} – ${MONTHS[parts(d.calendar[27]!.date).m - 1]}`}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', height: 40 }}>
            {DOW.map((n) => (
              <div key={n} style={{ display: 'flex', flex: 1, justifyContent: 'center', fontSize: 22, color: C.muted }}>
                {n}
              </div>
            ))}
          </div>
          {[0, 1, 2, 3].map((row) => (
            <div key={row} style={{ display: 'flex', height: 84 }}>
              {d.calendar.slice(row * 7, row * 7 + 7).map((day) => {
                const past = day.date < d.today
                const isToday = day.date === d.today
                const p = parts(day.date)
                const tint = day.overdue ? C.critical : day.count ? C.warning : C.muted
                return (
                  <div key={day.date} style={{ display: 'flex', flex: 1, padding: 3 }}>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flex: 1,
                        borderRadius: 16,
                        border: isToday ? `3px solid ${C.text}` : `3px solid transparent`,
                        background: day.count && !past ? '#2f2e2c' : 'transparent',
                        opacity: past && !day.overdue ? 0.45 : 1,
                      }}
                    >
                      <div style={{ display: 'flex', fontSize: 26, color: isToday ? C.text : C.text2, fontWeight: isToday ? 700 : 400 }}>{p.d}</div>
                      <div style={{ display: 'flex', height: 26, alignItems: 'center', fontSize: 22, fontWeight: 700, color: tint }}>{day.count ? `${day.count}` : ''}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </Section>

      {/* the list */}
      <Section title="What's up next">
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {groups.length === 0 ? (
            <div style={{ display: 'flex', height: 90, alignItems: 'center', fontSize: 30, color: C.text2 }}>Nothing due in the next 7 days.</div>
          ) : (
            groups.map((g) => (
              <div key={g.bucket} style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', height: GROUP_H, fontSize: 28, fontWeight: 700, color: g.color }}>
                  {`${g.label}  ·  ${d.items.filter((i) => i.bucket === g.bucket).length}`}
                </div>
                {d.items
                  .filter((i) => i.bucket === g.bucket)
                  .map((i, k) => (
                    <div key={`${g.bucket}${k}`} style={{ display: 'flex', alignItems: 'center', height: ROW, borderTop: `1px solid ${C.line}` }}>
                      <div style={{ display: 'flex', width: 16, height: 16, borderRadius: 8, background: FOCUS[i.focus].color, marginRight: 18 }} />
                      <div style={{ display: 'flex', flex: 1, fontSize: 30, color: C.text, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{i.title}</div>
                      <div style={{ display: 'flex', fontSize: 24, color: g.bucket === 'overdue' ? C.critical : C.muted, marginLeft: 16 }}>{dueLabel(i)}</div>
                      <div style={{ display: 'flex', width: 62, justifyContent: 'center', marginLeft: 16, fontSize: 22, fontWeight: 700, color: i.priority === 1 ? C.text : C.muted, border: `2px solid ${i.priority === 1 ? C.text2 : C.line}`, borderRadius: 10 }}>{`P${i.priority}`}</div>
                    </div>
                  ))}
              </div>
            ))
          )}
          {d.more || d.perFocus.some((f) => f.private) ? (
            <div style={{ display: 'flex', height: 56, alignItems: 'center', fontSize: 24, color: C.muted }}>
              {[d.more ? `+ ${d.more} more in the lists` : '', d.perFocus.some((f) => f.private) ? `${d.perFocus.reduce((n, f) => n + f.private, 0)} private, counted but not shown` : ''].filter(Boolean).join('  ·  ')}
            </div>
          ) : null}
        </div>
      </Section>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 40, fontSize: 24, color: C.muted }}>
        <div style={{ display: 'flex' }}>Vôr · Braosa Tales</div>
        <div style={{ display: 'flex' }}>{d.counts.doing ? `${d.counts.doing} in progress` : ''}</div>
      </div>
    </div>
  )
}

/** The card as PNG bytes. */
export async function renderDigestPng(d: Digest): Promise<ArrayBuffer> {
  const size = digestSize(d)
  const res = new ImageResponse(<DigestCard d={d} />, size)
  return res.arrayBuffer()
}
