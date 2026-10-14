// ─────────────────────────────────────────────────────────────────────────────
// The GM's public profile and the session window shown on the homepage and /games.
// ─────────────────────────────────────────────────────────────────────────────

export const GM = {
  name: 'John Rodrigues',
  profileUrl: 'https://startplaying.games/gm/johnrodrigues',
  rating: 5.0,
  reviews: 11,
  gamesRun: 29,
  // When the numbers above were last checked on StartPlaying.
  statsCheckedOn: 'October 2026',
  platforms: ['Discord', 'Foundry VTT', 'D&D Beyond'],
  languages: ['English', 'Português', 'Español'],
}

/** Session window, in Lisbon time. Converted to each visitor's own time zone on the page. */
export const SCHEDULE = {
  timeZone: 'Europe/Lisbon',
  start: '05:00',
  end: '08:00',
  label: 'Weekday mornings in Lisbon',
}

// Campaign cards (pitch, acts, price, seats, StartPlaying link) now live in the database
// and are edited in each campaign's Manage tab. See lib/listings.ts.
