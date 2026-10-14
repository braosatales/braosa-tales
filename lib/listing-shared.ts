/** Types, constants and helpers for campaign listings. Safe to import from client components. */

export type Act = { name: string; levels: string; summary: string }

export type Safety = {
  rating?: string
  tools?: string[]
  content?: string[]
  lines?: string[]
  veils?: string[]
  notes?: string
}

export const SAFETY_TOOLS = [
  'Session zero',
  'Lines and veils',
  'X-card',
  'Open door',
  'Script change',
  'Stars and wishes',
  'Check-ins between sessions',
]

export const CONTENT_SUGGESTIONS = [
  'Violence',
  'Blood and gore',
  'Character death',
  'Horror',
  'Body horror',
  'Undead',
  'Spiders and insects',
  'Torture',
  'Slavery',
  'Mind control',
  'Religious themes',
  'Grief and loss',
  'Fire',
  'Drowning',
  'Tight spaces',
  'Alcohol and drugs',
]

export const RATINGS = [
  { value: 'pg', label: 'All ages (PG)' },
  { value: 'pg13', label: 'Teen (PG-13)' },
  { value: 'r', label: 'Mature (R)' },
]

export type Listing = {
  id: string
  slug: string
  title: string
  tagline: string | null
  system: string | null
  levels: string | null
  cover_url: string | null
  status: 'active' | 'paused' | 'finished'
  listed_as: string | null
  pitch: string | null
  acts: Act[]
  price: number | null
  currency: string
  session_length: string | null
  frequency: string | null
  booking_url: string | null
  seats_total: number | null
  sessions_played: number | null
  safety: Safety
  sort_order: number
  /** Players in the campaign plus email invites waiting for an account */
  seats_taken: number
  /** Recaps written, used when sessions_played isn't set */
  recaps: number
}

export type SeatState = 'open' | 'last' | 'full' | 'paused' | 'finished'

export function seatsLeft(l: Pick<Listing, 'seats_total' | 'seats_taken'>) {
  return l.seats_total == null ? null : Math.max(0, l.seats_total - l.seats_taken)
}

export function seatState(l: Listing): SeatState {
  if (l.status === 'finished') return 'finished'
  if (l.status === 'paused') return 'paused'
  const left = seatsLeft(l)
  if (left === null) return 'open'
  if (left === 0) return 'full'
  if (left === 1) return 'last'
  return 'open'
}

export function formatPrice(price: number | null, currency: string) {
  if (price == null) return null
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: price % 1 ? 2 : 0 }).format(price)
  } catch {
    return `${price} ${currency}`
  }
}

