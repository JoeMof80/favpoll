"use client"

// Landing hero: purple band with monogram shimmer texture (eyebrow retired
// carrying the breadth (any occasion, or none), one fixed universal headline
// naming the mechanic the demo enacts, a kind nav to jump the demo, and the
// live animated demo card in a browser-style frame (traffic lights signal that
// it's a demo). The card renders at full logical size and is optically scaled
// to 80%. Register/occasion signals live in the kind nav + the demo content —
// nothing in the pitch column cycles.
import Link from "next/link"
import { useEffect, useMemo, useState, useSyncExternalStore } from "react"
import { ArrowDown } from "lucide-react"
import { DemoCard } from "@/components/hero-demo-panel/demo-card"
import { DemoFrame } from "@/components/hero-demo-panel/demo-frame"
import {
  PhoneFrame,
  PHONE_SCALE,
  PHONE_SCALE_COMPACT,
  PHONE_SCALED_BOX,
  PHONE_SCALED_BOX_COMPACT,
} from "@/components/hero-demo-panel/phone-frame"
import { NAV_TABS, SCENES } from "@/components/hero-demo-panel/scenes"
import type {
  HeroScene,
  Phase,
  SceneKind,
} from "@/components/hero-demo-panel/scenes"
import { Button } from "@/components/ui/button"
import { withQuietTail } from "@/components/landing/quiet-tail"
import { cn } from "@/lib/utils"
import { formatCurrency, MARKET_DEFAULTS, t } from "@/lib/i18n"
import { useDemoLoop, beatForPhase } from "./use-demo-loop"
import { CountUp } from "./count-up"
import { HeroTexture } from "./hero-texture"

const BEATS = ["Pick", "Pledge", "Reveal"] as const

// NO ICONS BESIDE THE BEATS (founder, 2026-08-17, after trying them). The
// headline was never the confusing part of this hero — pick, give and see are
// already plain — so glyphs beside them decorated three clear verbs while the
// actual gap (nothing says what a favpoll IS before the button asks you to
// create one) went untouched. They also added a fourth object to a band that
// already carried three router cards, and broke the h1's clean left edge,
// which is the whole mechanism of a poster.
//
// This was the second attempt to answer that gap with pictures — HeroBeats,
// three stills under the headline, failed the same way earlier the same day.
// Two failures with the same shape: the hero can show what HAPPENS as many
// ways as it likes, and no picture of a mechanic says what the thing is.
// What did work was verbal and structural — the "See how it works" secondary
// CTA, which offers the explanation rather than hoping visitors scroll.

type Props = {
  liveCount?: number
  totalLive?: number
  /** Register pages: the stats row is home-flavoured — hide it. */
  hideStats?: boolean
  /** Optional eyebrow above the headline (home has none). */
  eyebrow?: string
  /** Register landing v2 (2026-08-03): play ONLY this kind's scenes on a
   *  loop and hide the kind nav — the page IS the kind. Home omits it. */
  sceneKind?: SceneKind
  /**
   * Play exactly THIS scene, rather than every scene of a kind.
   *
   * Needed the moment a register gained a second scene (2026-08-28):
   * /celebrations has both Poppy's birthday and Alex & Jordan's wedding, and
   * `sceneKind` filters to BOTH — so useDemoLoop would cycle them, which a
   * page asking for `still` plainly does not want. One scene in, nothing to
   * cycle to.
   */
  scene?: HeroScene
  /** Copy overrides — literal strings (t() stays statically typed at the
   *  call site). Defaults = the home landing's keys. */
  headline?: string
  subheader?: string
  /** THE ONE INVARIANT (Gary, 2026-09-23). The cold reader's third wrong
   *  category was participatory budgeting — pick X, give £100, the plain
   *  inference is that £100 funds X — and "Give what it's worth" invites it.
   *  The founder's own six-word correction, "all the money goes to the
   *  hospice", is what the header lacked. Its own line, so the subheader
   *  (pinned by tests and reused in an email) is untouched. */
  invariant?: string
  ctaLabel?: string
  /** Primary CTA destination — a register page passes the wizard URL
   *  with its ?category= preselect so the Event step arrives answered
   *  (founder, 2026-09-04: the label 'Create a celebration favpoll'
   *  must deliver exactly that). */
  ctaHref?: string
  /** Label for the second, quieter path — a register page passes its own
   *  string. Without one the hero shows a single CTA. */
  ctaSecondaryLabel?: string
  /** Band override — the default is the page palette's primary. */
  bandClassName?: string
  /**
   * Show the scene as a STILL PHONE instead of the looping browser demo.
   *
   * /memorials is a forwarding artefact — a celebrant sends it to a family
   * — and a looping demo is the wrong first note for it, as well as being
   * the homepage's demo told a second time (founder, 2026-08-26). A still
   * at phase "reveal" says the same thing once, in the state a guest is
   * left holding, and the reveal is what a memorial favpoll is FOR.
   *
   * PhoneFrame at the shared PHONE_SCALE, so this handset and the one in
   * the homepage's guest arc are the same size.
   */
  still?: boolean
  /**
   * COMPACT (founder, 2026-10-15): the band takes its height from its
   * content instead of the viewport, and the still phone holds the md
   * scale on every breakpoint, so how-it-works' heading sits in the fold
   * on a laptop. For the REGISTER PAGES, now that home carries the
   * full-screen poster (the rotating register hero): /memorial is a
   * document a celebrant forwards, and on it "what do I do here" beats the
   * poster. Only meaningful with `still`.
   */
  compact?: boolean
  /** A still inside a carousel: true while it is the live slide, false
   *  while it waits its turn. Plays the before/after beat on arrival (see
   *  useStillBeat). Leave undefined for a still that stands alone. */
  stillActive?: boolean
  /** Bumped by the carousel on every manual move. A change replays the beat
   *  from the top even when `stillActive` did not move — the lit dot. */
  stillEpoch?: number
  /** Below md, render the CTA pair after the phone rather than before it
   *  (founder, 2026-10-15, the home carousel): text, handset, buttons. */
  ctaAfterMedia?: boolean
  /** Extra pitch-column content, under the subheader. */
  children?: React.ReactNode
}

