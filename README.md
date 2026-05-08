# Braosa Tales — Website

> Forge the world. Tell the story. Run the game.

## Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS with brand tokens
- **Fonts**: Cinzel (display) + Lora (body) via next/font/google
- **Hosting**: Vercel (recommended)
- **Domain**: Cloudflare DNS → Vercel

---

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Logo setup

Drop your logo files into `/public`:

| File | Usage |
|------|-------|
| `logo-purple.png` | Nav, light backgrounds |
| `logo-white.png` | Dark backgrounds (Games section) |
| `logo-black.png` | Print, monochrome |
| `logo-icon.png` | Favicon, app icon (just the B mark) |

Then uncomment the `<Image>` in `components/Nav.tsx`.

---

## Deploy to Vercel (5 minutes)

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → "Add New Project" → import your repo
3. Vercel auto-detects Next.js — just click **Deploy**
4. In Cloudflare: add a **CNAME record** pointing your domain to `cname.vercel-dns.com`
5. Add your domain in Vercel → Settings → Domains

---

## Roadmap

### Phase 1 — Landing (now)
- [x] Hero, Pillars, Tools, Stories, Games, Newsletter, Footer

### Phase 2 — Auth + Dashboard
- [ ] Clerk integration for login/signup
- [ ] User dashboard (saved campaigns, purchases)

### Phase 3 — E-commerce
- [ ] Stripe for story/book purchases
- [ ] Digital download delivery

### Phase 4 — App
- [ ] Campaign tool embedded or linked at app.braosatales.com

### Phase 5 — VTT
- [ ] Own virtual tabletop (replaces Foundry dependency entirely)
