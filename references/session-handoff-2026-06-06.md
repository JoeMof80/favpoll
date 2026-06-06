# Session handoff — favpoll
Date: 6 June 2026

---

## What was completed this session

### 1. `/landing-v2` alternate landing page (PR #35, merged)

New self-contained route and component folder. Nothing in the existing app was changed.

**Route:** `apps/web/app/landing-v2/page.tsx`

**Three sections:**
1. **Hero** — two-column layout (pitch left, animated Venn right). Occasion eyebrow cycles Memorial/Birthday/Retirement/Wedding/Engagement/Graduation every 2.8 s with framer-motion fade. Brand-locked headline/subheader/CTA verbatim.
2. **How it works** — six-step vertical timeline across three phases (Create / Share / Reveal). Each step has a title, description, and a mini preview card (using real `FavpollHeader`, `PollTitle` components where applicable). All example copy uses the Belinda Hartley · Memorial · Colour · Marie Curie thread.
3. **CTA** — "Create an event" → `/events/new`; fee line verbatim.

**New files in `components/landing-v2/`:**
- `example.ts` — `EXAMPLE` data object + `OCCASIONS` array
- `occasion-eyebrow.tsx` — client component, framer-motion cycling
- `honour-love-charity-venn.tsx` — animated client component; three rotating rings with gradient fade; FavpollMarkGlyph at centroid; `animate` + `speed` props; respects `prefers-reduced-motion`
- `favpoll-mark.tsx` — richer mark with native design-source coordinates (viewBox `298 282 120 109`); exports `FavpollMarkGlyph` (`<g>` of paths), `FAVPOLL_MARK_PATHS`, and default `FavpollMark` SVG component
- `how-it-works.tsx` — six-step timeline, server component
- `honour-love-charity-venn.stories.tsx` — Default + Narrow stories

**Root-level stubs also committed (PR #37):**
- `apps/web/components/favpoll-mark.tsx` — same richer mark, root-level copy
- `apps/web/components/honour-love-charity-venn.tsx` — animated Venn, root-level copy (imports `FavpollMarkGlyph` from `./favpoll-mark`)

---

### 2. UI tweaks (PR #36, merged)

| File | Change |
|---|---|
| `apps/web/app/events/page.tsx` | `bg-primary/5` → `bg-muted` |
| `apps/web/app/page.tsx` | add `bg-primary/5` to live-events section |
| `apps/web/components/pledge-panel.tsx` | "Select Yours" → "Select favourites" |

---

### 3. Tool/skill files committed (PR #37, merged)

- `.claude/commands/favpoll-topic-rules.md` — skill file: quality standard for favpoll topics
- `.claude/commands/favpoll-topic-rules-additions.md` — drop-in additions to the topic rules skill
- `scripts/lint-topics.mjs` — build-time guard: validates every occasion reveal names a valid item from that topic's item list
- `references/session-handoff-2026-06-05.md` — previous session handoff

---

## Current state

| Item | Status |
|---|---|
| TypeScript | Clean |
| Prettier | Clean |
| Tests | 505 passing |
| `/landing-v2` | Merged PR #35 |
| UI tweaks | Merged PR #36 |
| Tool/skill files | Merged PR #37 |
| `references/PROJECT.md` | Updated (test count, routes, component list) |

---

## Key gotchas for next session

- **`landing-v2/favpoll-mark.tsx` vs `components/favpoll-mark.tsx`** — the landing-v2 folder has its own `favpoll-mark.tsx` using native design-source coordinates (viewBox `298 282 120 109`). The root `components/favpoll-mark.tsx` is an identical copy. The original `components/favpoll-logo.tsx` wraps a different version of the mark (scaled 24×22, separate SVG). These three coexist — do not merge without intent.

- **`honour-love-charity-venn.tsx` exists in two places** — `components/landing-v2/` (the one the page uses) and `components/` (root-level stub). The root copy imports `FavpollMarkGlyph` from `./favpoll-mark` (the root-level one). Neither is used in the main app yet.

- **`landing-v2/page.tsx` imports Venn as default export** — `import HonourLoveCharityVenn from "@/components/landing-v2/honour-love-charity-venn"`. The component is `"use client"` with animation.

- **Prettier must run from `apps/web`** — the CI format check runs `pnpm --filter @favpoll/web exec prettier --check .`. Files formatted from the repo root strip TS generics. Two consecutive PRs this session failed format check because of this. The sticking files were the new `favpoll-mark.tsx` files (semicolons from `import * as React`).

- **Branch protection** — direct push to `main` is blocked. Every push requires a branch + PR + 2 status checks (Format + Test/Typecheck). Budget 2–3 minutes for CI per PR.

---

## Outstanding TODOs (carried forward)

- **Stripe Connect** — disbursement not wired; Connect application pending approval
- **Webhooks not configured** — `CLERK_WEBHOOK_SECRET` and `STRIPE_WEBHOOK_SECRET` blank in Vercel
- **Clerk production keys** — `pk_test_` until `favpoll.com` DNS points at the app
- **All-time rankings** — `/rankings` exists but needs data threshold logic
- **Event oversight admin page** — `/events` in admin app is a shell only
- **Email templates** — currently plain text via Resend
- **Rate limiting** on API routes
- **Guest returning-visitor detection** — pledge detection only works for authenticated users
- **Localisation next steps** — `next-intl`, string extraction, US market prep
- **Mobile app** — future

---

## Skills to load next session

- `/favpoll-context` — always load at session start for schema, conventions, ubiquitous language
- `/favpoll-brand` — if working on landing page copy or new UI components
- `/favpoll-topic-rules` — if creating or auditing topics
