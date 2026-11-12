# CLAUDE.md — braosa-tales-website

Braosa Tales site: tabletop sessions (sessions-first), the Atelier tools, stories, the player dashboard and campaign hubs. **Current dev focus** (since 2026-10-13).

Shared rules (deploy pipeline, secrets, SQL in code blocks, asking before a push) are in `~/HQ/CLAUDE.md` and apply here.

## Stack

- Next.js **14.2.5** · React 18 · TypeScript · Tailwind. 14.2.5 has a published security vulnerability: a patch upgrade is pending.
- Supabase (`@supabase/ssr`): DB + **Auth** (Clerk was removed in Oct 2026). Project ref isn't in the dev log; check `.env.local` or ask João.
- Stripe (subscriptions)
- GitHub `braosatales/braosa-tales` (SSH) → Vercel deploys `main`

## Auth (Supabase)

- `lib/supabase/{client,server,middleware}.ts`, `lib/auth.ts` (`getAuthUser` cached + `getUserProfile`), `components/auth/{AuthProvider,AccountMenu,AuthShell,AuthForms}`.
- Pages `/sign-in`, `/sign-up`, `/forgot-password`, `/reset-password`, `/auth/callback` (handles `code` and `token_hash`). `/login` and `/signup` redirect. Email + password and Google.
- `users.id = auth.uid()`. Alpha users' data is reclaimed by confirmed email through the `on_auth_user_confirmed` trigger.
- Stripe carries `user_id` in metadata **and** `subscription_data.metadata`, so cancellations downgrade correctly.
- `isAdmin` requires a confirmed email. API routes guard themselves (e.g. `/api/forge`); don't rely on middleware alone.
- After login the user lands on `/dashboard`.

## Design

- Sessions-first. Home hero: typewriter "Every world begins with a word." + "Sit at our table."
- Fonts are **self-hosted Cinzel + Alegreya**. IM Fell is gone; no Google Fonts fetch.
- No animated quill (João found it cringe).
- Campaign data in `lib/sessions.ts` (`bookUrl` points to the StartPlaying profile until the listings are live). Atelier tools are centralised in `lib/atelier.ts`.

## Data

- Dashboard: `campaigns`, `campaign_members`, `campaign_invites`, `user_pinned_tools`; saved names + Signet presets (`?preset=`, `?tab=saved`). GM section (admin only): add a player by email (pending invite if no account) and `/join/<code>` links.
- Campaign SQL and module builders live in `supabase/` (`campaign_engine.sql`, `the8adventurers*.sql`, Eve of Giants, Wings over Phandalin, `supabase/modules/src/*.py`).

## Next up

1. Turn The 8 Adventurers hub into a generic multi-campaign site (Eve of Giants, Wings over Phandalin).
2. Restrict hub access to campaign members (today any logged-in user can open `/the8adventurers`).
3. Microsoft sign-in.

## Open items

- Clean up `legacy_clerk_*` columns and `VALIDATE` the FK (block at the end of `supabase/auth_migration_supabase.sql`), once João confirms the auth migration has run in production.
- Confirm the Clerk env vars are gone from Vercel.
- The empty `{app` folder at the repo root is a mkdir artefact and can be deleted (ask first).
- 85 modified files in the working tree (Atelier icons, newsletter/waitlist routes, Stripe/Supabase libs, Eve of Giants module sources). Not committed.

History: see `NOTES.md` and `git log`.