// THE REGISTER ROUTER CARDS WERE DELETED HERE (2026-10-21). With them went
// the `router` prop, ROUTER_CARDS, and the six derived constants
// (MEMORIAL/WEDDING/FUNDRAISER _SCENE, _RESULTS and _TOPIC) that nothing
// else used.
//
// They were unreachable, not merely unused: home stopped passing `router`
// on 2026-10-15, when the band became the three register heroes rotated
// (#1043), and no other page ever passed it — so ~210 lines of card render
// and ~100 of scene derivation sat dead behind a prop defaulting to false.
// check-dead-messages.mjs could not see it, because home.router.*.body were
// still REFERENCED from this file; those three strings are retired from
// messages/en-GB.json with this change. The three .title strings STAY —
// rotating-register-hero.tsx uses them as its slide labels.
//
// Recover the cards from
// `git show d446dbf6:apps/web/components/landing/hero.tsx`.

// THE STILL'S BEAT (founder, 2026-10-18: "add animation to the homepage
// hero vignettes, to express the states before and after pledges"). A still
// phone froze at "note" — bars up, note typed — so the home hero showed what
// a guest gets and never that they give to get it. When a still is the LIVE
// slide of the carousel it plays FIVE STEPS (founder, same night, after a
// two-step and a three-step cut: "Locked, Pick favourite, pledge amount,
// confirmation, disclosure"): the lock card with the About typing; the
// picker opening and a favourite chosen; the amount step and a preset
// chosen; the sheet confirmed — tick, "Pledge confirmed", "£10 for Marie
// Curie" — and closing; then the lock gone, the bars climbing from zero
// and the note typing. Existing demo-card phases at roughly the demo
// loop's own pacing (use-demo-loop.ts), then slowed: ~19.8s with the
// note typed, inside the carousel's DWELL_MS, which grew to fit. It
// replays each time the slide comes round (the phase resets while the
// slide is inactive and invisible). Reduced motion, or a still outside a
// carousel (the register pages), is the frozen "note" as before.
const STILL_BEAT: { phase: Phase; at: number }[] = [
  // Holds lengthened 2026-10-18 ("give the visitor more time to read"):
  // every screen stands for 1.2–2s after its motion settles.
  //
  // STEP 1 IS THE OUTLIER, AND IT IS A READING BEAT (founder, 2026-10-21:
  // "there isn't enough time to read the lock card instructions"). It was
  // 2650ms, and the About types over 2200 of them, so the card had ~0.45s
  // of undivided attention to deliver 34 words — a CTA, three numbered
  // steps and the shared-pot line — which is eight to ten seconds of
  // reading. Every other step here is WATCHING (a chip highlights, a preset
  // fills, a tick appears) and 1.2–2s is right for those; this one is the
  // only place the hero asks anyone to read, and it was the shortest.
  //
  // So step 1 holds to 7000 and everything after shifts by the same 4350.
  // That leaves ~4.8s of still, fully-typed lock card. The cost is the
  // whole beat, 15.4s → 19.75s, and DWELL_MS grew with it; the founder
  // weighed a longer cycle and accepted it, because the dots at the band's
  // foot now carry "there are three of these" and the rotation no longer
  // has to. Trimming the 10-18 holds to pay for it was offered and not
  // taken — they are his, and they were not the problem.
  { phase: "arriving", at: 0 }, // 1. locked: the lock card, the About typing
  { phase: "triggering", at: 7000 }, //    the lock card is pressed
  { phase: "picking", at: 7350 }, // 2. the picker opens
  { phase: "selected", at: 9150 }, //    a favourite is chosen
  { phase: "pledge-panel", at: 10950 }, // 3. the amount step
  { phase: "amount-picked", at: 12150 }, //    a preset chosen, £ updates
  //
  // THE NOTE MOVED ONTO THE SHEET (founder, 2026-10-22: "make the real page
  // lead and the demo follow"). The product reads the note out on the sheet
  // and reveals the page afterwards; the demo had it typing on the page
  // beneath, beside climbing bars, which is the sequence the real page was
  // deliberately changed away from. So "confirmed" now holds 3300ms — the
  // note types over 1900 of them and the record rows land for the last 1400
  // — and the page beneath is revealed with the note already in place.
  //
  // THE CYCLE DOES NOT GROW AGAIN. The 2800ms that "results" held for the
  // note's typing pays for the sheet's longer hold; clearing and results
  // each shift by 1500 and the beat still ends at 19750, so DWELL_MS is
  // untouched. Lengthening to give the note its real 6.4s was the other
  // option and was not taken: this is a watched loop, not someone's own
  // pledge, and 19.75s was already a considered ceiling.
  { phase: "confirmed", at: 14150 }, // 4. the sheet: confirmation, the note
  //                                       types, then the record
  //
  // A SECOND TO READ IT (founder, 2026-10-24: "the demo should pause after it
  // is written for a second to read it"). `confirmed` held 3300ms — 1900 of
  // typing and 1400 standing — and the note is the one thing on the page
  // anyone is asked to READ rather than watch. It holds 4300ms now, so the
  // finished note stands for 2.4s, and the monogram's single shimmer fires
  // at the 1.9s mark as punctuation for it landing.
  //
  // This one DOES cost the cycle a second: 19750 → 20750, and DWELL_MS with
  // it. The tail was already compressed to pay for the last change and there
  // is nothing left in it to take.
  { phase: "clearing", at: 18450 }, // 5. the sheet slides down onto the live
  //                                       page, the note already on it
  { phase: "results", at: 19450 }, //    the bars climb, alone
  { phase: "note", at: 20750 }, //    everything stands
]
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)"
function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION_QUERY)
  mq.addEventListener("change", onChange)
  return () => mq.removeEventListener("change", onChange)
}
// `epoch` is REPLAY (founder, 2026-10-21). `active` alone cannot express
// "show me that one again": pressing the carousel's lit dot leaves the live
// slide live, so nothing in these deps moved and the beat ran on — while the
// dwell restarted, so the slide stood on its finished frame for a second full
// dwell (measured: the turn came at 43.3s instead of 23.5). Any manual move
// bumps the epoch, so the same-slide case restarts here like every other.
function useStillBeat(
  active: boolean | undefined,
  scene: HeroScene,
  epoch?: number
) {
  const reduced = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false
  )
  const plays = active !== undefined && !reduced
  const [phase, setPhase] = useState<Phase>(plays ? "arriving" : "note")
  useEffect(() => {
    if (!plays) {
      setPhase("note")
      return
    }
    if (!active) {
      setPhase("arriving")
      return
    }
    setPhase("arriving")
    const timers = STILL_BEAT.filter((step) => step.at > 0).map((step) =>
      window.setTimeout(() => setPhase(step.phase), step.at)
    )
    return () => timers.forEach((t) => window.clearTimeout(t))
  }, [plays, active, epoch])
  const final = scene.results.map((r) => r.widthPercent)
  // Zero until "results", so the bars climb from nothing at disclosure.
  const climbed = phase === "results" || phase === "note"
  return {
    phase,
    barWidths: climbed ? final : final.map(() => 0),
    // The register pages' stills never animate: typing and climbing bars
    // stay off there exactly as before.
    reduced: !plays,
  }
}

