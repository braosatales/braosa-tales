# NOTES — braosa-tales-website

Dated history, split out of the old `iClaude OS/08_HQ_Dev/MEMORY.md` (archived in `08_HQ_Dev/_archive/`). Newest at the bottom. After 2026-10-13 the log stops; `git log` is the record from there.

- **2026-07-25** Found in detached HEAD with ~102 uncommitted changes; preserved.
- **2026-10-13** No longer 102 pending: HEAD = `main` = `origin/main` (`522b80f`), only detached.
- **2026-10-13** Became the current dev focus (VerumForma app paused).
- **2026-10-13** Auth migration Clerk → Supabase Auth: `@clerk/nextjs` + `svix` removed, new auth pages and callback, `users.id = auth.uid()`, alpha data reclaim trigger (tested in PGlite), `the8_players.clerk_user_id` → `user_id`, Stripe metadata fix (cancellations never downgraded before), `/api/forge` guard, `isAdmin` needs confirmed email. SQL: `supabase/auth_migration_supabase.sql`. Committed later as `40ccbfd`.
- **2026-10-13** Redesign published (sessions-first): home, `/games` → Sessions page (StartPlaying-style campaign cards, visitor's local time, FAQ, waitlist), Atelier/Stories/About/Pricing/legal/auth restyled. Fonts self-hosted Cinzel + Alegreya. Quill animation removed.
- **2026-10-13** Player dashboard `/dashboard` with campaigns, pinned Atelier tools, saved names and Signet presets, GM section. Migration `supabase/dashboard_campaigns.sql`.
- **2026-11-04** (git) Last commit `04c8726`.
- **2026-11-12** Moved out of Google Drive to `~/HQ/BRAOSA/code/braosa-tales-website`, now on `main`. 85 modified files carried over unchanged. `npm ci`, `tsc --noEmit` and `next build` clean on the Mac.
