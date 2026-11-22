# News PWA: Design

Date: 2026-11-21 · Status: awaiting approval

## Intent
A premium-looking news aggregator for one user (the owner), installable on iPhone via Safari "Add to Home Screen". The owner wants to pick a category (politics, sport, science, etc.) and then drill down by country and sub-topic. Reason given: a single clean place to read across sources. (Why current news habits are unsatisfying was not stated; not assumed.)

## Goals
- Category chips + country filter; tapping narrows the feed.
- Editorial look: dark by default, light mode supported, large type and imagery.
- Installable PWA (own icon, full-screen), works offline with last-fetched stories.
- Headline, image, short snippet, source, age; tap opens the original article.

## Non-goals
- Accounts, sync, comments, search, push notifications.
- Multi-user / public audience (explicitly "for now just me").
- Copying or hosting full article text.

## Anti-goals
- Feels like a generic RSS reader template.
- Needs a paid service or a server to keep running.

## Constraints
- Phone browsers cannot fetch most publishers' RSS directly (CORS), so feeds are fetched out-of-band.
- Installing on iPhone needs an HTTPS URL; localhost on the Mac is not enough.
- Content is public RSS only; link out to originals.

## Approaches considered
- **A. Static app + Cloudflare Worker proxy:** always fresh, but needs a Cloudflare account and a second moving part.
- **B. Scheduled GitHub Action writes feeds.json; static app on GitHub Pages (chosen):** free, no server, offline-friendly; data up to ~30 min stale; repo/page is public (public headlines only).
- **C. Node backend + DB:** unnecessary for one user; paid hosting.

Owner deferred the pick ("A or B"); B chosen as Claude's call, owner may override.

## Decisions (Claude's calls, not yet confirmed by owner)
- Stack: Vite + React + TypeScript, service worker for install/offline.
- Sources: ~5-8 well-known outlets per category, each tagged with country; "country" means the outlet's country, not stories about a country.
- Fetch job: GitHub Action every 30 min, normalizes feeds into one `feeds.json` (title, link, image, snippet, source, country, category, published time).
- Code lives in `~/news-app`.

## Left to the builder
Exact feed list, visual details (type scale, colors, motion), icon design, dedupe logic, sub-topic taxonomy under each category.

## Open dependency
Needs a GitHub account/repo for Pages + Actions; owner must create or authorize it. Nothing is pushed without asking.
