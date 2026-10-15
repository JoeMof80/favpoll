# Session handoff — 2026-10-14/15 (PPGF groundwork, the home hero, the podium, charcoal)

Two days in one session. The first half was commercial and legal —
Joe Metcalfe's two replies about Thrift+ and PPGF, the GoFundMe
slipstream ruling, the law-firm search, the PPGF application pack —
plus the admin register facts, the Co-op chart, the outreach email
preview and the website reader. The second half, overnight into the
15th, was the home hero rework after Gary's feedback, the compact
register pages, the podium on the live display, three manage-page
defects the founder hit while testing it, and charcoal dark mode.
#1033–#1050 ALL MERGED (main = 696fb491). #1026 stays open, parked.

## Merged to main (by arc)

1. **Admin register facts (#1033)** — `charity-register-facts.tsx`:
   register income / place / year under each charity row. NOT an alarm
   (RegisterRemovals already handles removals/unknowns).
2. **Co-op's chart, settled (#1034)** — all ten of Co-op Funeralcare's
   top-10 funeral songs in the Funeral song subset, recording by
   recording (16 members = ruling 7's ceiling); **multiple VERSIONS of a
   song are allowed** (topic rules §C, "Versions of the same work");
   Funeral FLOWER refused ("who has a favourite funeral flower?").
   Scripts applied to prod and dev: add-coop-funeral-songs,
   coop-chart-versions (`--force-seeded-rename` for dev's seeded picks),
   fix-stored-charity-casing, prune-signature-events.
3. **The retired claim, off the marketing pages (#1035)** — /about
   heading "Nothing to favpoll."; "no fee taken from the gift"; "Every
   pledge goes…" ×2 in en-GB; `landing.invariant` key added ("Whatever
   wins, every pledge goes to the charity.") — see Deferred: it is in no
   hero now.
4. **PPGF groundwork (#1036, #1039, #1040)** — references/
   ppgf-enquiry-draft-2026-07.md carries the whole record: Joe
   Metcalfe's two replies (one PPGF contract, no charity relationships
   needed, strict on wording, ~£10k/yr aim, "a few calls" then tech
   docs); PPGF's donor terms quoted (gifts to PPGF "for the benefit of a
   charity chosen by the donor"; "legal control over all donations";
   enrolled paid monthly 15–45 days, unenrolled by cheque ~90 days;
   Charity Search API over a million vetted charities — enrolment is
   latency, not reach); GoFundMe's terms ("PayPal Giving Fund receives
   Donations from Users as the NPO of record"; tips "go directly to
   GoFundMe"; disclosure on the receipt, not the donate page; the
   Donovan / Munoz class actions over pre-selected tips); Thrift+'s
   terms; **PPGF UK's solicitors are Bates Wells** (Hannah Lyons's firm —
   the conflict explains the referral to Pippa Garland, Russell Cooke);
   partner intake is a Microsoft Form (no receipt by default); phone
   0800 587 0461 ("charity"); never approach trustees. Three documents
   drafted for the application: ppgf-who-we-are-2026-10.md,
   ppgf-volume-note-2026-10.md (first row needs HIS funeral directors),
   ppgf-wording-draft-2026-10.md (proposed line: "Your pledge reaches
   **<charity>** through PayPal Giving Fund, the charity that handles
   donations for favpoll."). IoF/Bates Wells standard-form agreement
   PDF saved. disbursement-provider-seam.md bannered.
5. **The outreach email, read before it is sent (#1037)** —
   apps/admin/lib/outreach-email.ts (`inviteEmail`, `welcomeEmail` —
   hook prefers a topic-matched event, else any fundraisable event with
   general wording — `mailtoFor`), /outreach preview page (force-
   dynamic, every charity), sidebar entry, tests. PR had a stale head
   record — fixed by close/reopen.
6. **Keep only events a supporter could raise money at (#1038)** —
   lib/charity-events.ts: prompt excludes support groups / conferences
   / courses; `couldFundraiseAt()` with FUNDRAISING_SIGNAL
   (`sponsored|fundrais`) winning over the NOT_FUNDRAISING denylist
   (Tough Mudder caught by the dry run), applied before the 8-event
   slice. Measured: 68/82 topic-less events were real fundraising
   events. Accent fix in both apps' charity-commission.ts (`\p{L}`/`\p{M}`
   with `u`; "Médecins Sans Frontières" was "MéDecins Sans FrontièRes").
7. **Six copy decisions (#1041)** — "Optional tip for favpoll" label on
   step-pay; seed-fund modal "Your £X goes to the shared pot. favpoll
   takes no fee from it."; "every penny" → "every pledge" in scenes +
   exemplar bank; and the rest of the founder's list of seven.
8. **The exemplar for Palins (#1042)** — Nicola Thorne · Memorial · Song ·
   Alzheimer's Society (seed 2), unlisted on staging: favpoll
   16dbbaf7-622e-40b1-a912-c4ae4cfa4373, short code a7ef9503e24a (/p/
   redirects to the full page). references/seeded-stories-2026-10-15-
   palins.md + .original.json.
9. **THE HOME HERO (#1043, #1046, #1047)** — after Gary's cold read
   ("what is the vote poll thing about?"; "Got it" came from three
   specific scenarios in sequence). Two in-place fixes were REJECTED on
   sight the same night: scenario copy on the router cards ("doesn't go
   far enough… the cards aren't representative of a favpoll
   stylistically"), then the three register stills in the cards' row
   ("looks ridiculous"). Founder's diagnosis: the home copy was vague
   because it covered everything; the register heroes are specific —
   "why not just rotate those exactly as they are?" So
   `components/landing/rotating-register-hero.tsx`: the three register
   pages' LandingHero calls, props verbatim, stacked in ONE grid cell
   under element-scoped `data-register` (never RegisterScope — its
   `data-register-page` lifts to :root and three would fight), opacity-
   only crossfade, inactive slides inert + aria-hidden, 8s dwell that
   keeps turning (NO HOVER PAUSE — the band fills the viewport, so "pause
   on hover" meant "never rotate"; the founder saw exactly that), back/
   next = small plain chevrons at the band's sides (register glyphs with
   a name-on-hover pill were tried and dropped), manual moves restart the
   dwell, reduced motion never starts it. Each band carries px-6 so the
   rail is 48px on home vs 24 elsewhere (seen, accepted). **The header
   follows the hero** (#1046): lib/hero-register-store.ts (palette |
   null = scrolled past | undefined = no hero), published while ≥⅓ of
   the band is in view, worn on the <header> ELEMENT ONLY via
   `HeaderBar heroRegister`, `data-hero-fade` + one unlayered globals
   rule = 700ms colour fade on header, mark and Sign up. The active
   slide's nav pill is NOT highlighted (it means "you are on this
   page"). `router` mode and `invariant` prop still exist, unused.
10. **Compact register pages (#1044)** — `compact` on LandingHero (band
    height from content; phone held at the md step via
    PHONE_SCALE_COMPACT, the one documented exception to "one scale");
    `components/landing/fold.tsx` = hero + HowItWorksSteps in `grid
    min-h-[calc(100vh-3.5rem)] grid-rows-[1fr_auto]` so the pair fills
    the first screen; the how-it-works eyebrow is sr-only (two rows of
    the same uppercase style), section pt-10. The phone STAYS. Mobile
    unchanged by design.
11. **Skeleton parity (#1045)** — #911 had replaced the blurred decoy
    with skeletons on the real guest page and nowhere else. Now
    `components/standings-skeleton.tsx` (NoteSkeleton,
    StandingsSkeleton, lifted verbatim from poll-section) is used by the
    demo card (every locked phase; blur-xs gone) and the /favpolls flip
    cards (one row per favourite, capped at four). No blurred decoy
    anywhere; lib/decoys.ts is dead weight (demo loop's unused widths +
    a test fixture).
12. **THE PODIUM (#1048)** — from National Funding Scheme's DONATE
    Voting page (nationalfundingscheme.org/solutions/voting — the site
    the founder half-remembered; found by him, not by me).
    `components/room-shell/podium.tsx`: when the room WITNESSES the
    close (the finale condition), the band fills the screen — "The picks
    are in · Favourite <topic>" — and the top three PLEDGED favourites
    arrive bronze 1.0s, silver 2.8s, gold 4.8s (silver · gold · bronze
    across), amount above, name beneath; 11s hold or any click/key; then
    the sheet gets `reveal` and the note types as before. Register ink by
    height and weight (100/70/50% primary-foreground), never a metal's
    hex. Fewer pledged → shorter podium; none → no podium (straight to
    the note — the founder's first test had £0 and saw exactly that).
    Reduced motion: all at once, 7s. Founder saw it on staging: "looks
    good".
13. **Manage's messages reach the organiser (#1049)** — three defects
    found while staging the podium. (a) **Every manage validation
    sentence was hidden outside dev**: the actions threw plain Errors and
    the rows showed e.message; Next strips a thrown server-action message
    in production ("An error occurred in the Server Components render…
    omitted in production builds"). Now lib/action-result.ts —
    `asResult()` at the export boundary, `unwrap()` on the client throws
    a real Error so the rows' catch logic is unchanged. Converted:
    manage/actions.ts (4), edit/actions.ts updateClosesAt, callers in
    manage-client, charity-rows, favourites-row. (b) An appeal member's
    Close date row is read-only, "Set by <appeal>." (the charity row's
    lock) — it offered a picker and threw. (c) `updateClosesAt` requires
    a FUTURE close whichever way it moves (the check sat inside the
    extension branch, so shortening to a time already gone closed the
    favpoll on the spot); `EditableDateRow` waits 1.2s and saves ONCE per
    edit (date-then-time had been two saves, each spending an extension
    — "Maximum extensions reached"). His staging favpoll 285e88ef… was
    restored by hand (closes_at +7d; closed_at was still null).
14. **CHARCOAL DARK MODE (#1050)** — founder: "the admin site's dark
    mode looks great. Can we use that for the main site? don't get rid
    of the current dark theme, just replace it in the site (obviously
    with the theme accent)." The generator holds two dark ramps,
    `DARK_STYLE = "charcoal" | "brand"`: charcoal = the admin's numbers
    per register hue (page oklch(0.15 0.02 h), card 0.2, ink 0.97, muted
    0.25/0.7, borders white/12%) with `--primary` a LIGHT TINT of the hue
    (0.75 0.1) — in dark the hero band is a pale register band on a dark
    page; brand = the old "brand colour IS the page, primary near-white"
    ramp, kept intact. Every dark contrast pair passes on all four
    palettes; the two light-mode debts are as before. "I think that's
    better." Merged.

## Decisions & doctrine established

- **"Get in the GoFundMe slipstream"** (founder, 2026-10-14): as a
  matter of course use GoFundMe's practices as the guide for our own,
  subject to a PPGF partnership. "I'm fine ditching Stripe if we need
  to." Position: "I don't want to meet any charities to be able to
  fundraise for them. I want to do it because it is useful, not because
  it is necessary." The one open legal question is who the Charities Act
  1992 s.59 counterparty is (PPGF vs each charity) — for Pippa to answer
  from PPGF's partner agreement, NOT before PPGF hands it over. The DMCC
  pre-selected-tip question is also for Pippa.
- **Don't spend other people's reputation** (memory feedback_dont_spend_
  others_reputation.md): asking Joe Metcalfe to vouch is a big ask, not a
  small one; cite the public record (Thrift+'s published terms) instead.
- **Versions of the same work are allowed** in Song-type topics (topic
  rules §C). **Funeral flower refused.**
- **The home hero is the register heroes, rotated.** Don't re-propose
  cards or a picture-of-the-mechanic on home; two died the same night.
- **Server-action messages are results, never throws** (memory project_
  server_action_results.md). Other action modules still throw (wizard
  updateFavpoll, pledge flow) — follow-up if wanted.
- **A past close date is a close; a date picker must never do that.**
- **Dark = charcoal with the register as a light tint.** `register-ink`
  in dark now draws charcoal ink on a tint card — still legible, only
  consumer is the retired router cards.
- **Enacted favpolls and Gift Aid**: National Funding Scheme's own FAQ
  says a vote that buys "a say in the result" usually doesn't qualify.
  Non-enacted favpolls are clean; Marcus's hat is "a say in the result".
  One for Pippa's list.
- **Marcus stays** as the fundraiser exemplar (he already IS ruling D's
  enacted shape; subsets don't reach sponsored events). The real gap:
  the exemplar bank has ZERO cause-register stories (20/12/9 across the
  other registers) — seed some for /fundraiser's shelf if effort goes
  to that register.

## State of the world

- main = 696fb491; CI green; prod deploys from main automatically.
- Prod Supabase kgwkpibkoecvwcundqtm; dev == staging eotqyintgusvzidymumb
  (STAGING_REF in seed-stories.ts). Exemplars (fiction: true,
  created_by 'user_seed_story') are dev/staging only.
- Branch previews: `favpoll-web-git-<branch>-favpoll.vercel.app`, Vercel
  login required; the founder loaded one before the build finished and
  thought the change was missing — check the check, not the page.
- Memory on the machine: ~0.4 GB free at session end. Do NOT start the
  Turbopack dev server when memory is low; previews are the review
  surface. Background CI waiters have been killed for memory before;
  `gh pr checks N --watch --interval 30` in ONE background process is
  the pattern (never tight gh/vercel loops — Keychain storm).
- PR #1026 ("The field that makes a charity payable") open, parked —
  likely closes under PPGF.

## Deferred / founder-side

- **Palins email** (Max Kelly, via email@gavinpalinfs.co.uk) scheduled
  for 10:00 on the 15th; Tresidders by walk-in. The exemplar for Palins
  is on staging (#1042) — share the /p/a7ef9503e24a link if the reply
  warrants it.
- **PPGF chase Monday 20 October** on thread C826-L003-TPPGF001-S999-
  W000000; if silent, phone 0800 587 0461; LinkedIn last (partnerships
  title, never trustees). Do not resubmit the form.
- Volume note's first row needs his funeral directors named.
- Pippa not to be engaged until PPGF's partner agreement + wording are
  in hand. Add to her list: s.59 counterparty; DMCC pre-selected tip;
  Gift Aid on enacted favpolls.
- **The invariant** ("every pledge goes to the charity") is in NO hero
  now — Gary's allocative misread is unaddressed above the fold; the
  founder's call was to test with a cold reader before adding it back.
- 8s dwell may be short if he finds himself chasing a slide.
- The retired router cards: candidate home /about (explains the
  registers in prose, has no artefact).
- lib/decoys.ts to clear out; component comments saying "in dark, where
  --primary is near-white" (header.tsx, register-link.tsx, hero.tsx,
  tv-frame.tsx) are historical — tidy when touching them.
- The live display's QR/gutters on charcoal were not specifically
  checked (the --qr floor was tuned against the brand-purple field).
- Ideas from NFS not taken yet: text-to-give as a channel (premium SMS;
  an integration, not a feature); their problem statement ("slow to
  count, easy to doubt, and completely separate from the fundraising")
  is the funeral-director pitch in other clothes. NFS itself is a
  registered-charity intermediary (1149800) with Gift Aid handled — a
  name to ask if PPGF goes quiet.

## Gotchas earned

- **A thrown Error's message never reaches the client from a server
  action in production.** Read the real sentence with the Vercel MCP
  `get_runtime_logs` (project favpoll-web, team favpoll, level error) —
  it carries the message and the branch.
- **The date-time picker reports date and time as two onChange calls.**
  Any row that saves "as soon as it changes" must debounce or it writes
  the half-edited value.
- **`gh pr edit` can fail on the Projects-classic GraphQL deprecation**;
  `gh api -X PATCH repos/…/pulls/N -F body=@file` works.
- **Two PRs that both append a `describe` to the same test file conflict
  on merge** — keep both blocks; the shared closing `})` lines sit after
  the marker.
- **`vi.restoreAllMocks` doesn't reset a `window.matchMedia` defined via
  defineProperty** — stub it per describe.
- **jsdom has no `inert` property**; assert the attribute.
- **Prettier re-wraps long `getByRole` lines**, so a later exact-string
  patch of a test misses — patch by regex or re-read first.
- **Three stacked `data-register-page` scopes fight for the header and
  footer**; element-scoped `data-register` is the one to stack.
- **"pause on hover" on a full-viewport hero = never rotate.**