export function LandingHero({
  liveCount = 0,
  totalLive = 0,
  hideStats = false,
  eyebrow,
  sceneKind,
  scene: sceneOverride,
  headline,
  subheader,
  invariant,
  ctaLabel,
  ctaHref,
  ctaSecondaryLabel,
  bandClassName,
  still = false,
  compact = false,
  stillActive,
  stillEpoch,
  ctaAfterMedia = false,
  children,
}: Props) {
  // IN THE HOME CAROUSEL the still phone takes How It Works' own column
  // (founder, 2026-10-19: "move the iphone in the demo to line up with the
  // 'How It Works' iphone vignette"): the same five-column grid with the
  // same gap, the pitch on three, the phone centred on two — so the hero's
  // handset and the pinned vignette below it share an axis. The register
  // pages' stand-alone stills keep the [1fr_auto] row.
  const inCarousel = stillActive !== undefined
  const scenes = useMemo(
    () =>
      sceneOverride
        ? [sceneOverride]
        : sceneKind
          ? SCENES.filter((s) => s.kind === sceneKind)
          : SCENES,
    [sceneKind, sceneOverride]
  )
  const { scene, phase, barWidths, fading, prefersReducedMotion, goToScene } =
    useDemoLoop(scenes)
  const beat = beatForPhase(phase)
  // The still phone's own beat (unused by the animated demo above).
  const stillBeat = useStillBeat(stillActive, scene, stillEpoch)

  const ctas = (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-3.5">
      {/* The hero's only conversion action under a display headline —
          poster-scale, not form-scale (founder call, 2026-07-28) */}
      <Button
        asChild
        size="lg"
        variant="secondary"
        // THE FREE PROMISE IS OUT OF THE HERO ENTIRELY (founder,
        // 2026-09-18, in two steps the same day: the quiet tail
        // "— always free" left the button — "maybe it just
        // elongates the button" — then the "Free to create"
        // caption went too, with its grouping wrapper). The hero
        // states no fee fact; the page still does — the trust grid
        // and the close-band tails carry it (landing.cta.primaryFree
        // and the *.close.cta strings keep "— always free", so
        // withQuietTail stays for labels that pass one).
        //
        // w-full sm:w-auto: on a phone the pair stack as two
        // full-width rows (founder, 2026-09-18) — wrapping classes
        // kept for the tail-carrying labels custom pages may pass.
        className="h-auto min-h-11 w-full shrink flex-wrap px-6 py-2 text-base whitespace-normal sm:w-auto"
      >
        <Link href={ctaHref ?? "/favpolls/new"}>
          {withQuietTail(ctaLabel ?? t("landing.cta.primary"))}
        </Link>
      </Button>
      {/* A SECOND PATH, HOME ONLY (founder, 2026-08-17). "Create a
          favpoll" names an invented noun, so on home it asks a
          first-time visitor to make a thing nothing has yet defined —
          unlike "Start fundraising", which names a goal the visitor
          already arrived with. ProcessOverview directly below does
          define it, and the page was relying on visitors scrolling to
          find that out. This makes the other path an offer rather than
          a hope.

          RESTORED ON THE REGISTER PAGES, 2026-08-26. This comment used
          to say they "already carry their own cta.secondary" — they
          carried the STRING and rendered nothing, so the only action in
          a register hero was "Create a memorial favpoll". Nobody four
          days into a bereavement clicks create before they have looked,
          and the register pages are where a cold visitor most often
          lands: a celebrant or a hospice forwards the link. They now
          pass their own label.
          Ghost in BAND ink — a wash and ring of the band's own
          foreground, the retired router cards' idiom — so it reads as the
          quieter of the two without vanishing when the theme flips.
          THE BORDER IS BACK (founder, 2026-09-18: "I'm tempted to make
          See how it works an outline for visibility") — a KNOWING
          reversal of his own 2026-08-18 "no border or ring" call
          (1px and a 0.5px hairline were auditioned then and stripped).
          What changed: the primary shed its quiet tail the same day,
          and stacked full-width on mobile a borderless ghost read as a
          stray text line. This puts the pair back on the style guide's
          tiers (bordered ghost = secondary).
          h-11 keeps both CTAs on one baseline.

          PADDING MATCHES THE PRIMARY'S so the two LABELS start at the
          same x (founder, 2026-08-18: "their text doesn't line up
          because of the different margin"). Stacked, both boxes begin at
          the column edge, so padding alone decides where each label
          lands — at px-3 against the primary's px-6 they sat 12px apart.
          An earlier pass pulled this the other way with -ml-3, putting
          the words on the column RAIL: level with the headline, but 24px
          left of the label directly above them. Wrong reading. Two
          buttons stacked read as a pair, and a pair lines up with itself
          before it lines up with the paragraph above.

          pr-6 IS AN OVERRIDE, not a repetition of px-6. Button's lg size
          carries has-data-[icon=inline-end]:pr-2, which trims the
          trailing side when a button ends in an icon — fair for a SOLID
          button, where the eye reads the filled edge. There is no edge
          here until hover, so it only rendered the wash lopsided, 24
          left against 8 right. Same variant, same property, declared
          after, so it wins.

          GONE ON PHONES (founder, 2026-10-27: "we don't need the See How
          button on mobile because the section immediately follows"). The
          same call the register pages took on 2026-10-21 ("let phone
          visitors scroll. they will naturally do that anyway"). It is a
          button that scrolls to something one short gesture away, and on a
          phone the two CTAs stack full-width, so it also costs the fold a
          whole row. max-sm: rather than a matchMedia test, so the
          breakpoint cannot drift from the w-full/sm:w-auto pair beside
          it. */}
      {ctaSecondaryLabel && (
        <Button
          asChild
          size="lg"
          variant="ghost"
          className="h-11 w-full border border-primary-foreground/40 px-6 text-base text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground has-data-[icon=inline-end]:pr-6 max-sm:hidden sm:w-auto"
        >
          {/* The arrow says WHERE it goes (founder, 2026-08-17): every
              other button on this page navigates, and this one scrolls
              the reader down the same page — which is a different
              promise, and the only one a visitor can be disappointed by
              if they expect a new page. */}
          <Link
            href="#how"
            // Explicit scroll on EVERY click (founder bug report,
            // 2026-09-03): with a bare hash link, the second click
            // is a no-op — the URL already ends #how, so nothing
            // changes and the browser won't re-scroll. The href
            // stays for semantics and no-JS.
            onClick={(e) => {
              e.preventDefault()
              document
                .getElementById("how")
                ?.scrollIntoView({ behavior: "smooth" })
            }}
          >
            {ctaSecondaryLabel}
            <ArrowDown data-icon="inline-end" aria-hidden="true" />
          </Link>
        </Button>
      )}
    </div>
  )

  return (
    <section
      className={cn(
        // Full-screen band (founder, 2026-08-05): the hero fills the
        // viewport below the h-14 nav, content vertically centred —
        // min-h, not h, so short phones never clip.
        // min-h, not h, so short phones never clip. EVERY variant fills the
        // screen, stills included: the slab of empty band under the still
        // was never this — it was the phone's box laying out at its
        // unscaled 868px (see PHONE_SCALED_BOX). Fix the box and min-h does
        // what it does on the home page, with items-center holding the
        // content in the middle of it.
        "relative flex items-center",
        // Compact: no viewport floor — the band is as tall as the pitch
        // and the (smaller) phone, and the page's next section shows.
        !compact && "min-h-[calc(100vh-3.5rem)]",
        bandClassName ?? "bg-primary text-primary-foreground"
      )}
    >
      <HeroTexture />
      {/* Both layouts put the cards on the page's three-column rhythm: the
          row uses grid-cols-3 with the same 2rem gutter as the three-beat
          band below, and the demo column uses calc((100%-4rem)/3) — the same
          402.7px, right-aligned to the container. At the original 44rem the
          cards covered 35% of the band on a 1440 laptop and read as white
          slabs; a third of the container is the fix. */}
      <div
        className={cn(
          // ONE LEFT RAIL WITH THE REST OF THE PAGE (founder, 2026-08-18: "do you
          // think it would be better if the hero content lined up with the
          // favpoll brand text?").
          //
          // It did not line up with anything. Below md the hero was CENTRED by
          // a max-width with no padding, so its rail was (viewport - 348) / 2
          // and drifted with the screen, while the header logo and every
          // section on the page sit at a fixed 24:
          //
          //   390   header 24   sections 24   hero 21
          //   430   header 24   sections 24   hero 41
          //   700   header 24   sections 24   hero 150
          //
          // On a desktop it happened to land on 24, which is why it read as
          // deliberate. Padding it like everything else pins it at 24 at every
          // width, and md:max-w-330 still governs above.
          //
          // The cost, accepted: between 640 and 767 the content is no longer
          // capped at 400 and stretches to the full padded width. That is what
          // every other band does there, and md brings the two-column layout
          // in at 768 regardless.
          "relative mx-auto grid w-full gap-8 px-6 py-10 md:max-w-330",
          still
            ? // STILL: ONE ROW. The demo layout is grid-rows-[auto_auto]
              // with the media spanning both, which works when the stats
              // occupy row 2. A register page hides the stats, so row 2 is
              // empty, the pitch sits in row 1 alone, and items-center
              // centres it against nothing — every pixel of slack fell
              // below the text while the phone ran on past it. One row
              // makes the two columns siblings, so they centre against
              // each other. The media track is `auto`: the phone is a
              // fixed chassis and must not be squeezed by a 1fr share.
              inCarousel
              ? "md:grid-cols-5 md:items-center md:gap-x-6 md:py-12"
              : "md:grid-cols-[1fr_auto] md:items-center md:gap-x-12 md:py-12"
            : // COLUMN: the demo hero the register pages mount — the demo
              // card is 400px, so the last-of-three column still holds it.
              // minmax, NOT the bare third (2026-08-22). The demo card is a
              // FIXED 400px and a grid item cannot shrink below its
              // min-content, so whenever a third of the container came to
              // less than 400 — which is every width below about 1300 — the
              // column refused to shrink and the whole PAGE grew instead.
              // Measured before: +157px of horizontal scroll at 768, +72 at
              // 1024, +20 at 1180, on all three register pages.
              // The floor is the card's own width; above ~1300 the third is
              // wider and takes over, so the three-column rhythm the original
              // was reaching for is unchanged where it was ever achieved.
              "md:grid-cols-[1fr_minmax(25rem,calc((100%-4rem)/3))] md:grid-rows-[auto_auto] md:items-center md:gap-x-12 md:gap-y-8 md:py-12"
        )}
      >
        {/* Pitch (headline + CTA). Stats are a separate cell below, so on
            mobile the demo comes right after the pitch. */}
        <div
          className={cn(
            "min-w-0",
            inCarousel && "md:col-span-3",
            !still && "md:col-start-1 md:row-start-1"
          )}
        >
          {/* Single, register-agnostic headline — names the three-beat
              mechanic the demo plays out; the subheader carries the soul.
              Each sentence takes its own line so the triad never wraps
              mid-beat. */}
          {eyebrow && (
            <p className="mb-4 text-xs font-medium tracking-widest uppercase opacity-80">
              {eyebrow}
            </p>
          )}
          {/* In row mode the headline has the whole band to itself, so it
              scales up to hold that width — otherwise the pitch fills the
              left 40% and leaves ~700px of empty purple beside it. The 6xl
              step waits for 2xl: at 1280–1440 the extra 40px of line height
              is the difference between the hero fitting a laptop and not.

              max-w-3xl in BOTH modes (2026-08-06) — a partial win, recorded
              honestly. It buys /fundraisers a line back (4 → 3) and costs
              nothing anywhere, but it does NOT give the register pages home's
              beats-never-wrap poster. Measured: the register first-beats need
              784 / 773 / 788px at 48px type against a 768px cap, so they were
              only just overshooting; but the binding constraint below 1280 is
              the demo layout's pitch COLUMN, which is 795px at 1280 and 624px
              at 1024. No cap fixes 624. Home's beats are 404–427px — half the
              width — which is why the poster works there and not here. If the
              register headlines should hold one line, that is a COPY change
              (shorter first beats), not a layout one. */}
          {/* max-w-[33.75rem] (540px), not max-w-xl (founder, 2026-10-19):
              the register headlines' charity line breaks in two — "Give to
              charity in their / memory." — and the fundraiser's "Give to
              charity in support." (542px rendered at 48px) fitted a 576px box
              on one line, so the three slides stopped rhyming. 540 breaks it
              after "in"; the hook's two short sentences ("Pick their topic."
              "Poll favourites.", since 2026-10-19) take a line each —
              measured: four lines on all three slides. */}
          <h1
            className={cn(
              "mb-6 text-4xl leading-[1.12] font-light tracking-tight md:text-5xl",
              // EXPERIMENT (2026-08-26): register headlines capped so every
              // beat wraps to exactly two lines — 446-595px is the window
              // where the widest beat (892) does not reach three and the
              // narrowest (595) does not stay on one.
              sceneKind ? "max-w-[33.75rem]" : "max-w-3xl"
            )}
          >
            {/* REGISTER HEADLINES DIM AFTER THE FIRST SENTENCE (founder,
                2026-09-04): the hook holds full white, the supporting
                sentence steps back. ONLY when a register passes its own
                headline — the landing default is three PARALLEL beats
                (Pick · Pledge · Reveal) where dimming any would break
                the triad. */}
            {(headline ?? t("landing.headline"))
              .split(". ")
              .map((sentence, i, all) => (
                <span
                  key={sentence}
                  // THE HOOK IS EVERYTHING BUT THE LAST SENTENCE (founder,
                  // 2026-10-19: "Pick a topic. Poll favourites." — two
                  // beats of hook, then the charity line steps back). For
                  // a two-sentence headline this is what it always was.
                  className={cn(
                    "block",
                    headline && i === all.length - 1 && i > 0 && "opacity-70"
                  )}
                >
                  {sentence}
                  {i < all.length - 1 ? "." : ""}
                </span>
              ))}
          </h1>
          <p
            className={cn(
              invariant ? "mb-3" : "mb-8",
              "text-lg leading-relaxed opacity-80",
              // The subheader must not be WIDER than the headline above it.
              sceneKind ? "max-w-xl" : "max-w-md"
            )}
          >
            {subheader ?? t("landing.subheader")}
          </p>
          {invariant && (
            /* A fact, not soul: full ink and a touch of weight, so it is
               the one sentence that cannot be skimmed past. Same width
               rule as the subheader. */
            <p
              className={cn(
                "mb-8 text-base leading-relaxed font-medium",
                sceneKind ? "max-w-xl" : "max-w-md"
              )}
            >
              {invariant}
            </p>
          )}
          {children}
          {/* The CTA pair — or, with ctaAfterMedia, only from md up; below
              it the pair renders again after the phone (see the media
              cell), so a phone reads text, handset, buttons. */}
          <div className={cn(ctaAfterMedia && "hidden md:block")}>{ctas}</div>
        </div>

        {/* Right — live demo in a browser-style frame. Rendered at full
            logical size (nothing cropped — the real experience) and optically
            scaled: 80% on md+, 68% on phones so the same card fits a
            ~360px-wide screen. On mobile it stacks directly under the pitch,
            before the stats, so the demo is the first thing a visitor scrolls
            to. */}
        <div
          className={cn(
            inCarousel && "md:col-span-2",
            !still && "md:col-start-2 md:row-span-2 md:row-start-1"
          )}
        >
          {still ? (
            /* mx-auto below md: stacked under the pitch the phone sat on
               the left edge — centre it (founder, 2026-09-13). On md+ it
               keeps its place in the media column. */
            <div
              className={cn(
                compact ? PHONE_SCALED_BOX_COMPACT : PHONE_SCALED_BOX,
                inCarousel ? "mx-auto" : "mx-auto md:mx-0"
              )}
            >
              {/* text-foreground: the home carousel's band sets white
                  text, and anything in the card without a colour of its
                  own (Cancel, Back, the unchosen presets, the summary
                  rows) inherited it — white on white (founder,
                  2026-10-18: "some of the text isn't visible"). The
                  animated branch below always reset it. */}
              <div
                className={cn(
                  "origin-top-left text-foreground",
                  compact ? PHONE_SCALE_COMPACT : PHONE_SCALE
                )}
              >
                <PhoneFrame>
                  <DemoCard
                    scene={scene}
                    phase={stillBeat.phase}
                    barWidths={stillBeat.barWidths}
                    prefersReducedMotion={stillBeat.reduced}
                    device="phone"
                    className="rounded-none border-0"
                  />
                </PhoneFrame>
              </div>
            </div>
          ) : (
            <>
              <span className="sr-only">
                Animated demonstration of how favpoll works. It cycles through
                the different kinds of favpoll automatically; use the buttons
                below to jump to one.
              </span>
              {/* Kind nav — jump the demo to a kind of favpoll, disrupting the
              auto-cycle so a visitor doesn't wait for their kind to come round. */}
              {!sceneKind && (
                <div
                  className="mb-4 flex flex-wrap justify-start gap-2 md:justify-center"
                  role="group"
                  aria-label="Preview a kind of favpoll"
                >
                  {NAV_TABS.map((tab) => {
                    const active = tab.kind === scene.kind
                    return (
                      <Button
                        key={tab.label}
                        type="button"
                        size="sm"
                        variant={active ? "secondary" : "ghost"}
                        aria-pressed={active}
                        onClick={() => goToScene(tab.sceneIndex)}
                        className={cn(
                          "rounded-full",
                          !active &&
                            "border border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                        )}
                      >
                        {tab.label}
                      </Button>
                    )
                  })}
                </div>
              )}
              {/* Not a live region: the demo loops for ever and is
                  aria-hidden inside the phone, so announcing each
                  cycle only talked over the page (a11y audit,
                  2026-10-19). */}
              <div
                className="transition-opacity duration-400"
                style={{ opacity: fading ? 0 : 1 }}
              >
                {/* A THIRD STOP BELOW 360 (2026-08-22). The card is 500 wide
                    laid out and scaled to fit a fixed box — 0.62 gives 310,
                    which is wider than the 272 a 320px phone has after the
                    page's padding, so the smallest phones scrolled sideways
                    by 14px. 0.54 gives 270 and fits. */}
                <div className="h-94 w-[16.875rem] min-[360px]:h-108 min-[360px]:w-[19.4rem] sm:h-[34.8rem] sm:w-100">
                  <div className="h-174 w-125 origin-top-left scale-[0.54] text-foreground min-[360px]:scale-[0.62] sm:scale-80">
                    <DemoFrame>
                      <DemoCard
                        scene={scene}
                        phase={phase}
                        barWidths={barWidths}
                        prefersReducedMotion={prefersReducedMotion}
                        className="rounded-t-none border-t-0"
                      />
                    </DemoFrame>
                  </div>
                </div>
                {/* Beat indicator: which of the three beats the loop is in */}
                <div
                  className="mt-3 flex w-[16.875rem] items-center justify-start gap-4 min-[360px]:w-[19.4rem] sm:w-100 md:justify-center"
                  aria-hidden="true"
                >
                  {BEATS.map((label, i) => (
                    <span
                      key={label}
                      className={`flex items-center gap-1.5 text-xs font-medium tracking-[0.07em] uppercase transition-opacity duration-300 ${
                        i === beat ? "opacity-90" : "opacity-40"
                      }`}
                    >
                      <span
                        className={`h-1 w-6 rounded-full transition-colors duration-300 ${
                          i === beat
                            ? "bg-primary-foreground"
                            : "bg-primary-foreground/30"
                        }`}
                      />
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* THE BUTTONS UNDER THE PHONE (founder, 2026-10-15, on the home
            carousel at phone width: "the buttons should be below the
            iphone"): below md the hero stacks pitch over handset, and the
            CTA pair had sat between them — the thing to tap above the thing
            that shows what you'd be making. With ctaAfterMedia the pair
            renders here instead, after the phone; from md up it stays in
            the pitch column (hidden md:block above). They keep the settled
            full-width stack (#904): "Create a celebration favpoll" and "See
            how it works" do not share a 390px row without shrinking. */}
        {ctaAfterMedia && <div className="md:hidden">{ctas}</div>}

        {/* A flex row: the stats live in the narrow pitch column. The row
            variant — three columns on the register router cards' own gutter,
            so each figure sat under a card (founder, 2026-08-05) — went with
            the cards on 2026-10-21. */}
        {!hideStats && (
          <dl
            className={cn(
              "gap-y-6 border-t border-primary-foreground/20 pt-8",
              "flex flex-wrap gap-x-14"
            )}
          >
            <div>
              <dt className="text-xs font-medium tracking-widest uppercase opacity-70">
                Open <br className="sm:hidden" />
                favpolls
              </dt>
              <dd className="mt-1 text-3xl font-light tabular-nums">
                <CountUp
                  value={liveCount}
                  format={(n) => String(Math.round(n))}
                />
              </dd>
            </div>
            {totalLive > 0 && (
              <div>
                <dt className="text-xs font-medium tracking-widest uppercase opacity-70">
                  Raised <br className="sm:hidden" />
                  so far
                </dt>
                <dd className="mt-1 text-3xl font-light tabular-nums">
                  <CountUp
                    value={totalLive}
                    format={(n) =>
                      formatCurrency(Math.round(n), MARKET_DEFAULTS["en-GB"])
                    }
                  />
                </dd>
              </div>
            )}
            <div>
              <dt className="text-xs font-medium tracking-widest uppercase opacity-70">
                Reaches <br className="sm:hidden" />
                charity
              </dt>
              <dd className="mt-1 text-3xl font-light tabular-nums">
                <CountUp value={100} format={(n) => `${Math.round(n)}%`} />
              </dd>
            </div>
          </dl>
        )}
      </div>
    </section>
  )
}
