# Session Handoff — 2026-06-03

## Branch
`main` — all PRs merged.

## PRs merged this session

| PR | Title | Key change |
|----|-------|------------|
| #17 | refactor: extract TooltipIconButton and apply to PollHeading | New `ui/tooltip-icon-button.tsx`; reset-pledge / view-results icon buttons on PollHeading; EventCard deduped |
| #18 | fix: remove protagonist hint line from poll heading | `pledged` prop and `getPollHint` removed; reveal is the sole post-pledge disclosure mechanic |
| #19 | fix: hardcode date button width | `CALENDAR_WIDTH = 220` in `date-time-picker.tsx`; removed callback-ref sync |
| #20 | fix: remove charity counter from charity field | `{n/3}` counter span removed from `CharityField` |
| #21 | fix: replace window.alert and inline alert with warning toasts | `toast.warning()` with amber inline styles; `<Toaster>` in `app/layout.tsx`; sonner CSS variables approach does not work — must pass `style` directly on each call |
| #22 | feat: onboarding panel and form field labels | `OnboardingPanel` with Honour/Love/Charity sections; `isFirstTime` from events table query; localStorage flag for returning users; visible labels on all FormPanel fields |

## Current state of the codebase

### New files
- `components/ui/tooltip-icon-button.tsx` — wraps TooltipProvider > Tooltip > Button; props: `icon`, `label`, `onClick`, `side?`, `className?`
- `components/event-form-v2/onboarding-panel.tsx` — three-section onboarding panel with labelled form mockups, Mary Poppins photo avatar, filled date/time fields, `onHowItWorks` callback
- `public/mary-poppins.png` — photo asset used as avatar in onboarding panel mockup

### Key behaviour to know
- **PollHeading** no longer shows a hint line before pledging. `pledged` prop is gone.
- **PreviewPanel** shows `OnboardingPanel` when no occasion is selected if `isFirstTime` (from DB) or `localStorage.favpoll_show_onboarding === '1'`. "How favpoll works →" button in blank state sets the flag and shows the panel.
- **All FormPanel fields** (Name, Photo, About, Context, Intro line, Topic, The reveal, Close date, Charity) now have visible labels using `FormLabel` or `<p>` (photo field, which has no FormField context).
- **Sonner styling**: Only `style: { background, color, border }` on each `toast.warning()` call works reliably. `classNames.warning` and CSS variables on `<Toaster>` are overridden by sonner's own inline styles.
- **DateTimePicker** button width is `CALENDAR_WIDTH = 220` (7 cols × 28px + 2 × 12px padding). No dynamic sync.

## Outstanding from this session

### Mary Poppins copy — verify before shipping
The onboarding panel was built this session but the copy inside it may not match the final agreed version. Verify `onboarding-panel.tsx` contains exactly:

- **Name field:** Mary Poppins
- **Context field:** Practically perfect in every way
- **About field:** She arrived by umbrella when the wind changed, with a cheery disposition, rosy cheeks and games to play. She knows what helps the medicine go down at Great Ormond Street.
- **Topic chip:** Favourite Things
- **Charity row:** Great Ormond Street Hospital
- **Reveal field:** Raindrops on roses. We don't know why. She never explained.

If the copy in the file differs, update it to match exactly. Do not paraphrase or improve — this wording was arrived at deliberately.

### "How favpoll works →" link — no destination yet
The link currently sets `localStorage.favpoll_show_onboarding = '1'` to restore the panel for returning organisers. A proper `/how-it-works` or `/about` page does not exist yet. Added to outstanding TODO below.

### Copyright — flag for legal review before public launch
The Mary Poppins example references the character name and alludes to "A spoonful of sugar" obliquely. The about copy paraphrases rather than quotes the film directly. This should be reviewed by someone with a legal eye before the product goes public. Note also that Great Ormond Street Hospital holds the rights to Peter Pan — not Mary Poppins — but the proximity of the two is worth flagging. Not urgent; do not block development on this.

## Tests
467 passing (no new tests added this session — no new pure functions or hooks).

## Standing instruction for Claude Code
> **Do not commit or push any changes. Make all changes locally so the developer can review them in VS Code before committing.**

This applies to every task, every session, without exception.

## Outstanding TODO

- **Mary Poppins copy** — verify `onboarding-panel.tsx` matches agreed copy exactly (see above)
- **"How favpoll works" page** — `OnboardingPanel` footer link has no destination; a `/how-it-works` or `/about` page needs building
- **Copyright review** — Mary Poppins example copy; review before public launch
- **`review_status` inconsistency** — `addGuestItem` and `addOrganizerItem` use `'pending'`; schema docs and `acceptContribution` reference `'pending_review'`; needs a migration to align before contributions queue is relied upon
- **`window.alert` in `PreviewPledgeCard`** — replaced with toast this session; confirm no `window.alert()` calls remain anywhere
- **Stripe Connect** — disbursement not wired; cron has placeholder; Connect application pending approval
- **Webhooks not configured** — `CLERK_WEBHOOK_SECRET` and `STRIPE_WEBHOOK_SECRET` blank in Vercel
- **Clerk production keys** — using `pk_test_` until `favpoll.com` DNS pointed at app
- **All-time rankings** — `/rankings` exists but needs data threshold logic
- **Event oversight admin page** — `/events` in admin is a shell only
- **Email templates** — currently plain text via Resend
- **Rate limiting** on API routes
- **`home-carousel.tsx`** — unused, remove or repurpose
- **`theme-provider.tsx` / `menu-button.tsx`** — duplicated across apps; extract to `packages/ui/`
- **Guest returning-visitor detection** — pledge detection only works for authenticated users server-side
- **Upload a list of items** — future TODO for infinite topic seeding
- **Localisation next steps** — `next-intl`, string extraction, US market prep
- **Mobile app** — future

## Skills to use next session
- `/favpoll-context` — always run at session start; reads `references/PROJECT.md` and `references/GLOSSARY.md`
- `/favpoll-brand` — if working on any user-facing copy
- `/favpoll-placeholders` — if working on reveal or about placeholder copy
